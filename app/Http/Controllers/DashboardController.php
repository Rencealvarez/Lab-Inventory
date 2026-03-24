<?php

namespace App\Http\Controllers;

use App\Models\Item;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $totalItems = Item::count();

        $borrowed = Schema::hasColumn('transactions', 'status')
            ? Transaction::where('status', 'issued')->count()
            : Transaction::where('transaction_type', Transaction::TYPE_STOCK_OUT)->count();

        // "Damaged" can be represented either by `items.status = damaged` or `items.item_condition = damaged`.
        $hasItemCondition = Schema::hasColumn('items', 'item_condition');
        $hasStatus = Schema::hasColumn('items', 'status');

        $damaged = 0;
        if ($hasItemCondition || $hasStatus) {
            $damaged = Item::query()->where(function ($q) use ($hasItemCondition, $hasStatus) {
                $started = false;

                if ($hasItemCondition) {
                    $q->where('item_condition', 'damaged');
                    $started = true;
                }

                if ($hasStatus) {
                    if ($started) {
                        $q->orWhere('status', 'damaged');
                    } else {
                        $q->where('status', 'damaged');
                    }
                }
            })->count();
        }

        $totalUsers = User::count();

        // Low stock: `current_stock <= min_stock_alert` (fallback: `quantity <= min_stock_alert`).
        $lowStock = [];
        if (Schema::hasColumn('items', 'min_stock_alert')) {
            $currentStockColumn = Schema::hasColumn('items', 'current_stock')
                ? 'current_stock'
                : 'quantity';

            $lowStockItems = Item::with('location.laboratory')
                ->whereColumn($currentStockColumn, '<=', 'min_stock_alert')
                ->orderBy($currentStockColumn, 'asc')
                ->get();

            $lowStock = $lowStockItems->map(function (Item $item) use ($currentStockColumn) {
                return [
                    'item' => $item->name,
                    'lab' => $item->location?->laboratory?->name ?? '',
                    'left' => $item->{$currentStockColumn},
                ];
            })->values()->all();
        }

        $recentActivityQuery = Transaction::with([
            'item',
            'user',
            'item.location.laboratory',
        ]);

        if (Schema::hasColumn('transactions', 'status')) {
            $recentActivityQuery->where('status', 'issued');
        } else {
            $recentActivityQuery->where('transaction_type', Transaction::TYPE_STOCK_OUT);
        }

        $recentActivity = $recentActivityQuery
            ->orderByDesc('transacted_at')
            ->take(5)
            ->get()
            ->map(function (Transaction $transaction) {
                return [
                    'item' => $transaction->item?->name ?? '',
                    'borrower' => $transaction->user?->name
                        ?? $transaction->user?->username
                        ?? $transaction->user?->email
                        ?? '',
                    'lab' => $transaction->item?->location?->laboratory?->name ?? '',
                    'time' => $transaction->transacted_at?->toIso8601String(),
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
        ]);
    }
}

