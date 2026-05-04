import React, { useEffect, useMemo, useState } from 'react';
import { router, useForm, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    FileText,
    Plus,
    Search,
    XCircle,
    CheckCircle2,
} from 'lucide-react';

import LabLayout from '@/Layouts/LabLayout';

function todayISODate() {
    return new Date().toISOString().slice(0, 10);
}

export default function Transactions({
    items = [],
    transactions: transactionsProp = [],
    borrowRequests: borrowRequestsProp = [],
    borrowers = [],
    canManageTransactions = true,
    canRequestBorrow = false,
    canReviewBorrowRequests = false,
}) {
    const { flash, auth } = usePage().props;
    const staffUserId = auth?.user?.id != null ? String(auth.user.id) : '';
    const [isNewTxModalOpen, setIsNewTxModalOpen] = useState(false);
    const [toast, setToast] = useState(null);
    const [returningId, setReturningId] = useState(null);
    const [returnRequestingId, setReturnRequestingId] = useState(null);
    const [reviewingRequestId, setReviewingRequestId] = useState(null);
    const [rejectingRequestId, setRejectingRequestId] = useState(null);
    const [rejectReason, setRejectReason] = useState('');
    const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);
    const [approvingReturnId, setApprovingReturnId] = useState(null);
    const [returnReviewTargetId, setReturnReviewTargetId] = useState(null);
    const [returnReview, setReturnReview] = useState({
        hasDamage: false,
        damageDetails: '',
        severity: 'medium',
        actionTaken: 'pending',
        estimatedCost: '',
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [transactions, setTransactions] = useState(transactionsProp.length ? transactionsProp : []);
    const [borrowRequests, setBorrowRequests] = useState(
        borrowRequestsProp.length ? borrowRequestsProp : []
    );
    const refreshOnly = useMemo(
        () => [
            'transactions',
            'borrowRequests',
            'items',
            'borrowers',
            'canManageTransactions',
            'canRequestBorrow',
            'canReviewBorrowRequests',
        ],
        []
    );

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        transaction_type: 'borrow',
        user_id: '',
        item_id: '',
        quantity: 1,
        transacted_at: todayISODate(),
        expected_return_date: '',
        remarks: '',
    });

    useEffect(() => {
        if (flash?.success) {
            setToast({ type: 'success', message: flash.success });
        }
    }, [flash?.success]);

    useEffect(() => {
        if (flash?.error) {
            setToast({ type: 'error', message: flash.error });
        }
    }, [flash?.error]);

    useEffect(() => {
        if (!toast) return undefined;
        const t = setTimeout(() => setToast(null), 4200);
        return () => clearTimeout(t);
    }, [toast]);

    useEffect(() => {
        setTransactions(transactionsProp.length ? transactionsProp : []);
    }, [transactionsProp]);

    useEffect(() => {
        setBorrowRequests(borrowRequestsProp.length ? borrowRequestsProp : []);
    }, [borrowRequestsProp]);

    const defaultBorrowerId = () => {
        const authId = auth?.user?.id != null ? String(auth.user.id) : null;
        if (authId && borrowers.some((b) => String(b.id) === authId)) {
            return authId;
        }
        return borrowers.length > 0 ? String(borrowers[0].id) : '';
    };

    const openModal = () => {
        clearErrors();
        const defaultUserId = staffBorrowOnly ? staffUserId : defaultBorrowerId();
        reset({
            transaction_type: 'borrow',
            user_id: defaultUserId,
            item_id: '',
            quantity: 1,
            transacted_at: todayISODate(),
            expected_return_date: '',
            remarks: '',
        });
        setIsNewTxModalOpen(true);
    };

    const closeModal = () => {
        setIsNewTxModalOpen(false);
        clearErrors();
    };

    const submitTransaction = (e) => {
        e.preventDefault();
        if (data.transaction_type !== 'borrow') {
            setToast({
                type: 'error',
                message: 'Return check-in is not available yet. Please use Borrow (check-out).',
            });
            return;
        }
        if ((staffBorrowOnly && !staffUserId) || (!staffBorrowOnly && !data.user_id)) {
            setToast({
                type: 'error',
                message: 'Borrower is required.',
            });
            return;
        }
        if (staffBorrowOnly) {
            setIsSubmittingRequest(true);
            window.axios
                .post(
                    route('transactions.store'),
                    {
                        transaction_type: data.transaction_type,
                        user_id: data.user_id,
                        item_id: data.item_id,
                        quantity: data.quantity,
                        transacted_at: data.transacted_at,
                        expected_return_date: data.expected_return_date,
                        remarks: data.remarks,
                    },
                    {
                        headers: {
                            Accept: 'application/json',
                            'X-Requested-With': 'XMLHttpRequest',
                        },
                    }
                )
                .then(({ data: response }) => {
                    if (response?.borrowRequest) {
                        setBorrowRequests((previous) => [response.borrowRequest, ...previous]);
                    }
                    setToast({
                        type: 'success',
                        message:
                            response?.message ??
                            'Borrow request submitted. Waiting for admin approval.',
                    });
                    closeModal();
                    reset({
                        transaction_type: 'borrow',
                        user_id: staffUserId,
                        item_id: '',
                        quantity: 1,
                        transacted_at: todayISODate(),
                        expected_return_date: '',
                        remarks: '',
                    });
                })
                .catch((error) => {
                    const errorMessage =
                        error?.response?.data?.message ??
                        'Unable to submit borrow request. Please try again.';
                    setToast({ type: 'error', message: errorMessage });
                })
                .finally(() => {
                    setIsSubmittingRequest(false);
                });

            return;
        }

        post(route('transactions.store'), {
            preserveState: true,
            preserveScroll: true,
            only: refreshOnly,
            onSuccess: () => {
                closeModal();
                reset({
                    transaction_type: 'borrow',
                    user_id: staffBorrowOnly ? staffUserId : defaultBorrowerId(),
                    item_id: '',
                    quantity: 1,
                    transacted_at: todayISODate(),
                    expected_return_date: '',
                    remarks: '',
                });
            },
        });
    };

    const handleReturnItem = (transactionId) => {
        setReturningId(transactionId);
        router.patch(route('transactions.return', transactionId), {}, {
            preserveState: true,
            preserveScroll: true,
            only: refreshOnly,
            onFinish: () => setReturningId(null),
        });
    };

    const handleRequestReturn = (transactionId) => {
        const previousTransaction = transactions.find((trx) => trx.id === transactionId) ?? null;
        setTransactions((previous) =>
            previous.map((trx) =>
                trx.id === transactionId
                    ? {
                        ...trx,
                        canSubmitReturnRequest: false,
                        returnRequestPending: true,
                        hasPendingReturnRequest: true,
                    }
                    : trx
            )
        );
        setReturnRequestingId(transactionId);
        router.post(
            route('transactions.return-request', transactionId),
            {},
            {
                preserveState: true,
                preserveScroll: true,
                only: refreshOnly,
                onError: () => {
                    if (previousTransaction) {
                        setTransactions((previous) =>
                            previous.map((trx) =>
                                trx.id === transactionId ? previousTransaction : trx
                            )
                        );
                    }
                    setToast({
                        type: 'error',
                        message: 'Unable to submit return request. Please try again.',
                    });
                },
                onSuccess: () => {
                    setToast({
                        type: 'success',
                        message: 'Return request submitted. Waiting for staff confirmation.',
                    });
                },
                onFinish: () => setReturnRequestingId(null),
            }
        );
    };

    const openReturnReviewModal = (transactionId) => {
        setReturnReviewTargetId(transactionId);
        setReturnReview({
            hasDamage: false,
            damageDetails: '',
            severity: 'medium',
            actionTaken: 'pending',
            estimatedCost: '',
        });
    };

    const closeReturnReviewModal = () => {
        if (approvingReturnId !== null) return;
        setReturnReviewTargetId(null);
    };

    const submitReturnReview = () => {
        if (returnReviewTargetId === null) return;
        if (returnReview.hasDamage && returnReview.damageDetails.trim().length === 0) {
            setToast({
                type: 'error',
                message: 'Please describe the damage details before submitting.',
            });
            return;
        }

        setApprovingReturnId(returnReviewTargetId);
        router.patch(
            route('transactions.return-approve', returnReviewTargetId),
            {
                has_damage: returnReview.hasDamage,
                damage_details: returnReview.hasDamage ? returnReview.damageDetails : null,
                severity: returnReview.hasDamage ? returnReview.severity : null,
                action_taken: returnReview.hasDamage ? returnReview.actionTaken : null,
                estimated_cost:
                    returnReview.hasDamage && returnReview.estimatedCost !== ''
                        ? Number(returnReview.estimatedCost)
                        : null,
            },
            {
                preserveState: true,
                preserveScroll: true,
                only: refreshOnly,
                onSuccess: () => {
                    setReturnReviewTargetId(null);
                },
                onFinish: () => {
                    setApprovingReturnId(null);
                },
            }
        );
    };

    const handleApproveBorrowRequest = (borrowRequestId) => {
        setReviewingRequestId(borrowRequestId);
        router.patch(route('transactions.borrow-requests.approve', borrowRequestId), {}, {
            preserveState: true,
            preserveScroll: true,
            only: refreshOnly,
            onFinish: () => setReviewingRequestId(null),
        });
    };

    const openRejectBorrowRequestModal = (borrowRequestId) => {
        setRejectingRequestId(borrowRequestId);
        setRejectReason('');
    };

    const closeRejectBorrowRequestModal = () => {
        if (reviewingRequestId !== null) return;
        setRejectingRequestId(null);
        setRejectReason('');
    };

    const handleRejectBorrowRequest = () => {
        if (rejectingRequestId === null) return;
        const reason = rejectReason.trim();
        if (!reason) {
            setToast({
                type: 'error',
                message: 'Rejection reason is required.',
            });
            return;
        }
        setReviewingRequestId(rejectingRequestId);
        router.patch(route('transactions.borrow-requests.reject', rejectingRequestId), {
            reason,
        }, {
            preserveState: true,
            preserveScroll: true,
            only: refreshOnly,
            onFinish: () => {
                setReviewingRequestId(null);
                setRejectingRequestId(null);
                setRejectReason('');
            },
        });
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Completed':
            case 'Returned':
            case 'completed':
                return 'border-green-200 bg-green-50 text-green-700';
            case 'Overdue':
                return 'border-red-200 bg-red-50 text-red-700';
            case 'Active':
            case 'Issued':
                return 'border-blue-200 bg-blue-50 text-blue-700';
            case 'Cancelled':
                return 'border-gray-200 bg-gray-100 text-gray-600';
            default:
                return 'border-gray-200 bg-gray-50 text-gray-700';
        }
    };

    const getRequestStatusStyle = (status) => {
        switch (status) {
            case 'Approved':
                return 'border-green-200 bg-green-50 text-green-700';
            case 'Rejected':
                return 'border-red-200 bg-red-50 text-red-700';
            default:
                return 'border-amber-200 bg-amber-50 text-amber-800';
        }
    };

    /** Same footprint as Pending pills (height, padding, corners) across Status + action chips */
    const statusBadgeBase =
        'inline-flex h-7 min-w-[5.25rem] max-w-full shrink-0 items-center justify-center whitespace-nowrap rounded border px-2.5 py-0.5 text-[11px] font-bold leading-none';

    const recordBadgeBase =
        'inline-flex h-7 min-w-[5.25rem] max-w-full items-center justify-center whitespace-nowrap rounded border px-2.5 py-0.5 text-[10px] font-bold leading-none';

    const actionButtonBase =
        'inline-flex h-7 min-w-[96px] items-center justify-center rounded-md border px-2 text-[11px] font-semibold leading-none';
    const actionButtonSplit =
        'inline-flex h-7 min-w-0 flex-1 items-center justify-center rounded-md border px-2 text-[11px] font-semibold leading-none';
    const actionButtonFullRow =
        'inline-flex h-7 w-full min-w-0 items-center justify-center rounded-md border px-2 text-[11px] font-semibold leading-none';

    const selectedItem = items.find((i) => String(i.id) === String(data.item_id));

    const showBorrowModal = canManageTransactions || canRequestBorrow;
    const staffBorrowOnly = canRequestBorrow && !canManageTransactions;
    const unifiedRows = useMemo(
        () => [
            ...borrowRequests.map((req) => ({
                id: `req-${req.id}`,
                kind: 'borrow_request',
                ref: req.displayId,
                item: `${req.item} (${req.itemSku})`,
                user: req.requester ?? (borrowers[0]?.label ?? auth?.user?.name ?? auth?.user?.username ?? '—'),
                type: 'Borrow request',
                date: req.requestedAt ?? '—',
                expected: req.expectedReturnDate ?? '—',
                status: req.status,
                raw: req,
            })),
            ...transactions.map((trx) => ({
                id: `trx-${trx.id}`,
                kind: 'transaction',
                ref: trx.displayId ?? trx.id,
                item: trx.item,
                user: trx.user,
                type: trx.type,
                date: trx.borrowDate,
                expected: trx.returnDate,
                status: trx.status,
                raw: trx,
            })),
        ],
        [borrowRequests, transactions, borrowers, auth?.user?.name, auth?.user?.username]
    );

    const filteredRows = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        if (!q) return unifiedRows;

        return unifiedRows.filter((row) =>
            [row.ref, row.item, row.user, row.type, row.status, row.date, row.expected]
                .filter(Boolean)
                .some((value) => String(value).toLowerCase().includes(q))
        );
    }, [searchQuery, unifiedRows]);

    const metrics = useMemo(
        () => ({
            total: unifiedRows.length,
            pendingBorrowRequests: borrowRequests.filter((req) => req.status === 'Pending').length,
            activeBorrows: transactions.filter((trx) => trx.status === 'Issued' || trx.status === 'Active').length,
            returnRequestsPending: transactions.filter(
                (trx) => trx.returnRequestPending || trx.hasPendingReturnRequest
            ).length,
        }),
        [unifiedRows.length, borrowRequests, transactions]
    );

    useEffect(() => {
        if (staffBorrowOnly && isNewTxModalOpen && staffUserId && data.user_id !== staffUserId) {
            setData('user_id', staffUserId);
        }
    }, [staffBorrowOnly, isNewTxModalOpen, staffUserId, data.user_id, setData]);

    useEffect(() => {
        const shouldAutoRefresh = canReviewBorrowRequests || canRequestBorrow;
        if (!shouldAutoRefresh) return undefined;

        const reloadTransactions = () => {
            const hasPendingAction =
                reviewingRequestId !== null ||
                returningId !== null ||
                returnRequestingId !== null ||
                approvingReturnId !== null ||
                processing ||
                isSubmittingRequest ||
                isNewTxModalOpen ||
                returnReviewTargetId !== null ||
                rejectingRequestId !== null;

            if (hasPendingAction || document.hidden) {
                return;
            }

            router.reload({
                preserveState: true,
                preserveScroll: true,
                only: refreshOnly,
            });
        };

        const intervalId = window.setInterval(reloadTransactions, 15000);

        const handleWindowFocus = () => reloadTransactions();
        window.addEventListener('focus', handleWindowFocus);

        return () => {
            window.clearInterval(intervalId);
            window.removeEventListener('focus', handleWindowFocus);
        };
    }, [
        canReviewBorrowRequests,
        canRequestBorrow,
        refreshOnly,
        reviewingRequestId,
        returningId,
        returnRequestingId,
        approvingReturnId,
        processing,
        isSubmittingRequest,
        isNewTxModalOpen,
        returnReviewTargetId,
        rejectingRequestId,
    ]);

    return (
        <LabLayout title="Transactions">

            {toast && (
                <div className="fixed right-6 top-6 z-[60] flex max-w-sm items-start gap-3 rounded-xl border border-[#d2deeb] bg-white px-4 py-3 shadow-[0_8px_30px_-8px_rgba(0,0,0,0.12)]">
                    {toast.type === 'success' ? (
                        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" strokeWidth={2} />
                    ) : (
                        <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" strokeWidth={2} />
                    )}
                    <p className="text-[13px] font-medium text-gray-800 leading-snug">{toast.message}</p>
                    <button
                        type="button"
                        onClick={() => setToast(null)}
                        className="ml-1 shrink-0 rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                        aria-label="Dismiss notification"
                    >
                        <XCircle className="h-4 w-4" />
                    </button>
                </div>
            )}

            <div className="flex-1 overflow-auto p-5 md:p-6">
                <div className="mx-auto w-full max-w-[1100px] rounded-xl bg-white shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-[#e1f1fd]">
                    {/* Header Section */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-6 py-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-[42px] w-[42px] items-center justify-center rounded-lg bg-white border border-[#d2deeb] text-gray-600 shadow-sm">
                                <FileText className="h-[22px] w-[22px]" strokeWidth={1.5} />
                            </div>
                            <div>
                                <h1 className="text-[22px] font-bold text-gray-800 tracking-tight">Transactions</h1>
                               
                            </div>
                        </div>
                        <div className="mt-3 flex w-full items-center gap-2.5 sm:mt-0 sm:w-auto">
                            <div className="relative w-full sm:w-auto">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <Search className="h-4 w-4 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="block w-full sm:w-64 rounded-lg border border-[#d2deeb] bg-[#f8fafc] py-2.5 pl-10 pr-3 text-[13px] text-gray-800 placeholder-gray-400 focus:border-[#4663ac] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#4663ac] transition-colors shadow-sm"
                                    placeholder="Search reference, item, user..."
                                />
                            </div>
                            {showBorrowModal && (
                                <button
                                    type="button"
                                    onClick={openModal}
                                    className="flex items-center gap-2 rounded-lg bg-[#1e293b] px-4 py-2.5 text-[13px] font-semibold text-white shadow-sm hover:bg-gray-800 transition-colors whitespace-nowrap"
                                >
                                    <Plus className="h-4 w-4" strokeWidth={2.5} />
                                    {staffBorrowOnly ? 'Request borrow' : 'New Transaction'}
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-2.5 border-t border-[#f1f5f9] px-6 py-3 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="rounded-lg border border-[#dbe6f3] bg-[#f8fbff] px-4 py-3">
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Total records</p>
                            <p className="mt-1 text-[18px] font-bold text-gray-800">{metrics.total}</p>
                        </div>
                        <div className="rounded-lg border border-amber-200 bg-amber-50/70 px-4 py-3">
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-700">Pending requests</p>
                            <p className="mt-1 text-[18px] font-bold text-amber-900">{metrics.pendingBorrowRequests}</p>
                        </div>
                        <div className="rounded-lg border border-blue-200 bg-blue-50/70 px-4 py-3">
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-blue-700">Active borrows</p>
                            <p className="mt-1 text-[18px] font-bold text-blue-900">{metrics.activeBorrows}</p>
                        </div>
                        <div className="rounded-lg border border-indigo-200 bg-indigo-50/70 px-4 py-3">
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-indigo-700">Returns requested</p>
                            <p className="mt-1 text-[18px] font-bold text-indigo-900">{metrics.returnRequestsPending}</p>
                        </div>
                    </div>

                    {/* Unified table */}
                    <div className="mt-1 overflow-x-auto border-t border-[#f1f5f9]">
                        <table className="w-full text-left text-[13px] whitespace-nowrap">
                            <thead className="bg-[#f8fafc] text-[11px] font-bold text-gray-400 uppercase tracking-wider border-b border-[#f1f5f9]">
                                <tr>
                                    <th className="px-4 py-2.5">Record</th>
                                    <th className="px-4 py-2.5">Reference</th>
                                    <th className="px-4 py-2.5">Item</th>
                                    <th className="px-4 py-2.5">User</th>
                                    <th className="px-4 py-2.5">Type</th>
                                    <th className="px-4 py-2.5">Date</th>
                                    <th className="px-4 py-2.5">Exp. Return</th>
                                    <th className="px-4 py-2.5">Status</th>
                                    <th className="w-[190px] px-4 py-2.5 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#f1f5f9] text-gray-600">
                                {filteredRows.length === 0 ? (
                                    <tr>
                                        <td colSpan={9} className="px-5 py-10 text-center text-[13px] text-gray-500">
                                            {searchQuery.trim() ? (
                                                <>
                                                    No records match{' '}
                                                    <span className="font-semibold text-gray-700">"{searchQuery.trim()}"</span>.
                                                </>
                                            ) : canManageTransactions ? (
                                                <>
                                                    No transactions yet. Start with{' '}
                                                    <span className="font-semibold text-gray-700">New Transaction</span>.
                                                </>
                                            ) : canRequestBorrow ? (
                                                <>
                                                    No transactions yet.
                                                </>
                                            ) : (
                                                <>No borrow transactions are recorded for your account yet.</>
                                            )}
                                        </td>
                                    </tr>
                                ) : (
                                    filteredRows.map((row) => (
                                        <tr key={row.id} className="hover:bg-[#f8fafc] transition-colors group">
                                            <td className="px-4 py-2.5">
                                                <span
                                                    className={`${recordBadgeBase} ${
                                                        row.kind === 'borrow_request'
                                                            ? 'border-violet-200 bg-violet-50 text-violet-700'
                                                            : 'border-blue-200 bg-blue-50 text-blue-700'
                                                    }`}
                                                >
                                                    {row.kind === 'borrow_request' ? 'Request' : 'Transaction'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2.5 font-medium text-gray-700">{row.ref}</td>
                                            <td className="px-4 py-2.5 font-semibold text-gray-800">{row.item}</td>
                                            <td className="px-4 py-2.5 text-gray-600">{row.user}</td>
                                            <td className="px-4 py-2.5 font-medium text-gray-700">{row.type}</td>
                                            <td className="px-4 py-2.5 text-gray-600">{row.date}</td>
                                            <td className="px-4 py-2.5 text-gray-600">{row.expected}</td>
                                            <td className="px-4 py-2.5">
                                                <span
                                                    className={`${statusBadgeBase} ${
                                                        row.kind === 'borrow_request'
                                                            ? getRequestStatusStyle(row.status)
                                                            : getStatusStyle(row.status)
                                                    }`}
                                                >
                                                    {row.status}
                                                </span>
                                            </td>
                                            <td className="min-w-[190px] px-4 py-2.5">
                                                <div className="flex w-full min-w-0 flex-col gap-1.5">
                                                    {row.kind === 'borrow_request' && canReviewBorrowRequests ? (
                                                        <div className="flex w-full gap-1.5">
                                                            <button
                                                                type="button"
                                                                onClick={() => openRejectBorrowRequestModal(row.raw.id)}
                                                                disabled={reviewingRequestId === row.raw.id}
                                                                className={`${actionButtonSplit} border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-50`}
                                                            >
                                                                Reject
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleApproveBorrowRequest(row.raw.id)}
                                                                disabled={reviewingRequestId === row.raw.id}
                                                                className={`${actionButtonSplit} border border-green-200 bg-green-50 text-green-700 hover:bg-green-100 disabled:opacity-50`}
                                                            >
                                                                {reviewingRequestId === row.raw.id ? 'Saving…' : 'Approve'}
                                                            </button>
                                                        </div>
                                                    ) : row.kind === 'borrow_request' ? (
                                                        <span
                                                            className={`${statusBadgeBase} w-full border-dashed border-gray-200 bg-gray-50/50 text-gray-300`}
                                                            aria-hidden
                                                        >
                                                            —
                                                        </span>
                                                    ) : row.kind === 'transaction' && canManageTransactions && row.raw.canApproveReturnRequest ? (
                                                        <button
                                                            type="button"
                                                            onClick={() => openReturnReviewModal(row.raw.id)}
                                                            disabled={approvingReturnId === row.raw.id}
                                                            className={`${actionButtonFullRow} border border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50`}
                                                            title="Review return request and decide item condition"
                                                        >
                                                            {approvingReturnId === row.raw.id ? 'Approving…' : 'Review return'}
                                                        </button>
                                                    ) : row.raw.canReturnItem ? (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleReturnItem(row.raw.id)}
                                                            disabled={returningId === row.raw.id}
                                                            className={`${actionButtonBase} border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50`}
                                                        >
                                                            {returningId === row.raw.id ? 'Returning…' : 'Return Item'}
                                                        </button>
                                                    ) : row.raw.canSubmitReturnRequest ? (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRequestReturn(row.raw.id)}
                                                            disabled={returnRequestingId === row.raw.id}
                                                            className={`${actionButtonBase} border border-[#4663ac]/40 bg-[#f0f4ff] text-[#3f59a3] hover:bg-[#e8eefc] disabled:cursor-not-allowed disabled:opacity-50`}
                                                        >
                                                            {returnRequestingId === row.raw.id
                                                                ? 'Submitting…'
                                                                : 'Request return'}
                                                        </button>
                                                    ) : row.raw.returnRequestPending ? (
                                                        <span
                                                            className={`${statusBadgeBase} w-full border-amber-200 bg-amber-50 text-amber-800`}
                                                            title="Waiting for lab staff to confirm check-in"
                                                        >
                                                            Return requested
                                                        </span>
                                                    ) : (
                                                        <span
                                                            className={`${statusBadgeBase} w-full border-gray-200 bg-gray-50 text-gray-400`}
                                                            aria-hidden
                                                        >
                                                            No action
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {returnReviewTargetId !== null && (
                <div className="fixed inset-0 z-[65] flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
                    <div className="w-full max-w-lg rounded-xl border border-gray-100 bg-white p-6 shadow-2xl">
                        <div className="flex items-start gap-3">
                            <div className="mt-0.5 rounded-full bg-amber-100 p-2 text-amber-700">
                                <AlertTriangle className="h-4 w-4" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-800">Approve item return</h3>
                                <p className="mt-1 text-[13px] text-gray-600">
                                    Confirm if the item is returned in good condition or report damage.
                                </p>
                            </div>
                        </div>

                        <div className="mt-5 space-y-4">
                            <label className="flex items-center gap-2 text-[13px] font-semibold text-gray-700">
                                <input
                                    type="checkbox"
                                    checked={returnReview.hasDamage}
                                    onChange={(e) =>
                                        setReturnReview((previous) => ({
                                            ...previous,
                                            hasDamage: e.target.checked,
                                        }))
                                    }
                                    className="h-4 w-4 rounded border-gray-300 text-[#4663ac] focus:ring-[#4663ac]"
                                />
                                Item has damage (create incident report)
                            </label>

                            {returnReview.hasDamage && (
                                <div className="grid grid-cols-1 gap-4 rounded-lg border border-amber-200 bg-amber-50/40 p-4 md:grid-cols-2">
                                    <div className="md:col-span-2">
                                        <label className="mb-1 block text-[12px] font-semibold text-gray-700">Damage details</label>
                                        <textarea
                                            value={returnReview.damageDetails}
                                            onChange={(e) =>
                                                setReturnReview((previous) => ({
                                                    ...previous,
                                                    damageDetails: e.target.value,
                                                }))
                                            }
                                            rows={3}
                                            className="block w-full rounded-lg border border-[#d2deeb] bg-white px-3 py-2.5 text-[13px] text-gray-800 placeholder-gray-400 focus:border-[#4663ac] focus:outline-none focus:ring-1 focus:ring-[#4663ac]"
                                            placeholder="Describe the issue (e.g., cracked screen, loose cable, missing accessory)"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-[12px] font-semibold text-gray-700">Severity</label>
                                        <select
                                            value={returnReview.severity}
                                            onChange={(e) =>
                                                setReturnReview((previous) => ({
                                                    ...previous,
                                                    severity: e.target.value,
                                                }))
                                            }
                                            className="block w-full rounded-lg border border-[#d2deeb] bg-white px-3 py-2.5 text-[13px] text-gray-800 focus:border-[#4663ac] focus:outline-none focus:ring-1 focus:ring-[#4663ac]"
                                        >
                                            <option value="low">Low</option>
                                            <option value="medium">Medium</option>
                                            <option value="high">High</option>
                                            <option value="critical">Critical</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-[12px] font-semibold text-gray-700">Action</label>
                                        <select
                                            value={returnReview.actionTaken}
                                            onChange={(e) =>
                                                setReturnReview((previous) => ({
                                                    ...previous,
                                                    actionTaken: e.target.value,
                                                }))
                                            }
                                            className="block w-full rounded-lg border border-[#d2deeb] bg-white px-3 py-2.5 text-[13px] text-gray-800 focus:border-[#4663ac] focus:outline-none focus:ring-1 focus:ring-[#4663ac]"
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="under_repair">Under repair</option>
                                            <option value="replaced">Replaced</option>
                                            <option value="discarded">Discarded</option>
                                        </select>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="mb-1 block text-[12px] font-semibold text-gray-700">Estimated cost (optional)</label>
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={returnReview.estimatedCost}
                                            onChange={(e) =>
                                                setReturnReview((previous) => ({
                                                    ...previous,
                                                    estimatedCost: e.target.value,
                                                }))
                                            }
                                            className="block w-full rounded-lg border border-[#d2deeb] bg-white px-3 py-2.5 text-[13px] text-gray-800 placeholder-gray-400 focus:border-[#4663ac] focus:outline-none focus:ring-1 focus:ring-[#4663ac]"
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={closeReturnReviewModal}
                                disabled={approvingReturnId !== null}
                                className="rounded-lg border border-[#d2deeb] bg-white px-4 py-2.5 text-[13px] font-semibold text-gray-600 shadow-sm transition-colors hover:bg-gray-50 disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={submitReturnReview}
                                disabled={approvingReturnId !== null}
                                className="rounded-lg bg-[#4663ac] px-4 py-2.5 text-[13px] font-semibold text-white shadow-sm transition-colors hover:bg-[#3f59a3] disabled:opacity-60"
                            >
                                {approvingReturnId !== null ? 'Processing…' : 'Approve return'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {rejectingRequestId !== null && (
                <div className="fixed inset-0 z-[65] flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-xl border border-gray-100 bg-white p-6 shadow-2xl">
                        <h3 className="text-lg font-bold text-gray-800">Reject borrow request?</h3>
                        <p className="mt-2 text-[13px] text-gray-600">
                            Add a reason so the requester understands why this was rejected.
                        </p>
                        <div className="mt-4">
                            <label className="mb-1.5 block text-[13px] font-semibold text-gray-700">
                                Rejection reason <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                rows={3}
                                maxLength={500}
                                className="block w-full rounded-lg border border-[#d2deeb] bg-white px-3 py-2.5 text-[13px] text-gray-800 placeholder-gray-400 focus:border-[#4663ac] focus:outline-none focus:ring-1 focus:ring-[#4663ac] shadow-sm transition-colors"
                                placeholder="Reason for rejection"
                                required
                            />
                            <p className="mt-1 text-[11px] text-gray-400">{rejectReason.length}/500</p>
                        </div>
                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={closeRejectBorrowRequestModal}
                                disabled={reviewingRequestId !== null}
                                className="rounded-lg border border-[#d2deeb] bg-white px-4 py-2.5 text-[13px] font-semibold text-gray-600 shadow-sm transition-colors hover:bg-gray-50 disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleRejectBorrowRequest}
                                disabled={reviewingRequestId !== null || rejectReason.trim().length === 0}
                                className="rounded-lg bg-red-600 px-4 py-2.5 text-[13px] font-semibold text-white shadow-sm transition-colors hover:bg-red-700 disabled:opacity-60"
                            >
                                {reviewingRequestId !== null ? 'Rejecting…' : 'Confirm Reject'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* New Transaction / staff borrow request modal */}
            {showBorrowModal && isNewTxModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="w-full max-w-2xl rounded-xl bg-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <form onSubmit={submitTransaction}>
                            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                                <div>
                                    <h2 className="text-lg font-bold text-gray-800">
                                        {staffBorrowOnly ? 'Borrow request' : 'Process Transaction'}
                                    </h2>
                                    <p className="text-[13px] text-gray-500">
                                        {staffBorrowOnly
                                            ? 'Request equipment checkout under your account'
                                            : 'Checkout or return a lab item'}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                                >
                                    <XCircle className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto px-6 py-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="space-y-4">
                                        {!staffBorrowOnly && (
                                            <div>
                                                <label className="mb-1.5 block text-[13px] font-semibold text-gray-700">Transaction Type</label>
                                                <select
                                                    value={data.transaction_type}
                                                    onChange={(e) => setData('transaction_type', e.target.value)}
                                                    className="block w-full rounded-lg border border-[#d2deeb] bg-white px-3 py-2.5 text-[13px] text-gray-800 focus:border-[#4663ac] focus:outline-none focus:ring-1 focus:ring-[#4663ac] shadow-sm transition-colors"
                                                >
                                                    <option value="borrow">Borrow (Check-out)</option>
                                                    <option value="return">Return (Check-in)</option>
                                                </select>
                                                {errors.transaction_type && (
                                                    <p className="mt-1 text-xs text-red-500">{errors.transaction_type}</p>
                                                )}
                                            </div>
                                        )}
                                        <div>
                                            <label className="mb-1.5 block text-[13px] font-semibold text-gray-700">Item</label>
                                            <select
                                                value={data.item_id}
                                                onChange={(e) => setData('item_id', e.target.value)}
                                                className="block w-full rounded-lg border border-[#d2deeb] bg-white px-3 py-2.5 text-[13px] text-gray-800 focus:border-[#4663ac] focus:outline-none focus:ring-1 focus:ring-[#4663ac] shadow-sm transition-colors"
                                                required
                                            >
                                                <option value="">Select an item…</option>
                                                {items.map((item) => (
                                                    <option key={item.id} value={item.id}>
                                                        {item.name} ({item.sku}) — {item.stock} in stock
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.item_id && <p className="mt-1 text-xs text-red-500">{errors.item_id}</p>}
                                        </div>
                                        <div>
                                            <label className="mb-1.5 block text-[13px] font-semibold text-gray-700">Quantity</label>
                                            <input
                                                type="number"
                                                min={1}
                                                value={data.quantity}
                                                onChange={(e) =>
                                                    setData(
                                                        'quantity',
                                                        e.target.value === '' ? 1 : Math.max(1, parseInt(e.target.value, 10) || 1)
                                                    )
                                                }
                                                className="block w-full rounded-lg border border-[#d2deeb] bg-white px-3 py-2.5 text-[13px] text-gray-800 focus:border-[#4663ac] focus:outline-none focus:ring-1 focus:ring-[#4663ac] shadow-sm transition-colors"
                                            />
                                            {selectedItem && (
                                                <p className="mt-1 text-[12px] text-gray-500">
                                                    Available: <span className="font-semibold text-gray-700">{selectedItem.stock}</span>
                                                </p>
                                            )}
                                            {errors.quantity && <p className="mt-1 text-xs text-red-500">{errors.quantity}</p>}
                                        </div>
                                        <div>
                                            <label className="mb-1.5 block text-[13px] font-semibold text-gray-700">
                                                {staffBorrowOnly ? 'Borrower (you)' : 'Borrower'}
                                            </label>
                                            {staffBorrowOnly ? (
                                                <>
                                                    <input
                                                        type="text"
                                                        readOnly
                                                        value={
                                                            borrowers[0]?.label ??
                                                            auth?.user?.name ??
                                                            auth?.user?.username ??
                                                            ''
                                                        }
                                                        className="block w-full cursor-not-allowed rounded-lg border border-[#d2deeb] bg-[#f8fafc] px-3 py-2.5 text-[13px] text-gray-700 shadow-sm"
                                                    />
                                                    <p className="mt-1 text-[12px] text-gray-500">
                                                        Borrow requests are tied to your staff account.
                                                    </p>
                                                </>
                                            ) : (
                                                <>
                                                    <select
                                                        value={data.user_id}
                                                        onChange={(e) => setData('user_id', e.target.value)}
                                                        className="block w-full rounded-lg border border-[#d2deeb] bg-white px-3 py-2.5 text-[13px] text-gray-800 focus:border-[#4663ac] focus:outline-none focus:ring-1 focus:ring-[#4663ac] shadow-sm transition-colors"
                                                        required
                                                    >
                                                        {borrowers.length === 0 ? (
                                                            <option value="">No active users in directory</option>
                                                        ) : (
                                                            <>
                                                                <option value="">Select borrower…</option>
                                                                {borrowers.map((u) => (
                                                                    <option key={u.id} value={u.id}>
                                                                        {u.label}
                                                                        {u.id_number ? ` (${u.id_number})` : ''}
                                                                    </option>
                                                                ))}
                                                            </>
                                                        )}
                                                    </select>
                                                    <p className="mt-1 text-[12px] text-gray-500">
                                                        Linked to a user record in User Management (active accounts only).
                                                    </p>
                                                </>
                                            )}
                                            {errors.user_id && (
                                                <p className="mt-1 text-xs text-red-500">{errors.user_id}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="mb-1.5 block text-[13px] font-semibold text-gray-700">Date Issued</label>
                                                <input
                                                    type="date"
                                                    value={data.transacted_at}
                                                    onChange={(e) => setData('transacted_at', e.target.value)}
                                                    className="block w-full rounded-lg border border-[#d2deeb] bg-white px-3 py-1.5 text-[13px] text-gray-800 focus:border-[#4663ac] focus:outline-none focus:ring-1 focus:ring-[#4663ac] shadow-sm transition-colors"
                                                />
                                                {errors.transacted_at && (
                                                    <p className="mt-1 text-xs text-red-500">{errors.transacted_at}</p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="mb-1.5 block text-[13px] font-semibold text-gray-700">Expected Return</label>
                                                <input
                                                    type="date"
                                                    value={data.expected_return_date}
                                                    onChange={(e) => setData('expected_return_date', e.target.value)}
                                                    className="block w-full rounded-lg border border-[#d2deeb] bg-white px-3 py-1.5 text-[13px] text-gray-800 focus:border-[#4663ac] focus:outline-none focus:ring-1 focus:ring-[#4663ac] shadow-sm transition-colors"
                                                />
                                                {errors.expected_return_date && (
                                                    <p className="mt-1 text-xs text-red-500">{errors.expected_return_date}</p>
                                                )}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="mb-1.5 block text-[13px] font-semibold text-gray-700">Condition on Checkout/Return</label>
                                            <select className="block w-full rounded-lg border border-[#d2deeb] bg-white px-3 py-2.5 text-[13px] text-gray-800 focus:border-[#4663ac] focus:outline-none focus:ring-1 focus:ring-[#4663ac] shadow-sm transition-colors">
                                                <option value="Good">Good</option>
                                                <option value="Fair">Fair (Minor wear)</option>
                                                <option value="Poor">Poor (Requires attention)</option>
                                                <option value="Damaged">Damaged</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="mb-1.5 block text-[13px] font-semibold text-gray-700">Remarks</label>
                                            <textarea
                                                value={data.remarks}
                                                onChange={(e) => setData('remarks', e.target.value)}
                                                className="block w-full rounded-lg border border-[#d2deeb] bg-white px-3 py-2.5 text-[13px] text-gray-800 placeholder-gray-400 focus:border-[#4663ac] focus:outline-none focus:ring-1 focus:ring-[#4663ac] shadow-sm transition-colors"
                                                placeholder="Any additional notes..."
                                                rows={2}
                                            />
                                            {errors.remarks && <p className="mt-1 text-xs text-red-500">{errors.remarks}</p>}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 border-t border-gray-100 bg-gray-50/50 px-6 py-4">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="rounded-lg border border-[#d2deeb] bg-white px-5 py-2.5 text-[13px] font-semibold text-gray-600 shadow-sm hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing || isSubmittingRequest}
                                    className="rounded-lg bg-[#4663ac] hover:bg-[#3f59a3] disabled:opacity-60 px-6 py-2.5 text-[13px] font-semibold text-white shadow-sm transition-colors"
                                >
                                    {processing || isSubmittingRequest
                                        ? 'Processing…'
                                        : staffBorrowOnly
                                          ? 'Submit request'
                                          : 'Process Transaction'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </LabLayout>
    );
}
