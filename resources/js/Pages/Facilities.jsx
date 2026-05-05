import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import {
    Building2,
    CalendarClock,
    Plus,
    MoreVertical,
    Search,
    MapPin,
    CheckCircle2,
    XCircle,
    Users,
    Clock,
    Activity,
    Package,
    Bookmark,
} from 'lucide-react';

import LabLayout from '@/Layouts/LabLayout';

function occupancyPercent(current, max) {
    if (max == null || max <= 0) {
        return 0;
    }
    return (current / max) * 100;
}

const FacilityCard = memo(function FacilityCard({ fac, getStatusStyle, onSelect }) {
    const occupancyPercentage = occupancyPercent(
        fac.current_occupancy ?? 0,
        fac.max_capacity ?? 0
    );

    return (
        <div
            role="button"
            tabIndex={0}
            onClick={() => onSelect(fac)}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelect(fac);
                }
            }}
            className="bg-white rounded-xl border border-gray-200/80 shadow-[0_1px_3px_rgba(15,23,42,0.06)] p-4 hover:border-[#c5d4eb] hover:shadow-md transition-all flex flex-col h-full min-h-0 cursor-pointer group active:scale-[0.99]"
        >
            <div className="flex justify-between items-start gap-2 mb-3 min-w-0">
                <div className="min-w-0 flex-1">
                    <h3 className="text-[15px] font-semibold text-gray-900 leading-snug line-clamp-2 lg:group-hover:text-[#4663ac] transition-colors">
                        {fac.lab_name}
                    </h3>
                    <p className="text-[12px] text-gray-500 flex items-start gap-1.5 mt-1.5 leading-snug">
                        <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{fac.building_name}, Floor {fac.floor_level}</span>
                    </p>
                </div>
                <span className={`shrink-0 px-2 py-0.5 rounded-md border text-[10px] font-semibold uppercase tracking-wide ${getStatusStyle(fac.status)}`}>
                    {fac.status}
                </span>
            </div>

            <div className="grid grid-cols-2 gap-x-3 gap-y-2.5 mb-3 p-2.5 bg-slate-50/90 rounded-lg border border-slate-100/80">
                <div className="min-w-0">
                    <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-wide mb-0.5 flex items-center gap-0.5 truncate">
                        <Users className="w-3 h-3 shrink-0" /> Manager
                    </p>
                    <p className="text-[12px] font-medium text-gray-800 truncate" title={fac.manager_id}>{fac.manager_id}</p>
                </div>
                <div className="min-w-0">
                    <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-wide mb-0.5 flex items-center gap-0.5 truncate">
                        <Clock className="w-3 h-3 shrink-0" /> Hours
                    </p>
                    <p className="text-[12px] font-medium text-gray-800 truncate" title={fac.opening_hours}>{fac.opening_hours}</p>
                </div>
                <div className="col-span-2 min-w-0 border-t border-slate-100/90 pt-2.5 mt-0.5">
                    <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-wide mb-0.5 flex items-center gap-0.5">
                        <Package className="w-3 h-3 shrink-0" /> Items
                    </p>
                    <p className="text-[12px] font-medium text-gray-800">
                        {fac.total_items ?? 0} <span className="text-gray-400 font-normal text-[11px]">in lab</span>
                    </p>
                </div>
            </div>

            <div className="mb-3">
                <div className="flex justify-between items-end gap-2 mb-1">
                    <p className="text-[11px] font-semibold text-gray-500 flex items-center gap-1 shrink-0">
                        <Activity className="w-3 h-3" /> Occupancy
                    </p>
                    <p className="text-[12px] font-semibold text-gray-900 tabular-nums shrink-0">
                        {fac.current_occupancy ?? 0}
                        <span className="text-gray-400 font-medium"> / {fac.max_capacity ?? 0}</span>
                    </p>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full ${occupancyPercentage > 80 ? 'bg-red-500' : 'bg-[#4663ac]'}`}
                        style={{ width: `${Math.min(occupancyPercentage, 100)}%` }}
                    ></div>
                </div>
            </div>

            <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                    {!fac.is_available_for_booking ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-400">
                            <XCircle className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">Not available</span>
                        </span>
                    ) : fac.is_reserved_now ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800">
                            <Bookmark className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">Reserved</span>
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">Open for booking</span>
                        </span>
                    )}
                </div>
                <button
                    type="button"
                    onClick={(e) => e.stopPropagation()}
                    className="p-1.5 rounded-md hover:bg-slate-100 text-gray-400 hover:text-gray-600 transition-colors shrink-0"
                    aria-label="Facility actions"
                >
                    <MoreVertical className="w-[17px] h-[17px]" />
                </button>
            </div>
        </div>
    );
});

const facilitiesInertiaOnly = [
    'facilities',
    'pendingFacilityReservations',
    'approvedFacilityReservations',
    'canReviewFacilityReservations',
];

export default function Facilities({
    facilities: facilitiesProp = [],
    pendingFacilityReservations = [],
    approvedFacilityReservations = [],
    canReviewFacilityReservations = false,
    departments = [],
}) {
    const { flash } = usePage().props;
    const [toast, setToast] = useState(null);
    const [reviewingFacilityReservationId, setReviewingFacilityReservationId] = useState(null);
    const [rejectingFacilityReservationId, setRejectingFacilityReservationId] = useState(null);
    const [facilityRejectReason, setFacilityRejectReason] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const createForm = useForm({
        department_id: '',
        name: '',
        description: '',
        floor: '',
        capacity: '',
        ui_status: 'Active',
        available_for_booking: true,
        operating_opens_at: '',
        operating_closes_at: '',
    });

    const openAddFacilityModal = () => {
        createForm.clearErrors();
        createForm.setData({
            department_id: departments[0]?.id != null ? String(departments[0].id) : '',
            name: '',
            description: '',
            floor: '',
            capacity: '',
            ui_status: 'Active',
            available_for_booking: true,
            operating_opens_at: '',
            operating_closes_at: '',
        });
        setIsAddModalOpen(true);
    };

    const closeAddFacilityModal = () => {
        if (createForm.processing) return;
        setIsAddModalOpen(false);
        createForm.clearErrors();
    };

    const submitCreateFacility = (e) => {
        e.preventDefault();
        createForm.post(route('facilities.store'), {
            preserveScroll: true,
            onSuccess: () => {
                setIsAddModalOpen(false);
                createForm.reset();
                createForm.clearErrors();
            },
        });
    };
    const [selectedFacility, setSelectedFacility] = useState(null);
    const [search, setSearch] = useState('');

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
        const t = setTimeout(() => setToast(null), 4500);
        return () => clearTimeout(t);
    }, [toast]);

    const facilities = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) {
            return facilitiesProp;
        }
        return facilitiesProp.filter(
            (fac) =>
                (fac.lab_name && fac.lab_name.toLowerCase().includes(q)) ||
                (fac.building_name && fac.building_name.toLowerCase().includes(q)) ||
                (fac.code && String(fac.code).toLowerCase().includes(q))
        );
    }, [facilitiesProp, search]);

    const getStatusStyle = useCallback((status) => {
        switch (status) {
            case 'Active': return 'text-green-600 bg-green-50 border-green-200';
            case 'Maintenance': return 'text-orange-600 bg-orange-50 border-orange-200';
            case 'Closed': return 'text-red-600 bg-red-50 border-red-200';
            default: return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    }, []);

    const handleApproveFacilityReservation = (id) => {
        setReviewingFacilityReservationId(id);
        router.patch(
            route('facility-reservations.approve', id),
            {},
            {
                preserveState: true,
                preserveScroll: true,
                only: facilitiesInertiaOnly,
                onFinish: () => setReviewingFacilityReservationId(null),
            }
        );
    };

    const openRejectFacilityReservationModal = (id) => {
        setRejectingFacilityReservationId(id);
        setFacilityRejectReason('');
    };

    const closeRejectFacilityReservationModal = () => {
        if (reviewingFacilityReservationId !== null) return;
        setRejectingFacilityReservationId(null);
        setFacilityRejectReason('');
    };

    const submitRejectFacilityReservation = () => {
        if (rejectingFacilityReservationId === null) return;
        const reason = facilityRejectReason.trim();
        if (!reason) {
            setToast({ type: 'error', message: 'Please enter a rejection reason.' });
            return;
        }
        setReviewingFacilityReservationId(rejectingFacilityReservationId);
        router.patch(
            route('facility-reservations.reject', rejectingFacilityReservationId),
            { reason },
            {
                preserveState: true,
                preserveScroll: true,
                only: facilitiesInertiaOnly,
                onSuccess: () => {
                    setRejectingFacilityReservationId(null);
                    setFacilityRejectReason('');
                },
                onFinish: () => {
                    setReviewingFacilityReservationId(null);
                },
            }
        );
    };

    return (
        <LabLayout title="Facilities">
            <Head title="Facilities" />
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
                        aria-label="Dismiss"
                    >
                        <XCircle className="h-4 w-4" />
                    </button>
                </div>
            )}
            <div className="flex-1 overflow-auto px-6 py-8 lg:px-10">
                <div className="mx-auto w-full max-w-[1600px]">
                    {/* Header Section */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="flex h-[42px] w-[42px] items-center justify-center rounded-lg bg-white border border-[#d2deeb] text-gray-600 shadow-sm">
                                <Building2 className="h-[22px] w-[22px]" strokeWidth={1.5} />
                            </div>
                            <div>
                                <h1 className="text-[22px] font-bold text-gray-800 tracking-tight">Laboratory Facilities</h1>
                                <p className="text-gray-500 text-sm mt-0.5">Manage and monitor all lab spaces</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 w-full sm:w-auto mt-4 sm:mt-0">
                            <div className="relative w-full sm:w-auto">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <Search className="h-4 w-4 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="block w-full sm:w-64 rounded-lg border border-[#d2deeb] bg-white py-2.5 pl-10 pr-3 text-[13px] text-gray-800 placeholder-gray-400 focus:border-[#4663ac] focus:outline-none focus:ring-1 focus:ring-[#4663ac] transition-colors shadow-sm"
                                    placeholder="Search facilities..."
                                />
                            </div>
                            <button
                                type="button"
                                onClick={openAddFacilityModal}
                                className="flex items-center gap-2 rounded-lg bg-[#1e293b] px-4 py-2.5 text-[13px] font-semibold text-white shadow-sm hover:bg-gray-800 transition-colors whitespace-nowrap"
                            >
                                <Plus className="h-4 w-4" strokeWidth={2.5} />
                                Add Facility
                            </button>
                        </div>
                    </div>

                    {canReviewFacilityReservations && (
                        <div className="mb-8 rounded-xl border border-sky-200/90 bg-gradient-to-b from-sky-50/90 to-white px-5 py-5 shadow-sm">
                            <div className="mb-4">
                                <h2 className="text-[15px] font-semibold text-gray-900 flex items-center gap-2">
                                    <CalendarClock className="h-4 w-4 shrink-0 text-sky-600" />
                                    Staff reservation requests
                                </h2>
                                <p className="text-[12px] text-gray-500 mt-0.5">
                                    Approve or reject incoming requests. Once approved, a lab shows &quot;Reserved&quot; on
                                    its card while the booking is in progress, then returns to open when the end time
                                    passes.
                                </p>
                            </div>
                            {pendingFacilityReservations.length === 0 ? (
                                <p className="text-[13px] text-gray-500 py-8 text-center border border-dashed border-slate-200 rounded-lg bg-slate-50/50">
                                    No pending facility reservations.
                                </p>
                            ) : (
                                <div className="overflow-x-auto rounded-lg border border-slate-200/80 bg-white">
                                    <table className="w-full text-left text-[12px] min-w-[720px]">
                                        <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-gray-500 border-b border-slate-200">
                                            <tr>
                                                <th className="px-3 py-2.5">Ref</th>
                                                <th className="px-3 py-2.5">Facility</th>
                                                <th className="px-3 py-2.5">Requester</th>
                                                <th className="px-3 py-2.5">Start</th>
                                                <th className="px-3 py-2.5">End</th>
                                                <th className="px-3 py-2.5">Purpose</th>
                                                <th className="px-3 py-2.5 text-right w-[200px]">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {pendingFacilityReservations.map((row) => (
                                                <tr key={row.id} className="hover:bg-slate-50/80">
                                                    <td className="px-3 py-2.5 font-mono text-[11px] text-gray-700">
                                                        {row.displayId}
                                                    </td>
                                                    <td className="px-3 py-2.5 font-medium text-gray-800">
                                                        <span className="block">{row.facilityName}</span>
                                                        <span className="text-[11px] font-normal text-gray-500">
                                                            {row.facilityBuilding}
                                                        </span>
                                                    </td>
                                                    <td className="px-3 py-2.5 text-gray-700">{row.requester}</td>
                                                    <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">
                                                        {row.startAt}
                                                    </td>
                                                    <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">
                                                        {row.endAt}
                                                    </td>
                                                    <td className="px-3 py-2.5 text-gray-600 max-w-[200px] truncate" title={row.purpose}>
                                                        {row.purpose}
                                                    </td>
                                                    <td className="px-3 py-2.5 text-right">
                                                        <div className="flex justify-end gap-1.5">
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    openRejectFacilityReservationModal(row.id)
                                                                }
                                                                disabled={reviewingFacilityReservationId === row.id}
                                                                className="rounded-md border border-red-200 bg-red-50 px-2.5 py-1 text-[11px] font-semibold text-red-700 hover:bg-red-100 disabled:opacity-50"
                                                            >
                                                                Reject
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleApproveFacilityReservation(row.id)
                                                                }
                                                                disabled={reviewingFacilityReservationId === row.id}
                                                                className="rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-800 hover:bg-emerald-100 disabled:opacity-50"
                                                            >
                                                                {reviewingFacilityReservationId === row.id
                                                                    ? 'Saving…'
                                                                    : 'Approve'}
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {canReviewFacilityReservations && (
                        <div className="mb-8 rounded-xl border border-emerald-200/90 bg-gradient-to-b from-emerald-50/70 to-white px-5 py-5 shadow-sm">
                            <div className="mb-4">
                                <h2 className="text-[15px] font-semibold text-gray-900 flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                                    Approved reservations
                                </h2>
                                <p className="text-[12px] text-gray-500 mt-0.5">
                                    Bookings that are approved and haven&apos;t ended yet. &quot;In progress&quot; means
                                    the current time is inside the reserved window—those labs are marked{' '}
                                    <span className="font-semibold text-amber-800">Reserved</span> on the cards below.
                                </p>
                            </div>
                            {approvedFacilityReservations.length === 0 ? (
                                <p className="text-[13px] text-gray-500 py-8 text-center border border-dashed border-slate-200 rounded-lg bg-slate-50/50">
                                    No upcoming or in-progress approved reservations.
                                </p>
                            ) : (
                                <div className="overflow-x-auto rounded-lg border border-slate-200/80 bg-white">
                                    <table className="w-full text-left text-[12px] min-w-[800px]">
                                        <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-gray-500 border-b border-slate-200">
                                            <tr>
                                                <th className="px-3 py-2.5">Ref</th>
                                                <th className="px-3 py-2.5">Facility</th>
                                                <th className="px-3 py-2.5">Requester</th>
                                                <th className="px-3 py-2.5">Start</th>
                                                <th className="px-3 py-2.5">End</th>
                                                <th className="px-3 py-2.5">Purpose</th>
                                                <th className="px-3 py-2.5">Window</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {approvedFacilityReservations.map((row) => (
                                                <tr key={row.id} className="hover:bg-slate-50/80">
                                                    <td className="px-3 py-2.5 font-mono text-[11px] text-gray-700">
                                                        {row.displayId}
                                                    </td>
                                                    <td className="px-3 py-2.5 font-medium text-gray-800">
                                                        <span className="block">{row.facilityName}</span>
                                                        <span className="text-[11px] font-normal text-gray-500">
                                                            {row.facilityBuilding}
                                                        </span>
                                                    </td>
                                                    <td className="px-3 py-2.5 text-gray-700">{row.requester}</td>
                                                    <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">
                                                        {row.startAt}
                                                    </td>
                                                    <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">
                                                        {row.endAt}
                                                    </td>
                                                    <td className="px-3 py-2.5 text-gray-600 max-w-[200px] truncate" title={row.purpose}>
                                                        {row.purpose}
                                                    </td>
                                                    <td className="px-3 py-2.5">
                                                        {row.isActiveNow ? (
                                                            <span className="inline-flex rounded border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-900">
                                                                In progress
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex rounded border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-600">
                                                                Upcoming
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Facilities Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-5">
                        {facilities.length === 0 && (
                            <div className="col-span-full rounded-xl border border-dashed border-[#d2deeb] bg-[#f8fafc] px-6 py-12 text-center text-[13px] text-gray-500">
                                {facilitiesProp.length === 0
                                    ? 'No laboratories found. Add labs and locations in the database to see them here.'
                                    : 'No facilities match your search.'}
                            </div>
                        )}
                        {facilities.map((fac) => (
                            <FacilityCard
                                key={fac.id}
                                fac={fac}
                                getStatusStyle={getStatusStyle}
                                onSelect={setSelectedFacility}
                            />
                        ))}
                    </div>

                </div>
            </div>

            {/* Facility Detail Modal */}
            {selectedFacility && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="w-full max-w-lg rounded-xl bg-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                            <div>
                                <h2 className="text-lg font-bold text-gray-800">{selectedFacility.lab_name} Details</h2>
                                <p className="text-[13px] text-gray-500">Full information and workspace summary</p>
                            </div>
                            <button 
                                onClick={() => setSelectedFacility(null)}
                                className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                            >
                                <XCircle className="h-5 w-5" />
                            </button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto px-6 py-6">
                            <div className="space-y-6">
                                {/* Description Section */}
                                <div>
                                    <label className="mb-2 block text-[11px] font-bold text-gray-400 uppercase tracking-wider uppercase">Facility Description</label>
                                    <div className="rounded-lg bg-[#f8fafc] p-4 text-[14px] text-gray-600 leading-relaxed border border-gray-100">
                                        {selectedFacility.description || 'No description provided for this facility.'}
                                    </div>
                                </div>

                                {/* Details Grid */}
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="mb-1 block text-[11px] font-bold text-gray-400 uppercase tracking-wider uppercase">Status</label>
                                        <span className={`inline-block px-2.5 py-1 rounded-md border text-[11px] font-bold shadow-sm ${getStatusStyle(selectedFacility.status)}`}>
                                            {selectedFacility.status}
                                        </span>
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-[11px] font-bold text-gray-400 uppercase tracking-wider uppercase">Items assigned</label>
                                        <p className="text-[13px] font-medium text-gray-800 flex items-center gap-1.5">
                                            <Package className="w-3.5 h-3.5 text-[#4663ac]" />
                                            {selectedFacility.total_items ?? 0} in this lab
                                        </p>
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-[11px] font-bold text-gray-400 uppercase tracking-wider uppercase">Location</label>
                                        <p className="text-[13px] font-medium text-gray-800 flex items-center gap-1.5">
                                            <MapPin className="w-3.5 h-3.5 text-[#4663ac]" />
                                            {selectedFacility.building_name}, Floor {selectedFacility.floor_level}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-[11px] font-bold text-gray-400 uppercase tracking-wider uppercase">Lab Manager</label>
                                        <p className="text-[13px] font-medium text-gray-800 flex items-center gap-1.5">
                                            <Users className="w-3.5 h-3.5 text-[#4663ac]" />
                                            {selectedFacility.manager_id}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-[11px] font-bold text-gray-400 uppercase tracking-wider uppercase">Operating Hours</label>
                                        <p className="text-[13px] font-medium text-gray-800 flex items-center gap-1.5">
                                            <Clock className="w-3.5 h-3.5 text-[#4663ac]" />
                                            {selectedFacility.opening_hours}
                                        </p>
                                    </div>
                                    <div className="col-span-2">
                                        <label className="mb-1 block text-[11px] font-bold text-gray-400 uppercase tracking-wider uppercase">Borrow occupancy</label>
                                        <p className="text-[13px] font-medium text-gray-800 flex items-center gap-1.5">
                                            <Activity className="w-3.5 h-3.5 text-[#4663ac]" />
                                            {selectedFacility.current_occupancy ?? 0} active borrows
                                            {selectedFacility.max_capacity > 0
                                                ? ` (capacity ${selectedFacility.max_capacity})`
                                                : ''}
                                        </p>
                                    </div>
                                </div>

                                {/* Booking Availability */}
                                <div
                                    className={`p-4 rounded-lg flex items-center justify-between border ${
                                        !selectedFacility.is_available_for_booking
                                            ? 'bg-gray-50 border-gray-100'
                                            : selectedFacility.is_reserved_now
                                              ? 'bg-amber-50 border-amber-100'
                                              : 'bg-green-50 border-green-100'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={`h-10 w-10 rounded-full flex items-center justify-center ${
                                                !selectedFacility.is_available_for_booking
                                                    ? 'bg-gray-200 text-gray-400'
                                                    : selectedFacility.is_reserved_now
                                                      ? 'bg-amber-100 text-amber-700'
                                                      : 'bg-green-100 text-green-600'
                                            }`}
                                        >
                                            {!selectedFacility.is_available_for_booking ? (
                                                <XCircle className="w-6 h-6" />
                                            ) : selectedFacility.is_reserved_now ? (
                                                <Bookmark className="w-6 h-6" />
                                            ) : (
                                                <CheckCircle2 className="w-6 h-6" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-[13px] font-bold text-gray-800">
                                                {!selectedFacility.is_available_for_booking
                                                    ? 'Booking restricted'
                                                    : selectedFacility.is_reserved_now
                                                      ? 'Reserved (approved booking)'
                                                      : 'Available for booking'}
                                            </p>
                                            <p className="text-[12px] text-gray-500">
                                                {!selectedFacility.is_available_for_booking
                                                    ? 'This lab is not accepting new reservations in its current status.'
                                                    : selectedFacility.is_reserved_now
                                                      ? 'An approved reservation covers the current time. The card shows Reserved until that booking ends.'
                                                      : 'New staff reservation requests can be submitted from Transactions.'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-gray-100 bg-gray-50 px-6 py-4 flex gap-3">
                            <button
                                onClick={() => setSelectedFacility(null)}
                                className="flex-1 rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-[13px] font-semibold text-gray-600 shadow-sm hover:bg-gray-50 transition-colors"
                            >
                                Close View
                            </button>
                            <button
                                className="flex-1 rounded-lg bg-[#4663ac] hover:bg-[#3f59a3] px-6 py-2.5 text-[13px] font-semibold text-white shadow-sm transition-colors"
                            >
                                Edit Facility
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Facility Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="w-full max-w-2xl rounded-xl bg-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <form onSubmit={submitCreateFacility} className="flex flex-col max-h-[90vh]">
                            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 shrink-0">
                                <div>
                                    <h2 className="text-lg font-bold text-gray-800">Add New Facility</h2>
                                    <p className="text-[13px] text-gray-500">Register a new laboratory or workspace</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={closeAddFacilityModal}
                                    className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                                >
                                    <XCircle className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto px-6 py-6">
                                {departments.length === 0 ? (
                                    <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] text-amber-900">
                                        You need at least one{' '}
                                        <span className="font-semibold">department</span> before adding a facility.
                                        Open <span className="font-semibold">Departments</span> in the sidebar and create
                                        one, then try again.
                                    </p>
                                ) : null}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="space-y-4">
                                        <div>
                                            <label className="mb-1.5 block text-[13px] font-semibold text-gray-700">
                                                Laboratory name <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={createForm.data.name}
                                                onChange={(e) => createForm.setData('name', e.target.value)}
                                                className="block w-full rounded-lg border border-[#d2deeb] bg-white px-3 py-2.5 text-[13px] text-gray-800 placeholder-gray-400 focus:border-[#4663ac] focus:outline-none focus:ring-1 focus:ring-[#4663ac] shadow-sm transition-colors"
                                                placeholder="e.g. Molecular Biology Lab"
                                                required
                                            />
                                            {createForm.errors.name && (
                                                <p className="mt-1 text-xs text-red-600">{createForm.errors.name}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="mb-1.5 block text-[13px] font-semibold text-gray-700">
                                                Department <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                value={createForm.data.department_id}
                                                onChange={(e) => createForm.setData('department_id', e.target.value)}
                                                className="block w-full rounded-lg border border-[#d2deeb] bg-white px-3 py-2.5 text-[13px] text-gray-800 focus:border-[#4663ac] focus:outline-none focus:ring-1 focus:ring-[#4663ac] shadow-sm transition-colors"
                                                required
                                            >
                                                <option value="">Select department…</option>
                                                {departments.map((d) => (
                                                    <option key={d.id} value={d.id}>
                                                        {d.name}
                                                    </option>
                                                ))}
                                            </select>
                                            {createForm.errors.department_id && (
                                                <p className="mt-1 text-xs text-red-600">
                                                    {createForm.errors.department_id}
                                                </p>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="mb-1.5 block text-[13px] font-semibold text-gray-700">
                                                    Floor
                                                </label>
                                                <input
                                                    type="text"
                                                    value={createForm.data.floor}
                                                    onChange={(e) => createForm.setData('floor', e.target.value)}
                                                    className="block w-full rounded-lg border border-[#d2deeb] bg-white px-3 py-2.5 text-[13px] text-gray-800 focus:border-[#4663ac] focus:outline-none focus:ring-1 focus:ring-[#4663ac] shadow-sm transition-colors"
                                                    placeholder="e.g. 3"
                                                />
                                                {createForm.errors.floor && (
                                                    <p className="mt-1 text-xs text-red-600">{createForm.errors.floor}</p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="mb-1.5 block text-[13px] font-semibold text-gray-700">
                                                    Max capacity
                                                </label>
                                                <input
                                                    type="number"
                                                    min={0}
                                                    value={createForm.data.capacity}
                                                    onChange={(e) => createForm.setData('capacity', e.target.value)}
                                                    className="block w-full rounded-lg border border-[#d2deeb] bg-white px-3 py-2.5 text-[13px] text-gray-800 focus:border-[#4663ac] focus:outline-none focus:ring-1 focus:ring-[#4663ac] shadow-sm transition-colors"
                                                    placeholder="e.g. 40"
                                                />
                                                {createForm.errors.capacity && (
                                                    <p className="mt-1 text-xs text-red-600">
                                                        {createForm.errors.capacity}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="mb-1.5 block text-[13px] font-semibold text-gray-700">
                                                Status
                                            </label>
                                            <select
                                                value={createForm.data.ui_status}
                                                onChange={(e) => createForm.setData('ui_status', e.target.value)}
                                                className="block w-full rounded-lg border border-[#d2deeb] bg-white px-3 py-2.5 text-[13px] text-gray-800 focus:border-[#4663ac] focus:outline-none focus:ring-1 focus:ring-[#4663ac] shadow-sm transition-colors"
                                            >
                                                <option value="Active">Active</option>
                                                <option value="Maintenance">Maintenance</option>
                                                <option value="Closed">Closed</option>
                                            </select>
                                            {createForm.errors.ui_status && (
                                                <p className="mt-1 text-xs text-red-600">{createForm.errors.ui_status}</p>
                                            )}
                                        </div>
                                        <div>
                                            <p className="mb-1.5 block text-[13px] font-semibold text-gray-700">
                                                Operating hours{' '}
                                                <span className="font-normal text-gray-400">(optional)</span>
                                            </p>
                                            <p className="mb-2 text-[11px] text-gray-500">
                                                Set daily open and close times, or leave both blank.
                                            </p>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="mb-1 block text-[12px] font-medium text-gray-600">
                                                        Opens
                                                    </label>
                                                    <input
                                                        type="time"
                                                        value={createForm.data.operating_opens_at}
                                                        onChange={(e) =>
                                                            createForm.setData('operating_opens_at', e.target.value)
                                                        }
                                                        className="block w-full rounded-lg border border-[#d2deeb] bg-white px-3 py-2 text-[13px] text-gray-800 focus:border-[#4663ac] focus:outline-none focus:ring-1 focus:ring-[#4663ac] shadow-sm"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="mb-1 block text-[12px] font-medium text-gray-600">
                                                        Closes
                                                    </label>
                                                    <input
                                                        type="time"
                                                        value={createForm.data.operating_closes_at}
                                                        onChange={(e) =>
                                                            createForm.setData('operating_closes_at', e.target.value)
                                                        }
                                                        className="block w-full rounded-lg border border-[#d2deeb] bg-white px-3 py-2 text-[13px] text-gray-800 focus:border-[#4663ac] focus:outline-none focus:ring-1 focus:ring-[#4663ac] shadow-sm"
                                                    />
                                                </div>
                                            </div>
                                            {(createForm.errors.operating_opens_at ||
                                                createForm.errors.operating_closes_at) && (
                                                <p className="mt-1 text-xs text-red-600">
                                                    {createForm.errors.operating_opens_at ||
                                                        createForm.errors.operating_closes_at}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-5">
                                    <label className="mb-1.5 block text-[13px] font-semibold text-gray-700">
                                        Description
                                    </label>
                                    <textarea
                                        rows={3}
                                        value={createForm.data.description}
                                        onChange={(e) => createForm.setData('description', e.target.value)}
                                        className="block w-full rounded-lg border border-[#d2deeb] bg-white px-3 py-2.5 text-[13px] text-gray-800 placeholder-gray-400 focus:border-[#4663ac] focus:outline-none focus:ring-1 focus:ring-[#4663ac] shadow-sm transition-colors resize-none"
                                        placeholder="Purpose, equipment, notes…"
                                    />
                                    {createForm.errors.description && (
                                        <p className="mt-1 text-xs text-red-600">{createForm.errors.description}</p>
                                    )}
                                </div>

                                <div className="pt-4">
                                    <label className="relative flex cursor-pointer items-center gap-3">
                                        <div className="relative flex h-5 w-5 items-center justify-center">
                                            <input
                                                type="checkbox"
                                                checked={createForm.data.available_for_booking}
                                                onChange={(e) =>
                                                    createForm.setData('available_for_booking', e.target.checked)
                                                }
                                                className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-[#d2deeb] bg-white checked:border-[#4663ac] checked:bg-[#4663ac] focus:outline-none focus:ring-1 focus:ring-[#4663ac] transition-all shadow-sm"
                                            />
                                            <svg
                                                className="pointer-events-none absolute h-3.5 w-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="3"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            >
                                                <polyline points="20 6 9 17 4 12" />
                                            </svg>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[13px] font-semibold text-gray-700">
                                                Available for booking
                                            </span>
                                            <span className="text-[12px] text-gray-500">
                                                Uncheck to block new reservations (the lab is stored as inactive).
                                            </span>
                                        </div>
                                    </label>
                                    {createForm.errors.available_for_booking && (
                                        <p className="mt-1 text-xs text-red-600">
                                            {createForm.errors.available_for_booking}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 border-t border-gray-100 bg-gray-50/50 px-6 py-4 shrink-0">
                                <button
                                    type="button"
                                    onClick={closeAddFacilityModal}
                                    disabled={createForm.processing}
                                    className="rounded-lg border border-[#d2deeb] bg-white px-5 py-2.5 text-[13px] font-semibold text-gray-600 shadow-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={createForm.processing || departments.length === 0}
                                    className="rounded-lg bg-[#4663ac] hover:bg-[#3f59a3] px-6 py-2.5 text-[13px] font-semibold text-white shadow-sm transition-colors disabled:opacity-60"
                                >
                                    {createForm.processing ? 'Creating…' : 'Create facility'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {rejectingFacilityReservationId !== null && (
                <div className="fixed inset-0 z-[65] flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-xl border border-gray-100 bg-white p-6 shadow-2xl">
                        <h3 className="text-lg font-bold text-gray-800">Reject reservation?</h3>
                        <p className="mt-2 text-[13px] text-gray-600">
                            The staff member will see this reason in their notification.
                        </p>
                        <div className="mt-4">
                            <label className="mb-1.5 block text-[13px] font-semibold text-gray-700">
                                Reason <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={facilityRejectReason}
                                onChange={(e) => setFacilityRejectReason(e.target.value)}
                                rows={3}
                                maxLength={500}
                                className="block w-full rounded-lg border border-[#d2deeb] bg-white px-3 py-2.5 text-[13px] text-gray-800 placeholder-gray-400 focus:border-[#4663ac] focus:outline-none focus:ring-1 focus:ring-[#4663ac] shadow-sm"
                                placeholder="Reason for rejection"
                            />
                            <p className="mt-1 text-[11px] text-gray-400">{facilityRejectReason.length}/500</p>
                        </div>
                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={closeRejectFacilityReservationModal}
                                disabled={reviewingFacilityReservationId !== null}
                                className="rounded-lg border border-[#d2deeb] bg-white px-4 py-2.5 text-[13px] font-semibold text-gray-600 shadow-sm hover:bg-gray-50 disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={submitRejectFacilityReservation}
                                disabled={
                                    reviewingFacilityReservationId !== null ||
                                    facilityRejectReason.trim().length === 0
                                }
                                className="rounded-lg bg-red-600 px-4 py-2.5 text-[13px] font-semibold text-white shadow-sm hover:bg-red-700 disabled:opacity-60"
                            >
                                {reviewingFacilityReservationId !== null ? 'Rejecting…' : 'Confirm reject'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </LabLayout>
    );
}
