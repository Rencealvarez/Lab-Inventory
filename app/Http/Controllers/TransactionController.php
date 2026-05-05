<?php

namespace App\Http\Controllers;

use App\Models\FacilityReservation;
use App\Models\IncidentReport;
use App\Models\Item;
use App\Models\Laboratory;
use App\Models\Transaction;
use App\Models\TransactionBorrowRequest;
use App\Models\TransactionReturnRequest;
use App\Models\User;
use App\Notifications\NewTransactionNotification;
use App\Notifications\TransactionBorrowRequestNotification;
use App\Notifications\TransactionBorrowRequestReviewedNotification;
use App\Notifications\TransactionReturnRequestNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Notifications\Notification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Schema;
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
    private const TRANSACTION_IDS_CACHE_KEY = 'transactions:index:list:ids';

    public function index(): Response
    {
        $viewer = request()->user();
        $isStaff = $viewer && $viewer->isStaff();

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

        $borrowers = $isStaff
            ? [
                [
                    'id' => $viewer->id,
                    'label' => $viewer->displayName(),
                    'id_number' => $viewer->id_number,
                ],
            ]
            : Cache::remember(self::BORROWERS_CACHE_KEY, now()->addMinutes(2), fn () => User::query()
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

        $transactionRows = $isStaff
            ? Transaction::query()
                ->with(['item', 'user'])
                ->where('user_id', $viewer->id)
                ->latest('transacted_at')
                ->limit(100)
                ->get()
            : (function () {
                $ids = Cache::remember(self::TRANSACTION_IDS_CACHE_KEY, now()->addSeconds(20), fn () => Transaction::query()
                    ->latest('transacted_at')
                    ->limit(100)
                    ->pluck('id')
                    ->all());

                if (empty($ids)) {
                    return collect();
                }

                return Transaction::query()
                    ->with(['item', 'user'])
                    ->whereIn('id', $ids)
                    ->orderByDesc('transacted_at')
                    ->get();
            })();

        $pendingReturnByTransactionId = [];
        if ($transactionRows->isNotEmpty()) {
            $pendingIds = TransactionReturnRequest::query()
                ->whereIn('transaction_id', $transactionRows->pluck('id'))
                ->where('status', TransactionReturnRequest::STATUS_PENDING)
                ->pluck('transaction_id')
                ->all();
            $pendingReturnByTransactionId = array_fill_keys($pendingIds, true);
        }

        $transactions = $transactionRows
            ->map(function (Transaction $transaction) use ($isStaff, $viewer, $pendingReturnByTransactionId) {
                $user = $transaction->user;

                $eligibleReturn = $transaction->transaction_type === Transaction::TYPE_BORROW
                    && in_array($transaction->status, [
                        Transaction::STATUS_ISSUED,
                        Transaction::STATUS_ACTIVE,
                    ], true);

                if ($isStaff) {
                    $eligibleReturn = $eligibleReturn
                        && (int) $transaction->user_id === (int) $viewer->id;
                }

                $pendingReturn = isset($pendingReturnByTransactionId[$transaction->id]);

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
                    'canReturnItem' => ! $isStaff && $eligibleReturn && ! $pendingReturn,
                    'canApproveReturnRequest' => ! $isStaff && $eligibleReturn && $pendingReturn,
                    'canSubmitReturnRequest' => $isStaff && $eligibleReturn && ! $pendingReturn,
                    'returnRequestPending' => $isStaff && $pendingReturn,
                    'hasPendingReturnRequest' => $pendingReturn,
                ];
            })
            ->values()
            ->all();

        $borrowRequestRows = $isStaff
            ? TransactionBorrowRequest::query()
                ->with(['item:id,name,sku'])
                ->where('requested_by', $viewer->id)
                ->where('status', '!=', TransactionBorrowRequest::STATUS_APPROVED)
                ->latest()
                ->limit(50)
                ->get()
            : TransactionBorrowRequest::query()
                ->with(['item:id,name,sku', 'requester:id,name,username,email'])
                ->where('status', TransactionBorrowRequest::STATUS_PENDING)
                ->latest()
                ->limit(50)
                ->get();

        $borrowRequests = $borrowRequestRows
            ->map(function (TransactionBorrowRequest $request) use ($isStaff) {
                return [
                    'id' => $request->id,
                    'displayId' => 'BRQ-'.str_pad((string) $request->id, 3, '0', STR_PAD_LEFT),
                    'item' => $request->item?->name ?? '—',
                    'itemSku' => $request->item?->sku ?? '—',
                    'requester' => $request->requester?->displayName() ?? '—',
                    'quantity' => (int) $request->quantity,
                    'status' => ucfirst((string) $request->status),
                    'requestedAt' => $request->created_at?->format('Y-m-d') ?? '—',
                    'requestedForDate' => $request->requested_for_date?->format('Y-m-d') ?? '—',
                    'expectedReturnDate' => $request->expected_return_date?->format('Y-m-d') ?? '—',
                    'remarks' => $request->remarks ?? '—',
                    'rejectionReason' => $request->rejection_reason,
                    'canApprove' => ! $isStaff && $request->status === TransactionBorrowRequest::STATUS_PENDING,
                    'canReject' => ! $isStaff && $request->status === TransactionBorrowRequest::STATUS_PENDING,
                ];
            })
            ->values()
            ->all();

        $facilityMapper = app(FacilityReservationController::class);

        $facilitiesForReservation = [];
        $facilityReservationRows = [];

        if ($isStaff && Schema::hasTable('facility_reservations')) {
            $facilityReservationRows = FacilityReservation::query()
                ->with(['laboratory.department:id,name', 'requester:id,name,username,email'])
                ->where('requested_by', $viewer->id)
                ->latest()
                ->limit(50)
                ->get()
                ->map(fn (FacilityReservation $r) => $facilityMapper->mapForStaff($r))
                ->values()
                ->all();

            $facilitiesForReservation = Laboratory::query()
                ->with('department:id,name')
                ->where('status', Laboratory::STATUS_ACTIVE)
                ->orderBy('name')
                ->get()
                ->map(fn (Laboratory $lab) => [
                    'id' => $lab->id,
                    'lab_name' => $lab->name,
                    'building_name' => $lab->department?->name ?? '—',
                ])
                ->values()
                ->all();
        }

        return Inertia::render('Transactions', [
            'items' => $items,
            'transactions' => $transactions,
            'borrowRequests' => $borrowRequests,
            'borrowers' => $borrowers,
            'canManageTransactions' => ! $isStaff,
            'canRequestBorrow' => (bool) $isStaff,
            'canReviewBorrowRequests' => ! $isStaff,
            'facilitiesForReservation' => $facilitiesForReservation,
            'facilityReservations' => $facilityReservationRows,
            'canRequestFacilityReservation' => $isStaff && Schema::hasTable('facility_reservations'),
        ]);
    }

    public function store(Request $request): RedirectResponse|JsonResponse
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

        if ($request->user()?->isStaff()
            && (int) $validated['user_id'] !== (int) $request->user()->id) {
            throw ValidationException::withMessages([
                'user_id' => 'You can only request borrows for your own account.',
            ]);
        }

        $isStaff = $request->user()?->isStaff() === true;

        try {
            if ($isStaff) {
                $borrowRequest = TransactionBorrowRequest::create([
                    'item_id' => (int) $validated['item_id'],
                    'requested_by' => (int) $validated['user_id'],
                    'quantity' => (int) $validated['quantity'],
                    'status' => TransactionBorrowRequest::STATUS_PENDING,
                    'remarks' => $validated['remarks'] ?? null,
                    'requested_for_date' => $validated['transacted_at'] ?? now(),
                    'expected_return_date' => $validated['expected_return_date'] ?? null,
                ]);

                $borrowRequest->loadMissing(['item:id,name,sku', 'requester:id,name,username,email']);
                $this->notifyAdminsAfterResponse(new TransactionBorrowRequestNotification($borrowRequest));
            } else {
                $createdTransaction = $this->createIssuedBorrowTransaction(
                    itemId: (int) $validated['item_id'],
                    userId: (int) $validated['user_id'],
                    quantity: (int) $validated['quantity'],
                    remarks: $validated['remarks'] ?? null,
                    transactedAt: $validated['transacted_at'] ?? null,
                    expectedReturnDate: $validated['expected_return_date'] ?? null
                );

                if ($createdTransaction) {
                    $createdTransaction->loadMissing(['item:id,name,sku', 'user:id,name,username,email']);
                    $this->notifyAdminsAfterResponse(new NewTransactionNotification($createdTransaction));
                }
            }
        } catch (ValidationException $e) {
            return redirect()->back()->withErrors($e->errors())->withInput();
        }

        Cache::forget(DashboardController::STATS_CACHE_KEY);
        $this->forgetTransactionCaches();

        $successMessage = $isStaff
            ? 'Borrow request submitted. Waiting for admin approval.'
            : 'Transaction recorded successfully.';

        if ($request->expectsJson() && $isStaff && isset($borrowRequest)) {
            return response()->json([
                'message' => $successMessage,
                'borrowRequest' => $this->mapBorrowRequest($borrowRequest, true),
            ]);
        }

        return redirect()->back()->with('success', $successMessage);
    }

    public function approveBorrowRequest(TransactionBorrowRequest $borrowRequest): RedirectResponse
    {
        if (request()->user()?->isStaff()) {
            abort(403);
        }

        if ($borrowRequest->status !== TransactionBorrowRequest::STATUS_PENDING) {
            return redirect()->back()->with('error', 'This borrow request was already reviewed.');
        }

        try {
            DB::transaction(function () use ($borrowRequest): void {
                /** @var TransactionBorrowRequest $lockedRequest */
                $lockedRequest = TransactionBorrowRequest::query()->lockForUpdate()->findOrFail($borrowRequest->id);
                if ($lockedRequest->status !== TransactionBorrowRequest::STATUS_PENDING) {
                    throw ValidationException::withMessages(['request' => 'This borrow request was already reviewed.']);
                }

                $createdTransaction = $this->createIssuedBorrowTransaction(
                    itemId: (int) $lockedRequest->item_id,
                    userId: (int) $lockedRequest->requested_by,
                    quantity: (int) $lockedRequest->quantity,
                    remarks: $lockedRequest->remarks,
                    transactedAt: $lockedRequest->requested_for_date?->toDateTimeString(),
                    expectedReturnDate: $lockedRequest->expected_return_date?->format('Y-m-d'),
                );

                $lockedRequest->update([
                    'status' => TransactionBorrowRequest::STATUS_APPROVED,
                    'approved_transaction_id' => $createdTransaction->id,
                    'reviewed_by' => request()->user()->id,
                    'reviewed_at' => now(),
                    'rejection_reason' => null,
                ]);
            });
        } catch (ValidationException $e) {
            return redirect()->back()->with(
                'error',
                collect($e->errors())->flatten()->first() ?? 'Unable to approve borrow request.',
            );
        }

        $borrowRequest->refresh()->loadMissing(['item:id,name,sku', 'requester:id,name,username,email']);
        if ($borrowRequest->requester) {
            $borrowRequest->requester->notify(new TransactionBorrowRequestReviewedNotification($borrowRequest, true));
        }

        Cache::forget(DashboardController::STATS_CACHE_KEY);
        $this->forgetTransactionCaches();

        return redirect()->back()->with('success', 'Borrow request approved and transaction created.');
    }

    public function rejectBorrowRequest(Request $request, TransactionBorrowRequest $borrowRequest): RedirectResponse
    {
        if ($request->user()?->isStaff()) {
            abort(403);
        }

        if ($borrowRequest->status !== TransactionBorrowRequest::STATUS_PENDING) {
            return redirect()->back()->with('error', 'This borrow request was already reviewed.');
        }

        $validated = $request->validate([
            'reason' => ['required', 'string', 'max:500'],
        ]);

        $borrowRequest->update([
            'status' => TransactionBorrowRequest::STATUS_REJECTED,
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
            'rejection_reason' => $validated['reason'],
        ]);

        $borrowRequest->refresh()->loadMissing(['item:id,name,sku', 'requester:id,name,username,email']);
        if ($borrowRequest->requester) {
            $borrowRequest->requester->notify(new TransactionBorrowRequestReviewedNotification($borrowRequest, false));
        }

        Cache::forget(DashboardController::STATS_CACHE_KEY);
        $this->forgetTransactionCaches();

        return redirect()->back()->with('success', 'Borrow request rejected.');
    }

    public function requestReturn(Transaction $transaction): RedirectResponse
    {
        $user = request()->user();
        if (! $user?->isStaff()) {
            abort(403);
        }

        if ((int) $transaction->user_id !== (int) $user->id) {
            abort(403);
        }

        if ($transaction->transaction_type !== Transaction::TYPE_BORROW) {
            return redirect()->back()->with('error', 'Only borrow transactions can be returned.');
        }

        if (! in_array($transaction->status, [Transaction::STATUS_ISSUED, Transaction::STATUS_ACTIVE], true)) {
            return redirect()->back()->with('error', 'This transaction is not eligible for a return request.');
        }

        $alreadyPending = TransactionReturnRequest::query()
            ->where('transaction_id', $transaction->id)
            ->where('status', TransactionReturnRequest::STATUS_PENDING)
            ->exists();

        if ($alreadyPending) {
            return redirect()->back()->with('error', 'A return request is already pending for this loan.');
        }

        TransactionReturnRequest::create([
            'transaction_id' => $transaction->id,
            'requested_by' => $user->id,
            'status' => TransactionReturnRequest::STATUS_PENDING,
        ]);

        $transaction->loadMissing(['item:id,name,sku', 'user:id,name,username,email']);
        $this->notifyAdminsAfterResponse(new TransactionReturnRequestNotification($transaction));

        Cache::forget(DashboardController::STATS_CACHE_KEY);
        $this->forgetTransactionCaches();

        return redirect()->back()->with('success', 'Return request submitted. Lab staff will process the check-in.');
    }

    public function returnItem(Transaction $transaction): RedirectResponse
    {
        if (request()->user()?->isStaff()) {
            abort(403);
        }

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

                TransactionReturnRequest::query()
                    ->where('transaction_id', $locked->id)
                    ->where('status', TransactionReturnRequest::STATUS_PENDING)
                    ->update([
                        'status' => TransactionReturnRequest::STATUS_FULFILLED,
                        'fulfilled_at' => now(),
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

    public function approveReturnRequest(Request $request, Transaction $transaction): RedirectResponse
    {
        if ($request->user()?->isStaff()) {
            abort(403);
        }

        $validated = $request->validate([
            'has_damage' => ['required', 'boolean'],
            'damage_details' => ['nullable', 'string', 'max:5000'],
            'severity' => ['nullable', 'string', Rule::in(['low', 'medium', 'high', 'critical'])],
            'action_taken' => ['nullable', 'string', Rule::in(['pending', 'under_repair', 'replaced', 'discarded'])],
            'estimated_cost' => ['nullable', 'numeric', 'min:0'],
        ]);

        if (! empty($validated['has_damage']) && empty(trim((string) ($validated['damage_details'] ?? '')))) {
            throw ValidationException::withMessages([
                'damage_details' => 'Please describe the damage before submitting.',
            ]);
        }

        try {
            DB::transaction(function () use ($transaction, $validated, $request): void {
                /** @var Transaction $lockedTransaction */
                $lockedTransaction = Transaction::query()
                    ->with(['item.location'])
                    ->lockForUpdate()
                    ->findOrFail($transaction->id);

                if ($lockedTransaction->transaction_type !== Transaction::TYPE_BORROW) {
                    throw ValidationException::withMessages(['return' => 'Only borrow transactions can be returned.']);
                }

                if (! in_array($lockedTransaction->status, [Transaction::STATUS_ISSUED, Transaction::STATUS_ACTIVE], true)) {
                    throw ValidationException::withMessages(['return' => 'This transaction is not eligible for return.']);
                }

                $pendingReturn = TransactionReturnRequest::query()
                    ->where('transaction_id', $lockedTransaction->id)
                    ->where('status', TransactionReturnRequest::STATUS_PENDING)
                    ->lockForUpdate()
                    ->first();

                if (! $pendingReturn) {
                    throw ValidationException::withMessages([
                        'return' => 'No pending return request was found for this transaction.',
                    ]);
                }

                /** @var Item $item */
                $item = Item::query()->lockForUpdate()->findOrFail($lockedTransaction->item_id);
                $item->increment('quantity', (int) $lockedTransaction->quantity);

                $lockedTransaction->update(['status' => Transaction::STATUS_COMPLETED]);
                $pendingReturn->update([
                    'status' => TransactionReturnRequest::STATUS_FULFILLED,
                    'fulfilled_at' => now(),
                ]);

                if (! empty($validated['has_damage'])) {
                    $item->update([
                        'item_condition' => Item::CONDITION_DAMAGED,
                        'status' => ($validated['action_taken'] ?? 'pending') === 'under_repair'
                            ? Item::STATUS_UNDER_REPAIR
                            : Item::STATUS_DAMAGED,
                    ]);

                    IncidentReport::create([
                        'item_id' => $item->id,
                        'laboratory_id' => $item->location?->laboratory_id,
                        'location_id' => $item->location_id,
                        'reported_by' => $request->user()->id,
                        'assigned_to' => null,
                        'title' => 'Return damage: '.$item->name,
                        'description' => $validated['damage_details'],
                        'damage_details' => $validated['damage_details'],
                        'estimated_cost' => $validated['estimated_cost'] ?? null,
                        'severity' => $validated['severity'] ?? IncidentReport::SEVERITY_MEDIUM,
                        'status' => IncidentReport::STATUS_OPEN,
                        'action_taken' => $validated['action_taken'] ?? 'pending',
                        'occurred_at' => now(),
                        'resolved_at' => null,
                    ]);
                }
            });
        } catch (ValidationException $e) {
            return redirect()->back()->with(
                'error',
                collect($e->errors())->flatten()->first() ?? 'Unable to process return approval.',
            );
        }

        Cache::forget(DashboardController::STATS_CACHE_KEY);
        $this->forgetTransactionCaches();
        Cache::forget('maintenance:index:inventory-items');
        Cache::forget('maintenance:index:incidents');
        Cache::forget('inertia:system-status:critical-unresolved');

        return redirect()->back()->with(
            'success',
            ! empty($validated['has_damage'])
                ? 'Return approved. Item marked damaged and incident report created.'
                : 'Return approved successfully.'
        );
    }

    private function forgetTransactionCaches(): void
    {
        Cache::forget(self::ITEMS_CACHE_KEY);
        Cache::forget(self::BORROWERS_CACHE_KEY);
        Cache::forget(self::TRANSACTIONS_CACHE_KEY);
        Cache::forget(self::TRANSACTION_IDS_CACHE_KEY);
    }

    private function notifyAdminsAfterResponse(Notification $notification): void
    {
        app()->terminating(function () use ($notification): void {
            User::query()
                ->where('status', User::STATUS_ACTIVE)
                ->where('role', User::ROLE_ADMIN)
                ->each(fn (User $admin) => $admin->notify($notification));
        });
    }

    private function mapBorrowRequest(TransactionBorrowRequest $request, bool $isStaff): array
    {
        return [
            'id' => $request->id,
            'displayId' => 'BRQ-'.str_pad((string) $request->id, 3, '0', STR_PAD_LEFT),
            'item' => $request->item?->name ?? '—',
            'itemSku' => $request->item?->sku ?? '—',
            'requester' => $request->requester?->displayName() ?? '—',
            'quantity' => (int) $request->quantity,
            'status' => ucfirst((string) $request->status),
            'requestedAt' => $request->created_at?->format('Y-m-d') ?? '—',
            'requestedForDate' => $request->requested_for_date?->format('Y-m-d') ?? '—',
            'expectedReturnDate' => $request->expected_return_date?->format('Y-m-d') ?? '—',
            'remarks' => $request->remarks ?? '—',
            'rejectionReason' => $request->rejection_reason,
            'canApprove' => ! $isStaff && $request->status === TransactionBorrowRequest::STATUS_PENDING,
            'canReject' => ! $isStaff && $request->status === TransactionBorrowRequest::STATUS_PENDING,
        ];
    }

    private function createIssuedBorrowTransaction(
        int $itemId,
        int $userId,
        int $quantity,
        ?string $remarks,
        ?string $transactedAt,
        ?string $expectedReturnDate,
    ): Transaction {
        /** @var Transaction|null $createdTransaction */
        $createdTransaction = null;

        DB::transaction(function () use (
            $itemId,
            $userId,
            $quantity,
            $remarks,
            $transactedAt,
            $expectedReturnDate,
            &$createdTransaction
        ): void {
            /** @var Item $item */
            $item = Item::query()
                ->lockForUpdate()
                ->findOrFail($itemId);

            if ($quantity > $item->quantity) {
                throw ValidationException::withMessages([
                    'quantity' => 'Insufficient stock available.',
                ]);
            }

            $createdTransaction = Transaction::create([
                'item_id' => $item->id,
                'user_id' => $userId,
                'transaction_type' => Transaction::TYPE_BORROW,
                'quantity' => $quantity,
                'status' => Transaction::STATUS_ISSUED,
                'remarks' => $remarks,
                'transacted_at' => $transactedAt ?: now(),
                'expected_return_date' => $expectedReturnDate,
            ]);

            $item->quantity = $item->quantity - $quantity;
            $item->save();
        });

        return $createdTransaction;
    }
}
