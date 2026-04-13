<?php

namespace App\Http\Controllers;

use App\Models\Item;
use App\Models\Laboratory;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public const STATS_CACHE_KEY = 'dashboard.stats';

    private const STATS_CACHE_TTL_SECONDS = 300;

    public function index(): Response
    {
        $stats = Cache::remember(self::STATS_CACHE_KEY, self::STATS_CACHE_TTL_SECONDS, function () {
            return [
                'totalItems' => Item::query()->count(),
                'borrowed' => (int) Transaction::query()
                    ->whereIn('status', [Transaction::STATUS_ACTIVE, Transaction::STATUS_ISSUED])
                    ->where('transaction_type', Transaction::TYPE_BORROW)
                    ->sum('quantity'),
                'damaged' => Item::query()
                    ->whereRaw('is_decommissioned IS NOT TRUE')
                    ->whereIn('status', [
                        Item::STATUS_DAMAGED,
                        Item::STATUS_UNDER_REPAIR,
                    ])
                    ->count(),
                'totalUsers' => User::query()->count(),
            ];
        });

        $recentActivity = Transaction::query()
            ->select(['id', 'item_id', 'user_id', 'transaction_type', 'transacted_at'])
            ->with([
                'item:id,name,location_id',
                'item.location:id,name,laboratory_id',
                'item.location.laboratory:id,name',
                'user:id,name,username,email',
            ])
            ->latest('transacted_at')
            ->take(5)
            ->get()
            ->map(function (Transaction $transaction) {
                $user = $transaction->user;

                return [
                    'id' => $transaction->id,
                    'item' => $transaction->item?->name ?? '—',
                    'borrower' => $user?->name
                        ?? $user?->username
                        ?? $user?->email
                        ?? '—',
                    'lab' => $transaction->item?->location?->laboratory?->name ?? '—',
                    'time' => $transaction->transacted_at?->toIso8601String(),
                    'typeLabel' => match ($transaction->transaction_type) {
                        Transaction::TYPE_BORROW => 'Borrow',
                        Transaction::TYPE_STOCK_IN => 'Stock in',
                        Transaction::TYPE_STOCK_OUT => 'Stock out',
                        Transaction::TYPE_TRANSFER => 'Transfer',
                        Transaction::TYPE_ADJUSTMENT => 'Adjustment',
                        default => ucfirst(str_replace('_', ' ', (string) $transaction->transaction_type)),
                    },
                ];
            })
            ->values()
            ->all();

        $lowStock = Item::query()
            ->select(['id', 'name', 'quantity', 'location_id', 'min_stock_alert'])
            ->with([
                'location:id,name,laboratory_id',
                'location.laboratory:id,name',
            ])
            ->whereRaw('is_decommissioned IS NOT TRUE')
            ->whereNotNull('min_stock_alert')
            ->where('min_stock_alert', '>', 0)
            ->whereColumn('quantity', '<=', 'min_stock_alert')
            ->orderBy('quantity')
            ->limit(50)
            ->get()
            ->map(function (Item $item) {
                return [
                    'id' => $item->id,
                    'item' => $item->name,
                    'lab' => $item->location?->laboratory?->name ?? $item->location?->name ?? '—',
                    'left' => (int) $item->quantity,
                ];
            })
            ->values()
            ->all();

        $laboratoryStatus = Laboratory::query()
            ->select(['id', 'name', 'status', 'capacity'])
            ->withCount('items')
            ->orderBy('name')
            ->get()
            ->map(function (Laboratory $lab) {
                $occupancy = 0;
                if ($lab->capacity && $lab->capacity > 0) {
                    $occupancy = min(100, (int) round(($lab->items_count / $lab->capacity) * 100));
                }

                $statusLabel = match ($lab->status) {
                    Laboratory::STATUS_MAINTENANCE => 'Maintenance',
                    Laboratory::STATUS_INACTIVE => 'Inactive',
                    default => 'Active',
                };

                $statusTone = match ($lab->status) {
                    Laboratory::STATUS_MAINTENANCE => 'bg-orange-100 text-orange-700 border-orange-200',
                    Laboratory::STATUS_INACTIVE => 'bg-gray-100 text-gray-700 border-gray-200',
                    default => 'bg-green-100 text-green-700 border-green-200',
                };

                return [
                    'id' => $lab->id,
                    'name' => $lab->name,
                    'status' => $statusLabel,
                    'statusTone' => $statusTone,
                    'occupancy' => $occupancy,
                    'assigned' => $lab->items_count,
                ];
            })
            ->values()
            ->all();

        return Inertia::render('Dashboard', [
            'stats' => $stats,
            'lowStock' => $lowStock,
            'recentActivity' => $recentActivity,
            'laboratoryStatus' => $laboratoryStatus,
        ]);
    }
}
