<?php

namespace App\Http\Controllers;

use App\Models\Item;
use App\Models\Transaction;
use App\Models\User;
use App\Notifications\NewTransactionNotification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class TransactionController extends Controller
{
    private const ITEMS_CACHE_KEY = 'transactions:index:items';

    private const BORROWERS_CACHE_KEY = 'transactions:index:borrowers';

    private const TRANSACTIONS_CACHE_KEY = 'transactions:index:list';

    public function index(): Response
    {
        $items = Cache::remember(self::ITEMS_CACHE_KEY, now()->addSeconds(30), fn () => Item::query()
            ->active()
            ->orderBy('name')
            ->get(['id', 'name', 'sku', 'quantity'])
            ->map(fn (Item $item) => [
                'id' => $item->id,
                'name' => $item->name,
                'sku' => $item->sku,
                'stock' => (int) $item->quantity,
            ])
            ->values()
            ->all());

        $borrowers = Cache::remember(self::BORROWERS_CACHE_KEY, now()->addMinutes(2), fn () => User::query()
            ->where('status', User::STATUS_ACTIVE)
            ->orderByRaw('COALESCE(name, username, email)')
            ->get(['id', 'name', 'username', 'email', 'id_number'])
            ->map(fn (User $u) => [
                'id' => $u->id,
                'label' => $u->displayName(),
                'id_number' => $u->id_number,
            ])
            ->values()
            ->all());

        $transactions = Cache::remember(self::TRANSACTIONS_CACHE_KEY, now()->addSeconds(20), function () {
            return Transaction::query()
                ->with(['item', 'user'])
                ->latest('transacted_at')
                ->limit(100)
                ->get()
                ->map(function (Transaction $transaction) {
                    $user = $transaction->user;

                    return [
                        'id' => $transaction->id,
                        'displayId' => 'TRX-'.str_pad((string) $transaction->id, 3, '0', STR_PAD_LEFT),
                        'item' => $transaction->item?->name ?? '—',
                        'user' => $user?->name
                            ?? $user?->username
                            ?? $user?->email
                            ?? '—',
                        'type' => match ($transaction->transaction_type) {
                            Transaction::TYPE_BORROW => 'Borrow',
                            Transaction::TYPE_STOCK_IN => 'Stock in',
                            Transaction::TYPE_STOCK_OUT => 'Stock out',
                            Transaction::TYPE_TRANSFER => 'Transfer',
                            Transaction::TYPE_ADJUSTMENT => 'Adjustment',
                            default => ucfirst(str_replace('_', ' ', (string) $transaction->transaction_type)),
                        },
                        'borrowDate' => $transaction->transacted_at?->format('Y-m-d') ?? '—',
                        'returnDate' => $transaction->expected_return_date
                            ? $transaction->expected_return_date->format('Y-m-d')
                            : '—',
                        'status' => ucfirst((string) $transaction->status),
                        'conditionOut' => '—',
                        'canReturnItem' => $transaction->transaction_type === Transaction::TYPE_BORROW
                            && in_array($transaction->status, [
                                Transaction::STATUS_ISSUED,
                                Transaction::STATUS_ACTIVE,
                            ], true),
                    ];
                })
                ->values()
                ->all();
        });

        return Inertia::render('Transactions', [
            'items' => $items,
            'transactions' => $transactions,
            'borrowers' => $borrowers,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'user_id' => ['required', 'integer', Rule::exists('users', 'id')],
            'item_id' => [
                'required',
                'integer',
                Rule::exists('items', 'id')->whereNull('deleted_at'),
            ],
            'quantity' => ['required', 'integer', 'min:1'],
            'transaction_type' => ['required', 'string', Rule::in([Transaction::TYPE_BORROW])],
            'remarks' => ['nullable', 'string', 'max:2000'],
            'transacted_at' => ['nullable', 'date'],
            'expected_return_date' => ['nullable', 'date'],
        ]);

        try {
            $createdTransaction = null;

            DB::transaction(function () use ($validated, &$createdTransaction) {
                /** @var Item $item */
                $item = Item::query()
                    ->lockForUpdate()
                    ->findOrFail($validated['item_id']);

                if ($validated['quantity'] > $item->quantity) {
                    throw ValidationException::withMessages([
                        'quantity' => 'Insufficient stock available.',
                    ]);
                }

                $createdTransaction = Transaction::create([
                    'item_id' => $item->id,
                    'user_id' => (int) $validated['user_id'],
                    'transaction_type' => $validated['transaction_type'],
                    'quantity' => $validated['quantity'],
                    'status' => Transaction::STATUS_ISSUED,
                    'remarks' => $validated['remarks'] ?? null,
                    'transacted_at' => isset($validated['transacted_at'])
                        ? $validated['transacted_at']
                        : now(),
                    'expected_return_date' => $validated['expected_return_date'] ?? null,
                ]);

                $item->quantity = $item->quantity - $validated['quantity'];
                $item->save();
            });

            if ($createdTransaction) {
                $createdTransaction->loadMissing(['item:id,name,sku', 'user:id,name,username,email']);
                User::query()
                    ->where('status', User::STATUS_ACTIVE)
                    ->where('role', User::ROLE_ADMIN)
                    ->each(fn (User $admin) => $admin->notify(new NewTransactionNotification($createdTransaction)));
            }
        } catch (ValidationException $e) {
            return redirect()->back()->withErrors($e->errors())->withInput();
        }

        Cache::forget(DashboardController::STATS_CACHE_KEY);
        $this->forgetTransactionCaches();

        return redirect()->back()->with('success', 'Transaction recorded successfully.');
    }

    public function returnItem(Transaction $transaction): RedirectResponse
    {
        try {
            DB::transaction(function () use ($transaction): void {
                /** @var Transaction $locked */
                $locked = Transaction::query()->lockForUpdate()->findOrFail($transaction->id);

                if ($locked->transaction_type !== Transaction::TYPE_BORROW) {
                    throw ValidationException::withMessages([
                        'return' => 'Only borrow transactions can be returned.',
                    ]);
                }

                if (! in_array($locked->status, [Transaction::STATUS_ISSUED, Transaction::STATUS_ACTIVE], true)) {
                    throw ValidationException::withMessages([
                        'return' => 'This transaction is not eligible for return.',
                    ]);
                }

                /** @var Item $item */
                $item = Item::query()->lockForUpdate()->findOrFail($locked->item_id);

                $qty = (int) $locked->quantity;

                $locked->update([
                    'status' => Transaction::STATUS_COMPLETED,
                ]);

                // Stock lives on `items.quantity` (see Item model / migrations; `current_stock` is an alias via mutator only).
                $item->increment('quantity', $qty);
            });
        } catch (ValidationException $e) {
            return redirect()->back()->with(
                'error',
                collect($e->errors())->flatten()->first() ?? 'Unable to process return.',
            );
        }

        Cache::forget(DashboardController::STATS_CACHE_KEY);
        $this->forgetTransactionCaches();

        return redirect()->back()->with('success', 'Item returned successfully.');
    }

    private function forgetTransactionCaches(): void
    {
        Cache::forget(self::ITEMS_CACHE_KEY);
        Cache::forget(self::BORROWERS_CACHE_KEY);
        Cache::forget(self::TRANSACTIONS_CACHE_KEY);
    }
}
