import React, { useEffect, useState } from 'react';
import { router, useForm, usePage } from '@inertiajs/react';
import {
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

export default function Transactions({ items = [], transactions: transactionsProp = [], borrowers = [] }) {
    const { flash, auth } = usePage().props;
    const [isNewTxModalOpen, setIsNewTxModalOpen] = useState(false);
    const [toast, setToast] = useState(null);
    const [returningId, setReturningId] = useState(null);

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

    const defaultBorrowerId = () => {
        const authId = auth?.user?.id != null ? String(auth.user.id) : null;
        if (authId && borrowers.some((b) => String(b.id) === authId)) {
            return authId;
        }
        return borrowers.length > 0 ? String(borrowers[0].id) : '';
    };

    const openModal = () => {
        clearErrors();
        reset({
            transaction_type: 'borrow',
            user_id: defaultBorrowerId(),
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
        post(route('transactions.store'), {
            preserveState: true,
            preserveScroll: true,
            only: ['transactions', 'items', 'borrowers', 'flash', 'errors', 'systemStatus'],
            onSuccess: () => {
                closeModal();
                reset({
                    transaction_type: 'borrow',
                    user_id: defaultBorrowerId(),
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
            only: ['transactions', 'items', 'borrowers', 'flash', 'errors', 'systemStatus'],
            onFinish: () => setReturningId(null),
        });
    };

    const transactions = transactionsProp.length
        ? transactionsProp
        : [];

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Completed':
            case 'Returned':
            case 'completed':
                return 'text-green-500 bg-green-50';
            case 'Overdue':
                return 'text-red-500 bg-red-50';
            case 'Active':
            case 'Issued':
                return 'text-blue-500 bg-blue-50';
            case 'Cancelled':
                return 'text-gray-500 bg-gray-100';
            default:
                return 'text-gray-600 bg-gray-50';
        }
    };

    const selectedItem = items.find((i) => String(i.id) === String(data.item_id));

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

            <div className="flex-1 overflow-auto p-8">
                <div className="mx-auto w-full max-w-[1100px] rounded-xl bg-white shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-[#e1f1fd]">
                    {/* Header Section */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-8 py-6">
                        <div className="flex items-center gap-3">
                            <div className="flex h-[42px] w-[42px] items-center justify-center rounded-lg bg-white border border-[#d2deeb] text-gray-600 shadow-sm">
                                <FileText className="h-[22px] w-[22px]" strokeWidth={1.5} />
                            </div>
                            <h1 className="text-[22px] font-bold text-gray-800 tracking-tight">Transactions</h1>
                        </div>
                        <div className="flex items-center gap-3 w-full sm:w-auto mt-4 sm:mt-0">
                            <div className="relative w-full sm:w-auto">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <Search className="h-4 w-4 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    className="block w-full sm:w-64 rounded-lg border border-[#d2deeb] bg-[#f8fafc] py-2.5 pl-10 pr-3 text-[13px] text-gray-800 placeholder-gray-400 focus:border-[#4663ac] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#4663ac] transition-colors shadow-sm"
                                    placeholder="Search transactions..."
                                />
                            </div>
                            <button
                                type="button"
                                onClick={openModal}
                                className="flex items-center gap-2 rounded-lg bg-[#1e293b] px-4 py-2.5 text-[13px] font-semibold text-white shadow-sm hover:bg-gray-800 transition-colors whitespace-nowrap"
                            >
                                <Plus className="h-4 w-4" strokeWidth={2.5} />
                                New Transaction
                            </button>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto border-t border-[#f1f5f9] mt-2">
                        <table className="w-full text-left text-[13px] whitespace-nowrap">
                            <thead className="bg-[#f8fafc] text-[11px] font-bold text-gray-400 uppercase tracking-wider border-b border-[#f1f5f9]">
                                <tr>
                                    <th className="px-5 py-3.5 w-5 font-normal">
                                        <div className="w-4 h-4 rounded border border-gray-300"></div>
                                    </th>
                                    <th className="px-5 py-3.5 cursor-pointer hover:text-gray-600 transition-colors">ID <span className="text-[10px] ml-1">↑↓</span></th>
                                    <th className="px-5 py-3.5 cursor-pointer hover:text-gray-600 transition-colors">Item <span className="text-[10px] ml-1">↑↓</span></th>
                                    <th className="px-5 py-3.5 cursor-pointer hover:text-gray-600 transition-colors">User <span className="text-[10px] ml-1">↑↓</span></th>
                                    <th className="px-5 py-3.5 cursor-pointer hover:text-gray-600 transition-colors">Type <span className="text-[10px] ml-1">↑↓</span></th>
                                    <th className="px-5 py-3.5 cursor-pointer hover:text-gray-600 transition-colors">Borrow Date <span className="text-[10px] ml-1">↑↓</span></th>
                                    <th className="px-5 py-3.5 cursor-pointer hover:text-gray-600 transition-colors">Exp. Return <span className="text-[10px] ml-1">↑↓</span></th>
                                    <th className="px-5 py-3.5 cursor-pointer hover:text-gray-600 transition-colors">Status <span className="text-[10px] ml-1">↑↓</span></th>
                                    <th className="px-5 py-3.5 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#f1f5f9] text-gray-600">
                                {transactions.length === 0 ? (
                                    <tr>
                                        <td colSpan={9} className="px-5 py-10 text-center text-[13px] text-gray-500">
                                            No transactions yet. Start with <span className="font-semibold text-gray-700">New Transaction</span>.
                                        </td>
                                    </tr>
                                ) : (
                                    transactions.map((trx, i) => (
                                        <tr key={trx.id} className={`hover:bg-[#f8fafc] transition-colors group ${i === 2 ? 'bg-[#f8fafc]' : ''}`}>
                                            <td className="px-5 py-3.5">
                                                <div className={`w-4 h-4 rounded border ${i === 2 ? 'bg-[#4663ac] border-[#4663ac]' : 'border-gray-300'} flex items-center justify-center`}>
                                                    {i === 2 && <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 4L4 7L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                                                </div>
                                            </td>
                                            <td className="px-5 py-3.5 font-medium text-gray-700">{trx.displayId ?? trx.id}</td>
                                            <td className="px-5 py-3.5 font-semibold text-gray-800">{trx.item}</td>
                                            <td className="px-5 py-3.5 text-gray-600">{trx.user}</td>
                                            <td className="px-5 py-3.5 font-medium text-gray-700">{trx.type}</td>
                                            <td className="px-5 py-3.5 text-gray-600">{trx.borrowDate}</td>
                                            <td className="px-5 py-3.5 text-gray-600">{trx.returnDate}</td>
                                            <td className="px-5 py-3.5">
                                                <span className={`inline-flex items-center rounded bg-opacity-50 px-2 py-0.5 text-[11px] font-bold shadow-sm border border-transparent ${getStatusStyle(trx.status)}`}>
                                                    {trx.status}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center justify-end gap-2 pr-2">
                                                    {trx.canReturnItem ? (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleReturnItem(trx.id)}
                                                            disabled={returningId === trx.id}
                                                            className="rounded-md border border-gray-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                                                        >
                                                            {returningId === trx.id ? 'Returning…' : 'Return Item'}
                                                        </button>
                                                    ) : (
                                                        <span
                                                            className="inline-block min-w-[3.25rem] text-center text-[11px] font-semibold text-gray-300"
                                                            aria-hidden
                                                        >
                                                            —
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

            {/* New Transaction Modal */}
            {isNewTxModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="w-full max-w-2xl rounded-xl bg-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <form onSubmit={submitTransaction}>
                            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                                <div>
                                    <h2 className="text-lg font-bold text-gray-800">Process Transaction</h2>
                                    <p className="text-[13px] text-gray-500">Checkout or return a lab item</p>
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
                                                Borrower
                                            </label>
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
                                            {errors.user_id && (
                                                <p className="mt-1 text-xs text-red-500">{errors.user_id}</p>
                                            )}
                                            <p className="mt-1 text-[12px] text-gray-500">
                                                Linked to a user record in User Management (active accounts only).
                                            </p>
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
                                    disabled={processing}
                                    className="rounded-lg bg-[#4663ac] hover:bg-[#3f59a3] disabled:opacity-60 px-6 py-2.5 text-[13px] font-semibold text-white shadow-sm transition-colors"
                                >
                                    {processing ? 'Processing…' : 'Process Transaction'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </LabLayout>
    );
}
