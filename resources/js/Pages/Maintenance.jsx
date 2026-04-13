import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { router, useForm, usePage } from '@inertiajs/react';
import {
    Plus,
    Search,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    Paperclip,
    FileUp,
} from 'lucide-react';
import LabLayout from '@/Layouts/LabLayout';

function todayISODate() {
    return new Date().toISOString().slice(0, 10);
}

export default function Maintenance({ inventoryItems = [], incidents = [] }) {
    const { auth, flash } = usePage().props;
    const [isIncidentModalOpen, setIsIncidentModalOpen] = useState(false);
    const [toast, setToast] = useState(null);
    const [itemQuery, setItemQuery] = useState('');
    const [itemPickerOpen, setItemPickerOpen] = useState(false);
    const [fileInputKey, setFileInputKey] = useState(0);
    const [confirmResolveId, setConfirmResolveId] = useState(null);
    const [resolvingId, setResolvingId] = useState(null);
    const [search, setSearch] = useState('');

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        item_id: '',
        severity: 'medium',
        action_taken: 'pending',
        occurred_at: todayISODate(),
        estimated_cost: '',
        damage_details: '',
        mark_resolved: false,
        attachment: null,
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

    const reporterLabel =
        auth?.user?.name ?? auth?.user?.username ?? auth?.user?.email ?? '—';

    const selectedItem = useMemo(
        () => inventoryItems.find((it) => String(it.id) === String(data.item_id)),
        [inventoryItems, data.item_id]
    );

    const itemSuggestions = useMemo(() => {
        const q = itemQuery.trim().toLowerCase();
        if (!q) return inventoryItems.slice(0, 50);
        return inventoryItems
            .filter(
                (it) =>
                    String(it.sku).toLowerCase().includes(q) ||
                    String(it.name).toLowerCase().includes(q)
            )
            .slice(0, 50);
    }, [inventoryItems, itemQuery]);

    const filteredIncidents = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return incidents;
        return incidents.filter((inc) =>
            [inc.id, inc.item, inc.reportedBy, inc.date, inc.severity, inc.action, inc.damage, inc.cost]
                .filter(Boolean)
                .some((value) => String(value).toLowerCase().includes(q))
        );
    }, [incidents, search]);

    const openIncidentModal = useCallback(() => {
        clearErrors();
        reset({
            item_id: '',
            severity: 'medium',
            action_taken: 'pending',
            occurred_at: todayISODate(),
            estimated_cost: '',
            damage_details: '',
            mark_resolved: false,
            attachment: null,
        });
        setItemQuery('');
        setItemPickerOpen(false);
        setFileInputKey((k) => k + 1);
        setIsIncidentModalOpen(true);
    }, [clearErrors, reset]);

    const closeIncidentModal = useCallback(() => {
        setIsIncidentModalOpen(false);
        setItemPickerOpen(false);
        clearErrors();
    }, [clearErrors]);

    const pickItem = useCallback(
        (item) => {
            setData('item_id', item.id);
            setItemQuery(`${item.name} (${item.sku})`);
            setItemPickerOpen(false);
        },
        [setData]
    );

    const submitReport = (e) => {
        e.preventDefault();
        post(route('maintenance.store'), {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                closeIncidentModal();
                reset({
                    item_id: '',
                    severity: 'medium',
                    action_taken: 'pending',
                    occurred_at: todayISODate(),
                    estimated_cost: '',
                    damage_details: '',
                    mark_resolved: false,
                    attachment: null,
                });
                setItemQuery('');
                setFileInputKey((k) => k + 1);
            },
        });
    };

    const getSeverityStyle = (severity) => {
        switch (severity) {
            case 'Critical':
                return 'text-red-600 bg-red-50 border-red-200';
            case 'High':
                return 'text-orange-600 bg-orange-50 border-orange-200';
            case 'Medium':
                return 'text-yellow-600 bg-yellow-50 border-yellow-200';
            case 'Low':
                return 'text-blue-600 bg-blue-50 border-blue-200';
            default:
                return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    const getActionStyle = (action) => {
        switch (action) {
            case 'Fixed/Repaired':
                return 'text-green-700 font-semibold';
            case 'Replaced':
            case 'Discarded':
                return 'text-gray-500';
            case 'Under Repair':
                return 'text-blue-600 font-medium';
            case 'Pending':
                return 'text-orange-500 font-medium tracking-wide';
            default:
                return 'text-gray-600';
        }
    };

    const submitResolve = useCallback(() => {
        if (confirmResolveId === null) return;
        setResolvingId(confirmResolveId);
        router.patch(
            route('maintenance.resolve', confirmResolveId),
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    setConfirmResolveId(null);
                },
                onFinish: () => {
                    setResolvingId(null);
                },
            }
        );
    }, [confirmResolveId]);

    return (
        <LabLayout title="Maintenance">
            {toast && (
                <div
                    className={`fixed right-6 top-20 z-[60] max-w-sm rounded-lg border px-4 py-3 text-[13px] font-medium shadow-lg ${
                        toast.type === 'success'
                            ? 'border-green-200 bg-green-50 text-green-800'
                            : 'border-red-200 bg-red-50 text-red-800'
                    }`}
                    role="status"
                >
                    {toast.message}
                </div>
            )}

            <div className="flex-1 overflow-auto p-8">
                <div className="mx-auto w-full max-w-full rounded-xl border border-[#e1f1fd] bg-white shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
                    <div className="flex flex-col items-start justify-between px-8 py-6 sm:flex-row sm:items-center">
                        <div className="flex items-center gap-3">
                            <div className="flex h-[42px] w-[42px] items-center justify-center rounded-lg border border-[#d2deeb] bg-white text-gray-600 shadow-sm">
                                <AlertTriangle className="h-[22px] w-[22px] text-orange-500" strokeWidth={1.5} />
                            </div>
                            <div>
                                <h1 className="text-[22px] font-bold tracking-tight text-gray-800">Incident Reports</h1>
                                <p className="mt-0.5 text-xs text-gray-500">
                                    {filteredIncidents.length} incident{filteredIncidents.length === 1 ? '' : 's'} shown
                                </p>
                            </div>
                        </div>
                        <div className="mt-4 flex w-full items-center gap-3 sm:mt-0 sm:w-auto">
                            <div className="relative w-full sm:w-auto">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <Search className="h-4 w-4 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="block w-full rounded-lg border border-[#d2deeb] bg-[#f8fafc] py-2.5 pl-10 pr-3 text-[13px] text-gray-800 shadow-sm transition-colors placeholder:text-gray-400 focus:border-[#4663ac] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#4663ac] sm:w-64"
                                    placeholder="Search incidents..."
                                />
                            </div>
                            <button
                                type="button"
                                onClick={openIncidentModal}
                                className="flex items-center gap-2 whitespace-nowrap rounded-lg bg-[#1e293b] px-4 py-2.5 text-[13px] font-semibold text-white shadow-sm transition-colors hover:bg-gray-800"
                            >
                                <Plus className="h-4 w-4" strokeWidth={2.5} />
                                Report Incident
                            </button>
                        </div>
                    </div>

                    <div className="mt-2 w-full min-w-0 border-t border-[#f1f5f9]">
                        <table className="w-full table-fixed border-collapse text-left text-[12px] leading-snug sm:text-[13px]">
                            <colgroup>
                                <col style={{ width: '2.25rem' }} />
                                <col style={{ width: '4.75rem' }} />
                                <col style={{ width: '24%' }} />
                                <col style={{ width: '11%' }} />
                                <col style={{ width: '9.5%' }} />
                                <col style={{ width: '8%' }} />
                                <col style={{ width: '8.5%' }} />
                                <col style={{ width: '11%' }} />
                                <col style={{ width: '2.75rem' }} />
                                <col style={{ width: '10%' }} />
                                <col style={{ width: '5.25rem' }} />
                            </colgroup>
                            <thead className="border-b border-[#f1f5f9] bg-[#f8fafc] text-[10px] font-bold uppercase tracking-wider text-gray-400 sm:text-[11px]">
                                <tr>
                                    <th className="px-2 py-3 font-normal sm:px-3">
                                        <div className="mx-auto h-4 w-4 rounded border border-gray-300" />
                                    </th>
                                    <th className="px-2 py-3 sm:px-3">ID</th>
                                    <th className="min-w-0 px-2 py-3 sm:px-3">Item</th>
                                    <th className="min-w-0 px-2 py-3 sm:px-3">Reported By</th>
                                    <th className="px-2 py-3 sm:px-3">Date</th>
                                    <th className="px-2 py-3 sm:px-3">Severity</th>
                                    <th className="px-2 py-3 sm:px-3" title="Estimated cost">
                                        Est.
                                    </th>
                                    <th className="min-w-0 px-2 py-3 sm:px-3">Action Taken</th>
                                    <th className="px-1 py-3 text-center sm:px-2" title="Attachment">
                                        File
                                    </th>
                                    <th className="min-w-0 px-2 py-3 sm:px-3">Status</th>
                                    <th className="whitespace-nowrap px-2 py-3 text-center sm:px-3">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#f1f5f9] text-gray-600">
                                {incidents.length === 0 ? (
                                    <tr>
                                        <td colSpan={11} className="px-4 py-10 text-center text-sm text-gray-500">
                                            No incident reports yet. File one using &ldquo;Report Incident&rdquo;.
                                        </td>
                                    </tr>
                                ) : filteredIncidents.length === 0 ? (
                                    <tr>
                                        <td colSpan={11} className="px-4 py-10 text-center text-sm text-gray-500">
                                            No matching incidents found.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredIncidents.map((inc) => (
                                        <tr
                                            key={inc.numericId}
                                            className={`group transition-colors hover:bg-[#f8fafc] ${
                                                inc.severity === 'Critical' && !inc.resolved ? 'bg-red-50/30' : ''
                                            }`}
                                        >
                                            <td className="px-2 py-3 sm:px-3">
                                                <div className="mx-auto flex h-4 w-4 items-center justify-center rounded border border-gray-300" />
                                            </td>
                                            <td className="px-2 py-3 font-semibold text-gray-800 sm:px-3">
                                                {inc.id}
                                            </td>
                                            <td className="min-w-0 px-2 py-3 sm:px-3">
                                                <div className="cursor-pointer break-words font-semibold text-[#4663ac] hover:underline">
                                                    {inc.item}
                                                </div>
                                                <div className="mt-0.5 break-words text-[10px] text-gray-500 sm:text-[11px]">
                                                    {inc.damage}
                                                </div>
                                            </td>
                                            <td className="min-w-0 break-words px-2 py-3 font-medium text-gray-700 sm:px-3">
                                                {inc.reportedBy}
                                            </td>
                                            <td className="whitespace-nowrap px-2 py-3 text-gray-600 sm:px-3">
                                                {inc.date}
                                            </td>
                                            <td className="px-2 py-3 sm:px-3">
                                                <span
                                                    className={`inline-flex max-w-full items-center rounded border px-1.5 py-0.5 text-[10px] font-semibold sm:px-2 sm:text-[11px] ${getSeverityStyle(inc.severity)}`}
                                                >
                                                    {inc.severity}
                                                </span>
                                            </td>
                                            <td className="min-w-0 break-words px-2 py-3 text-gray-600 sm:px-3">
                                                {inc.cost}
                                            </td>
                                            <td
                                                className={`min-w-0 break-words px-2 py-3 sm:px-3 ${getActionStyle(inc.action)}`}
                                            >
                                                {inc.action}
                                            </td>
                                            <td className="px-1 py-3 text-center sm:px-2">
                                                <div className="flex justify-center">
                                                    {inc.attachmentUrl ? (
                                                        <a
                                                            href={inc.attachmentUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="group flex h-7 w-7 items-center justify-center rounded-lg bg-gray-50 text-gray-500 shadow-sm transition-all hover:bg-[#3f59a3] hover:text-white sm:h-8 sm:w-8"
                                                            title="Open attachment"
                                                        >
                                                            <Paperclip className="h-3.5 w-3.5 transform group-hover:rotate-12 sm:h-4 sm:w-4" />
                                                        </a>
                                                    ) : (
                                                        <span
                                                            className="flex h-7 w-7 items-center justify-center rounded-lg bg-gray-50 text-gray-300 sm:h-8 sm:w-8"
                                                            title="No attachment"
                                                        >
                                                            <Paperclip className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="min-w-0 px-2 py-3 sm:px-3">
                                                {inc.resolved ? (
                                                    <span className="inline-flex max-w-full items-center gap-1 rounded border border-green-200 bg-green-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 sm:gap-1.5 sm:px-2 sm:text-[11px]">
                                                        <CheckCircle2 className="h-2.5 w-2.5 shrink-0 text-emerald-600 sm:h-3 sm:w-3" />
                                                        <span className="break-words">Resolved</span>
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex max-w-full items-center gap-1 rounded border border-orange-100 bg-orange-50 px-1.5 py-0.5 text-[10px] font-semibold text-orange-700 sm:gap-1.5 sm:px-2 sm:text-[11px]">
                                                        <AlertTriangle className="h-2.5 w-2.5 shrink-0 sm:h-3 sm:w-3" />
                                                        <span className="break-words">Open</span>
                                                    </span>
                                                )}
                                            </td>
                                            <td className="whitespace-nowrap px-2 py-3 text-center sm:px-3">
                                                <div className="flex items-center justify-center">
                                                    {!inc.resolved ? (
                                                        <button
                                                            type="button"
                                                            onClick={() => setConfirmResolveId(inc.numericId)}
                                                            disabled={resolvingId === inc.numericId}
                                                            className="rounded-md border border-gray-200 bg-white px-2 py-1 text-[10px] font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 sm:px-2.5 sm:text-[11px]"
                                                        >
                                                            Resolve
                                                        </button>
                                                    ) : (
                                                        <span className="text-[11px] text-gray-400">—</span>
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

            {confirmResolveId !== null && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
                    <div
                        className="w-full max-w-md rounded-xl border border-gray-100 bg-white p-6 shadow-2xl"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="resolve-dialog-title"
                    >
                        <h3
                            id="resolve-dialog-title"
                            className="text-lg font-bold text-gray-800"
                        >
                            Mark incident resolved?
                        </h3>
                        <p className="mt-2 text-[13px] leading-relaxed text-gray-600">
                            This will close the report and return the linked item to available inventory as
                            repaired.
                        </p>
                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setConfirmResolveId(null)}
                                disabled={resolvingId !== null}
                                className="rounded-lg border border-[#d2deeb] bg-white px-4 py-2.5 text-[13px] font-semibold text-gray-600 shadow-sm transition-colors hover:bg-gray-50 disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={submitResolve}
                                disabled={resolvingId !== null}
                                className="rounded-lg bg-green-600 px-4 py-2.5 text-[13px] font-semibold text-white shadow-sm transition-colors hover:bg-green-700 disabled:opacity-60"
                            >
                                {resolvingId !== null ? 'Saving…' : 'Confirm'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isIncidentModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
                        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                            <div>
                                <h2 className="text-lg font-bold text-gray-800">Report Incident</h2>
                                <p className="text-[13px] text-gray-500">Log equipment damage or maintenance needs</p>
                            </div>
                            <button
                                type="button"
                                onClick={closeIncidentModal}
                                className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                            >
                                <XCircle className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={submitReport} className="flex min-h-0 flex-1 flex-col">
                            <div className="flex-1 overflow-y-auto px-6 py-6">
                                <div className="grid grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-2">
                                    <div className="relative md:col-span-1">
                                        <label className="mb-1.5 block text-[13px] font-semibold text-gray-700">
                                            Item Issue
                                        </label>
                                        <input
                                            type="text"
                                            autoComplete="off"
                                            value={itemQuery}
                                            onChange={(e) => {
                                                setItemQuery(e.target.value);
                                                setItemPickerOpen(true);
                                                if (!e.target.value.trim()) {
                                                    setData('item_id', '');
                                                }
                                            }}
                                            onFocus={() => setItemPickerOpen(true)}
                                            className="block w-full rounded-lg border border-[#d2deeb] bg-white px-3 py-2.5 text-[13px] text-gray-800 shadow-sm transition-colors placeholder:text-gray-400 focus:border-[#4663ac] focus:outline-none focus:ring-1 focus:ring-[#4663ac]"
                                            placeholder="Search by SKU or name…"
                                        />
                                        {itemPickerOpen && itemSuggestions.length > 0 && (
                                            <ul className="absolute z-20 mt-1 max-h-48 w-full overflow-auto rounded-lg border border-[#d2deeb] bg-white py-1 text-[13px] shadow-lg">
                                                {itemSuggestions.map((it) => (
                                                    <li key={it.id}>
                                                        <button
                                                            type="button"
                                                            className="w-full px-3 py-2 text-left text-gray-800 hover:bg-[#f1f5f9]"
                                                            onMouseDown={(ev) => ev.preventDefault()}
                                                            onClick={() => pickItem(it)}
                                                        >
                                                            <span className="font-medium">{it.name}</span>
                                                            <span className="ml-2 text-gray-500">{it.sku}</span>
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                        {selectedItem && !itemPickerOpen && (
                                            <p className="mt-1 text-[11px] text-gray-500">
                                                Selected: {selectedItem.sku}
                                            </p>
                                        )}
                                        {errors.item_id && (
                                            <p className="mt-1 text-xs text-red-600">{errors.item_id}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="mb-1.5 block text-[13px] font-semibold text-gray-700">
                                            Severity
                                        </label>
                                        <select
                                            value={data.severity}
                                            onChange={(e) => setData('severity', e.target.value)}
                                            className="block w-full rounded-lg border border-[#d2deeb] bg-white px-3 py-2.5 text-[13px] text-gray-800 shadow-sm transition-colors focus:border-[#4663ac] focus:outline-none focus:ring-1 focus:ring-[#4663ac]"
                                        >
                                            <option value="low">Low</option>
                                            <option value="medium">Medium</option>
                                            <option value="high">High</option>
                                            <option value="critical">Critical</option>
                                        </select>
                                        {errors.severity && (
                                            <p className="mt-1 text-xs text-red-600">{errors.severity}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="mb-1.5 block text-[13px] font-semibold text-gray-700">
                                            Reported By
                                        </label>
                                        <input
                                            type="text"
                                            readOnly
                                            value={reporterLabel}
                                            className="block w-full cursor-not-allowed rounded-lg border border-[#d2deeb] bg-[#f8fafc] px-3 py-2.5 text-[13px] text-gray-700 shadow-sm"
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-1.5 block text-[13px] font-semibold text-gray-700">
                                            Action Taken
                                        </label>
                                        <select
                                            value={data.action_taken}
                                            onChange={(e) => setData('action_taken', e.target.value)}
                                            className="block w-full rounded-lg border border-[#d2deeb] bg-white px-3 py-2.5 text-[13px] text-gray-800 shadow-sm transition-colors focus:border-[#4663ac] focus:outline-none focus:ring-1 focus:ring-[#4663ac]"
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="under_repair">Under Repair</option>
                                            <option value="replaced">Replaced</option>
                                            <option value="discarded">Discarded</option>
                                        </select>
                                        {errors.action_taken && (
                                            <p className="mt-1 text-xs text-red-600">{errors.action_taken}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="mb-1.5 block text-[13px] font-semibold text-gray-700">
                                            Incident Date
                                        </label>
                                        <input
                                            type="date"
                                            value={data.occurred_at}
                                            onChange={(e) => setData('occurred_at', e.target.value)}
                                            className="block w-full rounded-lg border border-[#d2deeb] bg-white px-3 py-2 text-[13px] text-gray-800 shadow-sm transition-colors focus:border-[#4663ac] focus:outline-none focus:ring-1 focus:ring-[#4663ac]"
                                        />
                                        {errors.occurred_at && (
                                            <p className="mt-1 text-xs text-red-600">{errors.occurred_at}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="mb-1.5 block text-[13px] font-semibold text-gray-700">
                                            Est. Repair Cost
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-gray-400">
                                                ₱
                                            </span>
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={data.estimated_cost}
                                                onChange={(e) => setData('estimated_cost', e.target.value)}
                                                className="block w-full rounded-lg border border-[#d2deeb] bg-white py-2.5 pl-7 pr-3 text-[13px] text-gray-800 shadow-sm transition-colors placeholder:text-gray-400 focus:border-[#4663ac] focus:outline-none focus:ring-1 focus:ring-[#4663ac]"
                                                placeholder="0.00"
                                            />
                                        </div>
                                        {errors.estimated_cost && (
                                            <p className="mt-1 text-xs text-red-600">{errors.estimated_cost}</p>
                                        )}
                                    </div>

                                    <div className="space-y-4 md:col-span-2">
                                        <div>
                                            <label className="mb-1.5 block text-[13px] font-semibold text-gray-700">
                                                Damage Details
                                            </label>
                                            <textarea
                                                value={data.damage_details}
                                                onChange={(e) => setData('damage_details', e.target.value)}
                                                className="block w-full rounded-lg border border-[#d2deeb] bg-white px-3 py-2.5 text-[13px] text-gray-800 shadow-sm transition-colors placeholder:text-gray-400 focus:border-[#4663ac] focus:outline-none focus:ring-1 focus:ring-[#4663ac]"
                                                placeholder="Describe the damage..."
                                                rows={4}
                                            />
                                            {errors.damage_details && (
                                                <p className="mt-1 text-xs text-red-600">{errors.damage_details}</p>
                                            )}
                                        </div>
                                        <div className="flex items-center">
                                            <label className="group relative flex cursor-pointer items-center gap-3">
                                                <div className="relative flex h-5 w-5 items-center justify-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={data.mark_resolved}
                                                        onChange={(e) => setData('mark_resolved', e.target.checked)}
                                                        className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-[#d2deeb] bg-white shadow-sm transition-all checked:border-green-600 checked:bg-green-600 focus:outline-none focus:ring-1 focus:ring-green-600"
                                                    />
                                                    <svg
                                                        className="pointer-events-none absolute h-3.5 w-3.5 text-white opacity-0 transition-opacity peer-checked:opacity-100"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="3"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        aria-hidden
                                                    >
                                                        <polyline points="20 6 9 17 4 12" />
                                                    </svg>
                                                </div>
                                                <span className="text-[13px] font-semibold text-gray-700 transition-colors group-hover:text-gray-900">
                                                    Mark as Resolved
                                                </span>
                                            </label>
                                        </div>
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="mb-1.5 block text-[13px] font-semibold italic text-gray-700 opacity-80">
                                            Supporting Document / Evidence
                                        </label>
                                        <div className="group relative min-h-[140px]">
                                            <input
                                                key={fileInputKey}
                                                type="file"
                                                name="attachment"
                                                accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
                                                className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
                                                onChange={(e) =>
                                                    setData('attachment', e.target.files?.[0] ?? null)
                                                }
                                            />
                                            <div className="flex h-full min-h-[140px] w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 bg-gray-50/50 px-4 py-6 text-center shadow-inner transition-all group-hover:border-[#3f59a3] group-hover:bg-white">
                                                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white text-gray-400 shadow-sm transition-colors group-hover:text-[#3f59a3]">
                                                    <FileUp className="h-6 w-6" />
                                                </div>
                                                <span className="block font-bold text-gray-800">Upload Attachment</span>
                                                <span className="mt-1 text-[11px] text-gray-500">
                                                    PDF, PNG, JPG up to 10MB (optional)
                                                </span>
                                                {data.attachment && (
                                                    <span className="mt-2 max-w-full truncate px-2 text-[11px] font-medium text-[#4663ac]">
                                                        {data.attachment.name}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        {errors.attachment && (
                                            <p className="mt-1 text-xs text-red-600">{errors.attachment}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 border-t border-gray-100 bg-gray-50/50 px-6 py-4">
                                <button
                                    type="button"
                                    onClick={closeIncidentModal}
                                    className="rounded-lg border border-[#d2deeb] bg-white px-5 py-2.5 text-[13px] font-semibold text-gray-600 shadow-sm transition-colors hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="rounded-lg bg-orange-600 px-6 py-2.5 text-[13px] font-semibold text-white shadow-sm transition-colors hover:bg-orange-700 disabled:opacity-60"
                                >
                                    {processing ? 'Filing…' : 'File Report'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </LabLayout>
    );
}
