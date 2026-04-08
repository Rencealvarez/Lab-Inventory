import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import {
    Users as UsersIcon,
    Plus,
    MoreVertical,   
    Search,
    XCircle
} from 'lucide-react';

import LabLayout from '@/Layouts/LabLayout';

export default function Users() {
    const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);

    const usersList = [
        { id: 'EMP-001', name: 'Dr. Robert Smith', email: 'r.smith@lab.edu', role: 'Lab Manager', status: 'Active', department: 'Physics' },
        { id: 'EMP-002', name: 'Dr. Sarah Jones', email: 's.jones@lab.edu', role: 'Lab Manager', status: 'Active', department: 'Chemistry' },
        { id: 'STU-105', name: 'Jane Doe', email: 'j.doe@student.edu', role: 'Student', status: 'Active', department: 'Chemistry' },
        { id: 'STU-108', name: 'Jack Wilson', email: 'j.wilson@student.edu', role: 'Student', status: 'Inactive', department: 'Biology' },
        { id: 'EMP-015', name: 'Prof. David Davis', email: 'd.davis@lab.edu', role: 'Professor', status: 'Active', department: 'IT' },
    ];

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Active': return 'text-green-600 bg-green-50 border-green-200';
            case 'Inactive': return 'text-gray-500 bg-gray-100 border-gray-200';
            case 'Suspended': return 'text-red-600 bg-red-50 border-red-200';
            default: return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    const getRoleStyle = (role) => {
        switch (role) {
            case 'Lab Manager': return 'text-purple-600 bg-purple-50';
            case 'Professor': return 'text-blue-600 bg-blue-50';
            case 'Student': return 'text-gray-600 bg-gray-50';
            default: return 'text-gray-600';
        }
    };

    return (
        <LabLayout title="Users">
            <div className="flex-1 overflow-auto p-8">
                <div className="mx-auto w-full max-w-[1100px] rounded-xl bg-white shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-[#e1f1fd]">
                    {/* Header Section */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-8 py-6">
                        <div className="flex items-center gap-3">
                            <div className="flex h-[42px] w-[42px] items-center justify-center rounded-lg bg-white border border-[#d2deeb] text-gray-600 shadow-sm">
                                <UsersIcon className="h-[22px] w-[22px]" strokeWidth={1.5} />
                            </div>
                            <h1 className="text-[22px] font-bold text-gray-800 tracking-tight">System Users</h1>
                        </div>
                        <div className="flex items-center gap-3 w-full sm:w-auto mt-4 sm:mt-0">
                            <div className="relative w-full sm:w-auto">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <Search className="h-4 w-4 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    className="block w-full sm:w-64 rounded-lg border border-[#d2deeb] bg-[#f8fafc] py-2.5 pl-10 pr-3 text-[13px] text-gray-800 placeholder-gray-400 focus:border-[#4663ac] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#4663ac] transition-colors shadow-sm"
                                    placeholder="Search users..."
                                />
                            </div>
                            <button 
                                onClick={() => setIsAddUserModalOpen(true)}
                                className="flex items-center gap-2 rounded-lg bg-[#1e293b] px-4 py-2.5 text-[13px] font-semibold text-white shadow-sm hover:bg-gray-800 transition-colors whitespace-nowrap"
                            >
                                <Plus className="h-4 w-4" strokeWidth={2.5} />
                                Add User
                            </button>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto border-t border-[#f1f5f9] mt-2">
                        <table className="w-full text-left text-[13px] whitespace-nowrap">
                            <thead className="bg-[#f8fafc] text-[11px] font-bold text-gray-400 uppercase tracking-wider border-b border-[#f1f5f9]">
                                <tr>
                                    <th className="px-6 py-3.5 w-5 font-normal">
                                        <div className="w-4 h-4 rounded border border-gray-300"></div>
                                    </th>
                                    <th className="px-6 py-3.5 cursor-pointer hover:text-gray-600 transition-colors">ID Number <span className="text-[10px] ml-1">↑↓</span></th>
                                    <th className="px-6 py-3.5 cursor-pointer hover:text-gray-600 transition-colors">User Details <span className="text-[10px] ml-1">↑↓</span></th>
                                    <th className="px-6 py-3.5 cursor-pointer hover:text-gray-600 transition-colors">Role <span className="text-[10px] ml-1">↑↓</span></th>
                                    <th className="px-6 py-3.5 cursor-pointer hover:text-gray-600 transition-colors">Department <span className="text-[10px] ml-1">↑↓</span></th>
                                    <th className="px-6 py-3.5 cursor-pointer hover:text-gray-600 transition-colors shrink-0">Status <span className="text-[10px] ml-1">↑↓</span></th>
                                    <th className="px-6 py-3.5 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#f1f5f9] text-gray-600">
                                {usersList.map((user, i) => (
                                    <tr key={user.id} className={`hover:bg-[#f8fafc] transition-colors group`}>
                                        <td className="px-6 py-4">
                                            <div className={`w-4 h-4 rounded border border-gray-300 flex items-center justify-center`}>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-semibold text-gray-800">{user.id}</td>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-gray-800">{user.name}</div>
                                            <div className="text-[12px] text-gray-500 mt-0.5">{user.email}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center rounded px-2 py-0.5 text-[11px] font-bold ${getRoleStyle(user.role)}`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-700">{user.department}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center rounded-md px-2 py-1 text-[11px] font-bold shadow-sm border ${getStatusStyle(user.status)}`}>
                                                {user.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-[#f1f5f9] mx-auto cursor-pointer text-gray-400 relative">
                                                <MoreVertical className="h-[18px] w-[18px]" />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Add User Modal */}
            {isAddUserModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="w-full max-w-2xl rounded-xl bg-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                            <div>
                                <h2 className="text-lg font-bold text-gray-800">Add New User</h2>
                                <p className="text-[13px] text-gray-500">Register a new system user or student</p>
                            </div>
                            <button 
                                onClick={() => setIsAddUserModalOpen(false)}
                                className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                            >
                                <XCircle className="h-5 w-5" />
                            </button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto px-6 py-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {/* Left Column */}
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="mb-1.5 block text-[13px] font-semibold text-gray-700">First Name</label>
                                            <input type="text" className="block w-full rounded-lg border border-[#d2deeb] bg-white px-3 py-2.5 text-[13px] text-gray-800 placeholder-gray-400 focus:border-[#4663ac] focus:outline-none focus:ring-1 focus:ring-[#4663ac] shadow-sm transition-colors" placeholder="e.g. John" />
                                        </div>
                                        <div>
                                            <label className="mb-1.5 block text-[13px] font-semibold text-gray-700">Last Name</label>
                                            <input type="text" className="block w-full rounded-lg border border-[#d2deeb] bg-white px-3 py-2.5 text-[13px] text-gray-800 placeholder-gray-400 focus:border-[#4663ac] focus:outline-none focus:ring-1 focus:ring-[#4663ac] shadow-sm transition-colors" placeholder="e.g. Doe" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="mb-1.5 block text-[13px] font-semibold text-gray-700">Email Address</label>
                                        <input type="email" className="block w-full rounded-lg border border-[#d2deeb] bg-white px-3 py-2.5 text-[13px] text-gray-800 placeholder-gray-400 focus:border-[#4663ac] focus:outline-none focus:ring-1 focus:ring-[#4663ac] shadow-sm transition-colors" placeholder="e.g. user@lab.edu" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="mb-1.5 block text-[13px] font-semibold text-gray-700">ID Number</label>
                                            <input type="text" className="block w-full rounded-lg border border-[#d2deeb] bg-white px-3 py-2.5 text-[13px] text-gray-800 placeholder-gray-400 focus:border-[#4663ac] focus:outline-none focus:ring-1 focus:ring-[#4663ac] shadow-sm transition-colors" placeholder="e.g. EMP-001" />
                                        </div>
                                        <div>
                                            <label className="mb-1.5 block text-[13px] font-semibold text-gray-700">Username</label>
                                            <input type="text" className="block w-full rounded-lg border border-[#d2deeb] bg-white px-3 py-2.5 text-[13px] text-gray-800 placeholder-gray-400 focus:border-[#4663ac] focus:outline-none focus:ring-1 focus:ring-[#4663ac] shadow-sm transition-colors" placeholder="e.g. jdoe123" />
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="mb-1.5 block text-[13px] font-semibold text-gray-700">Role</label>
                                        <select className="block w-full rounded-lg border border-[#d2deeb] bg-white px-3 py-2.5 text-[13px] text-gray-800 focus:border-[#4663ac] focus:outline-none focus:ring-1 focus:ring-[#4663ac] shadow-sm transition-colors">
                                            <option value="Student">Student</option>
                                            <option value="Professor">Professor</option>
                                            <option value="Lab Manager">Lab Manager</option>
                                            <option value="Admin">Admin</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="mb-1.5 block text-[13px] font-semibold text-gray-700">Department</label>
                                        <select className="block w-full rounded-lg border border-[#d2deeb] bg-white px-3 py-2.5 text-[13px] text-gray-800 focus:border-[#4663ac] focus:outline-none focus:ring-1 focus:ring-[#4663ac] shadow-sm transition-colors">
                                            <option value="Physics">Physics</option>
                                            <option value="Chemistry">Chemistry</option>
                                            <option value="Biology">Biology</option>
                                            <option value="IT">IT</option>
                                        </select>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="mb-1.5 block text-[13px] font-semibold text-gray-700">Status</label>
                                            <select className="block w-full rounded-lg border border-[#d2deeb] bg-white px-3 py-2.5 text-[13px] text-gray-800 focus:border-[#4663ac] focus:outline-none focus:ring-1 focus:ring-[#4663ac] shadow-sm transition-colors">
                                                <option value="Active">Active</option>
                                                <option value="Inactive">Inactive</option>
                                                <option value="Suspended">Suspended</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="mb-1.5 block text-[13px] font-semibold text-gray-700">Max Borrow Limit</label>
                                            <input type="number" defaultValue={5} className="block w-full rounded-lg border border-[#d2deeb] bg-white px-3 py-2.5 text-[13px] text-gray-800 focus:border-[#4663ac] focus:outline-none focus:ring-1 focus:ring-[#4663ac] shadow-sm transition-colors" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 border-t border-gray-100 bg-gray-50/50 px-6 py-4">
                            <button onClick={() => setIsAddUserModalOpen(false)} className="rounded-lg border border-[#d2deeb] bg-white px-5 py-2.5 text-[13px] font-semibold text-gray-600 shadow-sm hover:bg-gray-50 transition-colors">Cancel</button>
                            <button onClick={() => setIsAddUserModalOpen(false)} className="rounded-lg bg-[#4663ac] hover:bg-[#3f59a3] px-6 py-2.5 text-[13px] font-semibold text-white shadow-sm transition-colors">Save User</button>
                        </div>
                    </div>
                </div>
            )}
        </LabLayout>
    );
}
