import React, { memo, useCallback, useMemo, useState } from 'react';
import { Head } from '@inertiajs/react';
import {
    Building2,
    Plus,
    MoreVertical,
    Search,
    MapPin,
    CheckCircle2,
    XCircle,
    Users,
    Clock,
    Activity,
    Package
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
            className="bg-white rounded-xl shadow-sm border border-[#e1f1fd] p-5 hover:shadow-md transition-all flex flex-col h-full cursor-pointer group active:scale-[0.98]"
        >
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-lg font-bold text-gray-800 lg:group-hover:text-[#4663ac] transition-colors">{fac.lab_name}</h3>
                    <p className="text-[13px] text-gray-500 flex items-center gap-1.5 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        {fac.building_name}, Floor {fac.floor_level}
                    </p>
                </div>
                <span className={`px-2.5 py-1 rounded-md border text-[11px] font-bold shadow-sm ${getStatusStyle(fac.status)}`}>
                    {fac.status}
                </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-5 p-3 bg-[#f8fafc] rounded-lg">
                <div>
                    <p className="text-[11px] text-gray-400 uppercase font-semibold tracking-wider mb-1 flex items-center gap-1"><Users className="w-3 h-3" /> Manager</p>
                    <p className="text-[13px] font-medium text-gray-700">{fac.manager_id}</p>
                </div>
                <div>
                    <p className="text-[11px] text-gray-400 uppercase font-semibold tracking-wider mb-1 flex items-center gap-1"><Clock className="w-3 h-3" /> Hours</p>
                    <p className="text-[13px] font-medium text-gray-700">{fac.opening_hours}</p>
                </div>
                <div className="col-span-2">
                    <p className="text-[11px] text-gray-400 uppercase font-semibold tracking-wider mb-1 flex items-center gap-1"><Package className="w-3 h-3" /> Items assigned</p>
                    <p className="text-[13px] font-medium text-gray-700">{fac.total_items ?? 0} <span className="text-gray-400 font-normal">in this lab</span></p>
                </div>
            </div>

            <div className="mb-6">
                <div className="flex justify-between items-end mb-1.5">
                    <p className="text-[12px] font-semibold text-gray-500 flex items-center gap-1"><Activity className="w-3 h-3" /> Occupancy</p>
                    <p className="text-[13px] font-bold text-gray-800">{fac.current_occupancy ?? 0} <span className="text-gray-400 font-medium">/ {fac.max_capacity ?? 0}</span></p>
                </div>
                <div className="w-full h-2 bg-[#f1f5f9] rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full ${occupancyPercentage > 80 ? 'bg-red-500' : 'bg-[#4663ac]'}`}
                        style={{ width: `${Math.min(occupancyPercentage, 100)}%` }}
                    ></div>
                </div>
            </div>

            <div className="mt-auto pt-4 border-t border-[#f1f5f9] flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {fac.is_available_for_booking ? (
                        <span className="flex items-center gap-1.5 text-[12px] font-semibold text-green-600">
                            <CheckCircle2 className="w-4 h-4" /> Available for Booking
                        </span>
                    ) : (
                        <span className="flex items-center gap-1.5 text-[12px] font-semibold text-gray-400">
                            <XCircle className="w-4 h-4" /> Not Available
                        </span>
                    )}
                </div>
                <button type="button" className="p-1.5 rounded-md hover:bg-[#f1f5f9] text-gray-400 hover:text-gray-600 transition-colors">
                    <MoreVertical className="w-[18px] h-[18px]" />
                </button>
            </div>
        </div>
    );
});

