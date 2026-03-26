import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
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
    Activity
} from 'lucide-react';

import LabLayout from '@/Layouts/LabLayout';

export default function Facilities() {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    
    const facilities = [
        { id: 1, lab_name: 'Physics Lab A', building_name: 'Science Building', floor_level: 2, manager_id: 'Dr. Robert Smith', status: 'Active', opening_hours: '08:00 AM - 05:00 PM', current_occupancy: 25, max_capacity: 40, is_available_for_booking: true },
        { id: 2, lab_name: 'Chemistry Lab 1', building_name: 'Science Building', floor_level: 3, manager_id: 'Dr. Sarah Jones', status: 'Maintenance', opening_hours: '08:00 AM - 05:00 PM', current_occupancy: 0, max_capacity: 30, is_available_for_booking: false },
        { id: 3, lab_name: 'Biology Research', building_name: 'Bio Center', floor_level: 1, manager_id: 'Dr. Michael Alan', status: 'Active', opening_hours: '09:00 AM - 06:00 PM', current_occupancy: 15, max_capacity: 50, is_available_for_booking: true },
        { id: 4, lab_name: 'IT Computer Lab', building_name: 'Tech Hub', floor_level: 4, manager_id: 'Prof. David Davis', status: 'Active', opening_hours: '24/7', current_occupancy: 50, max_capacity: 60, is_available_for_booking: true },
        { id: 5, lab_name: 'Advanced Robotics', building_name: 'Tech Hub', floor_level: 5, manager_id: 'Dr. Emma Stone', status: 'Closed', opening_hours: '10:00 AM - 04:00 PM', current_occupancy: 0, max_capacity: 20, is_available_for_booking: false },
        { id: 6, lab_name: 'Materials Science', building_name: 'Engineering Bldg', floor_level: 2, manager_id: 'Prof. John Doe', status: 'Active', opening_hours: '08:00 AM - 08:00 PM', current_occupancy: 18, max_capacity: 25, is_available_for_booking: true },
    ];

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Active': return 'text-green-600 bg-green-50 border-green-200';
            case 'Maintenance': return 'text-orange-600 bg-orange-50 border-orange-200';
            case 'Closed': return 'text-red-600 bg-red-50 border-red-200';
            default: return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    return (
        <LabLayout title="Facilities">
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
                        {facilities.map((fac) => {
                            const occupancyPercentage = (fac.current_occupancy / fac.max_capacity) * 100;
                            
                            return (
                                <div key={fac.id} className="bg-white rounded-xl shadow-sm border border-[#e1f1fd] p-5 hover:shadow-md transition-shadow flex flex-col h-full">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-800 group-hover:text-[#4663ac] transition-colors">{fac.lab_name}</h3>
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
                                    </div>

                                    <div className="mb-6">
                                        <div className="flex justify-between items-end mb-1.5">
                                            <p className="text-[12px] font-semibold text-gray-500 flex items-center gap-1"><Activity className="w-3 h-3" /> Occupancy</p>
                                            <p className="text-[13px] font-bold text-gray-800">{fac.current_occupancy} <span className="text-gray-400 font-medium">/ {fac.max_capacity}</span></p>
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
                                        <button className="p-1.5 rounded-md hover:bg-[#f1f5f9] text-gray-400 hover:text-gray-600 transition-colors">
                                            <MoreVertical className="w-[18px] h-[18px]" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                </div>
            </div>

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
                                            placeholder="e.g. Science Complex"
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
                                    <div>
                                        <label className="mb-1.5 block text-[13px] font-semibold text-gray-700">Manager ID / Name</label>
                                        <input
                                            type="text"
                                            className="block w-full rounded-lg border border-[#d2deeb] bg-white px-3 py-2.5 text-[13px] text-gray-800 placeholder-gray-400 focus:border-[#4663ac] focus:outline-none focus:ring-1 focus:ring-[#4663ac] shadow-sm transition-colors"
                                            placeholder="Enter Manager Name or ID"
                                        />
                                    </div>
                                </div>

                                {/* Right Column */}
                                <div className="space-y-4">
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
                                    <div className="pt-2">
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
