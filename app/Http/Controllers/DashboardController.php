<?php

namespace App\Http\Controllers;

use App\Models\Item;
use App\Models\Laboratory;
use App\Models\Transaction;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $totalItems = Item::query()->count();

        $borrowed = Item::query()
            ->where('status', Item::STATUS_IN_USE)
            ->whereRaw('is_decommissioned IS NOT TRUE')
            ->count();

        $damaged = Item::query()
            ->where('item_condition', Item::CONDITION_DAMAGED)
            ->whereRaw('is_decommissioned IS NOT TRUE')
            ->count();

        $totalUsers = User::query()->count();

        $recentActivity = Transaction::query()
            ->with([
                'item.location.laboratory',
                'user',
            ])
            ->latest('transacted_at')
            ->limit(5)
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
            ->with(['location.laboratory'])
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
            'stats' => [
                'totalItems' => $totalItems,
                'borrowed' => $borrowed,
                'damaged' => $damaged,
                'totalUsers' => $totalUsers,
            ],
            'lowStock' => $lowStock,
            'recentActivity' => $recentActivity,
            'laboratoryStatus' => $laboratoryStatus,
        ]);
    }
}