export default function Facilities({ facilities: facilitiesProp = [] }) {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedFacility, setSelectedFacility] = useState(null);
    const [search, setSearch] = useState('');

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

    return (
        <LabLayout title="Facilities">
            <Head title="Facilities" />
            <div className="flex-1 overflow-auto p-8">
                <div className="mx-auto w-full max-w-[1200px]">
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
                                onClick={() => setIsAddModalOpen(true)}
                                className="flex items-center gap-2 rounded-lg bg-[#1e293b] px-4 py-2.5 text-[13px] font-semibold text-white shadow-sm hover:bg-gray-800 transition-colors whitespace-nowrap"
                            >
                                <Plus className="h-4 w-4" strokeWidth={2.5} />
                                Add Facility
                            </button>
                        </div>
                    </div>

                    {/* Facilities Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                                <div className={`p-4 rounded-lg flex items-center justify-between ${selectedFacility.is_available_for_booking ? 'bg-green-50 border border-green-100' : 'bg-gray-50 border border-gray-100'}`}>
                                    <div className="flex items-center gap-3">
                                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${selectedFacility.is_available_for_booking ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-400'}`}>
                                            {selectedFacility.is_available_for_booking ? <CheckCircle2 className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
                                        </div>
                                        <div>
                                            <p className="text-[13px] font-bold text-gray-800">{selectedFacility.is_available_for_booking ? 'Available for Booking' : 'Booking Restricted'}</p>
                                            <p className="text-[12px] text-gray-500">{selectedFacility.is_available_for_booking ? 'Reservations are open for this lab.' : 'This lab is currently not accepting bookings.'}</p>
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
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="w-full max-w-2xl rounded-xl bg-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                            <div>
                                <h2 className="text-lg font-bold text-gray-800">Add New Facility</h2>
                                <p className="text-[13px] text-gray-500">Register a new laboratory or workspace</p>
                            </div>
                            <button 
                                onClick={() => setIsAddModalOpen(false)}
                                className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                            >
                                <XCircle className="h-5 w-5" />
                            </button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto px-6 py-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {/* Left Column */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="mb-1.5 block text-[13px] font-semibold text-gray-700">Laboratory Name</label>
                                        <input
                                            type="text"
                                            className="block w-full rounded-lg border border-[#d2deeb] bg-white px-3 py-2.5 text-[13px] text-gray-800 placeholder-gray-400 focus:border-[#4663ac] focus:outline-none focus:ring-1 focus:ring-[#4663ac] shadow-sm transition-colors"
                                            placeholder="e.g. Molecular Biology Lab"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1.5 block text-[13px] font-semibold text-gray-700">Building</label>
                                        <input
                                            type="text"
                                            className="block w-full rounded-lg border border-[#d2deeb] bg-white px-3 py-2.5 text-[13px] text-gray-800 placeholder-gray-400 focus:border-[#4663ac] focus:outline-none focus:ring-1 focus:ring-[#4663ac] shadow-sm transition-colors"
                                            placeholder="e.g. PCU Building 1"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="mb-1.5 block text-[13px] font-semibold text-gray-700">Floor Level</label>
                                            <input
                                                type="number"
                                                className="block w-full rounded-lg border border-[#d2deeb] bg-white px-3 py-2.5 text-[13px] text-gray-800 focus:border-[#4663ac] focus:outline-none focus:ring-1 focus:ring-[#4663ac] shadow-sm transition-colors"
                                                placeholder="e.g. 3"
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-1.5 block text-[13px] font-semibold text-gray-700">Max Capacity</label>
                                            <input
                                                type="number"
                                                className="block w-full rounded-lg border border-[#d2deeb] bg-white px-3 py-2.5 text-[13px] text-gray-800 focus:border-[#4663ac] focus:outline-none focus:ring-1 focus:ring-[#4663ac] shadow-sm transition-colors"
                                                placeholder="e.g. 40"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="mb-1.5 block text-[13px] font-semibold text-gray-700">Manager ID / Name</label>
                                        <input
                                            type="text"
                                            className="block w-full rounded-lg border border-[#d2deeb] bg-white px-3 py-2.5 text-[13px] text-gray-800 placeholder-gray-400 focus:border-[#4663ac] focus:outline-none focus:ring-1 focus:ring-[#4663ac] shadow-sm transition-colors"
                                            placeholder="Enter Manager Name or ID"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1.5 block text-[13px] font-semibold text-gray-700">Status</label>
                                        <select
                                            className="block w-full rounded-lg border border-[#d2deeb] bg-white px-3 py-2.5 text-[13px] text-gray-800 focus:border-[#4663ac] focus:outline-none focus:ring-1 focus:ring-[#4663ac] shadow-sm transition-colors"
                                        >
                                            <option value="Active">Active</option>
                                            <option value="Maintenance">Maintenance</option>
                                            <option value="Closed">Closed</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="mb-1.5 block text-[13px] font-semibold text-gray-700">Operating Hours</label>
                                        <input
                                            type="text"
                                            className="block w-full rounded-lg border border-[#d2deeb] bg-white px-3 py-2.5 text-[13px] text-gray-800 placeholder-gray-400 focus:border-[#4663ac] focus:outline-none focus:ring-1 focus:ring-[#4663ac] shadow-sm transition-colors"
                                            placeholder="e.g. 08:00 AM - 05:00 PM"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Description - Full Width */}
                            <div className="mt-5">
                                <label className="mb-1.5 block text-[13px] font-semibold text-gray-700">Description</label>
                                <textarea
                                    rows={3}
                                    className="block w-full rounded-lg border border-[#d2deeb] bg-white px-3 py-2.5 text-[13px] text-gray-800 placeholder-gray-400 focus:border-[#4663ac] focus:outline-none focus:ring-1 focus:ring-[#4663ac] shadow-sm transition-colors resize-none"
                                    placeholder="Enter a brief description of the facility's purpose and equipment..."
                                ></textarea>
                            </div>

                            <div className="pt-4">
                                <label className="relative flex cursor-pointer items-center gap-3">
                                    <div className="relative flex h-5 w-5 items-center justify-center">
                                        <input
                                            type="checkbox"
                                            defaultChecked
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
                                        <span className="text-[13px] font-semibold text-gray-700">Available for Booking</span>
                                        <span className="text-[12px] text-gray-500">Allow users to reserve this facility</span>
                                    </div>
                                </label>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 border-t border-gray-100 bg-gray-50/50 px-6 py-4">
                            <button
                                onClick={() => setIsAddModalOpen(false)}
                                className="rounded-lg border border-[#d2deeb] bg-white px-5 py-2.5 text-[13px] font-semibold text-gray-600 shadow-sm hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => setIsAddModalOpen(false)}
                                className="rounded-lg bg-[#4663ac] hover:bg-[#3f59a3] px-6 py-2.5 text-[13px] font-semibold text-white shadow-sm transition-colors"
                            >
                                Create Facility
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </LabLayout>
    );
}
