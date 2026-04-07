import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import {
    Wrench,
    Plus,
    MoreVertical,
    Search,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    Paperclip,
    FileUp,
    Download
} from 'lucide-react';
import LabLayout from '@/Layouts/LabLayout';

export default function Maintenance() {
    const [isIncidentModalOpen, setIsIncidentModalOpen] = useState(false);

    const navLinks = [
        { name: 'Dashboard', href: route('dashboard') },
        { name: 'Inventory', href: route('inventory') },
        { name: 'Transactions', href: route('transactions') },
        { name: 'Facilities', href: route('facilities') },
        { name: 'Reports', href: route('reports') },
        { name: 'Maintenance', href: route('maintenance') },
        { name: 'Users', href: route('users') },
    ];

    const incidents = [
        { id: 'INC-001', item: 'Microscope (SKU-001)', reportedBy: 'Dr. Smith', date: '2023-11-10', severity: 'Medium', damage: 'Scratched lens during use', cost: '₱150.00', action: 'Under Repair', resolved: false },
        { id: 'INC-002', item: 'Beaker 500ml (SKU-002)', reportedBy: 'Jane Doe', date: '2023-11-15', severity: 'Low', damage: 'Cracked edge', cost: '₱15.00', action: 'Discarded', resolved: true },
        { id: 'INC-003', item: 'Oscilloscope (SKU-003)', reportedBy: 'Prof. Davis', date: '2023-10-05', severity: 'Critical', damage: 'Complete power failure, smoked', cost: '₱850.00', action: 'Replaced', resolved: true },
        { id: 'INC-004', item: 'Centrifuge (SKU-010)', reportedBy: 'Alice Chen', date: '2023-11-18', severity: 'High', damage: 'Rotor imbalance detected', cost: '₱300.00', action: 'Pending', resolved: false },
    ];

    const getSeverityStyle = (severity) => {
        switch (severity) {
            case 'Critical': return 'text-red-600 bg-red-50 border-red-200';
            case 'High': return 'text-orange-600 bg-orange-50 border-orange-200';
            case 'Medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
            case 'Low': return 'text-blue-600 bg-blue-50 border-blue-200';
            default: return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    const getActionStyle = (action) => {
        switch (action) {
            case 'Replaced': 
            case 'Discarded': return 'text-gray-500';
            case 'Under Repair': return 'text-blue-600 font-medium';
            case 'Pending': return 'text-orange-500 font-medium tracking-wide';
            default: return 'text-gray-600';
        }
    };

    return (
        <LabLayout title="Maintenance">
            <div className="flex-1 overflow-auto p-8">
                <div className="mx-auto w-full max-w-[1200px] rounded-xl bg-white shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-[#e1f1fd]">
                            {/* Header Section */}
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-8 py-6">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-[42px] w-[42px] items-center justify-center rounded-lg bg-white border border-[#d2deeb] text-gray-600 shadow-sm">
                                        <AlertTriangle className="h-[22px] w-[22px] text-orange-500" strokeWidth={1.5} />
                                    </div>
                                    <div>
                                        <h1 className="text-[22px] font-bold text-gray-800 tracking-tight">Incident Reports</h1>
                                        <p className="text-gray-500 text-sm mt-0.5">Track maintenance and damage tickets</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 w-full sm:w-auto mt-4 sm:mt-0">
                                    <div className="relative w-full sm:w-auto">
                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                            <Search className="h-4 w-4 text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            className="block w-full sm:w-64 rounded-lg border border-[#d2deeb] bg-[#f8fafc] py-2.5 pl-10 pr-3 text-[13px] text-gray-800 placeholder-gray-400 focus:border-[#4663ac] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#4663ac] transition-colors shadow-sm"
                                            placeholder="Search incidents..."
                                        />
                                    </div>
                                    <button 
                                        onClick={() => setIsIncidentModalOpen(true)}
                                        className="flex items-center gap-2 rounded-lg bg-[#1e293b] px-4 py-2.5 text-[13px] font-semibold text-white shadow-sm hover:bg-gray-800 transition-colors whitespace-nowrap"
                                    >
                                        <Plus className="h-4 w-4" strokeWidth={2.5} />
                                        Report Incident
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
                                            <th className="px-6 py-3.5 cursor-pointer hover:text-gray-600 transition-colors">ID <span className="text-[10px] ml-1">↑↓</span></th>
                                            <th className="px-6 py-3.5 cursor-pointer hover:text-gray-600 transition-colors">Item <span className="text-[10px] ml-1">↑↓</span></th>
                                            <th className="px-6 py-3.5 cursor-pointer hover:text-gray-600 transition-colors">Reported By <span className="text-[10px] ml-1">↑↓</span></th>
                                            <th className="px-6 py-3.5 cursor-pointer hover:text-gray-600 transition-colors">Incident Date <span className="text-[10px] ml-1">↑↓</span></th>
                                            <th className="px-6 py-3.5 cursor-pointer hover:text-gray-600 transition-colors">Severity <span className="text-[10px] ml-1">↑↓</span></th>
                                            <th className="px-6 py-3.5 cursor-pointer hover:text-gray-600 transition-colors">Est. Cost <span className="text-[10px] ml-1">↑↓</span></th>
                                            <th className="px-6 py-3.5 cursor-pointer hover:text-gray-600 transition-colors">Action Taken <span className="text-[10px] ml-1">↑↓</span></th>
                                            <th className="px-6 py-3.5 text-center">Attachment</th>
                                            <th className="px-6 py-3.5 text-center">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#f1f5f9] text-gray-600">
                                        {incidents.map((inc, i) => (
                                            <tr key={inc.id} className={`hover:bg-[#f8fafc] transition-colors group ${i === 3 ? 'bg-red-50/30' : ''}`}>
                                                <td className="px-6 py-4">
                                                    <div className={`w-4 h-4 rounded border ${i === 3 ? 'bg-[#4663ac] border-[#4663ac]' : 'border-gray-300'} flex items-center justify-center`}>
                                                        {i === 3 && <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 4L4 7L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 font-semibold text-gray-800">{inc.id}</td>
                                                <td className="px-6 py-4">
                                                    <div className="font-semibold text-[#4663ac] cursor-pointer hover:underline">{inc.item}</div>
                                                    <div className="text-[11px] text-gray-500 mt-0.5 truncate max-w-[200px]">{inc.damage}</div>
                                                </td>
                                                <td className="px-6 py-4 font-medium text-gray-700">{inc.reportedBy}</td>
                                                <td className="px-6 py-4 text-gray-600">{inc.date}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center rounded-md px-2 py-1 text-[11px] font-bold shadow-sm border ${getSeverityStyle(inc.severity)}`}>
                                                        {inc.severity}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-gray-600">{inc.cost}</td>
                                                <td className={`px-6 py-4 ${getActionStyle(inc.action)}`}>{inc.action}</td>
                                                <td className="px-6 py-4 text-center">
                                                    <div className="flex justify-center">
                                                        <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-50 text-gray-500 hover:bg-[#3f59a3] hover:text-white transition-all shadow-sm group">
                                                            <Paperclip className="h-4 w-4 transform group-hover:rotate-12" />
                                                        </button>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex justify-center">
                                                        {inc.resolved ? (
                                                            <span className="flex items-center gap-1.5 text-[12px] font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-md border border-green-200">
                                                                <CheckCircle2 className="w-3.5 h-3.5" /> Resolved
                                                            </span>
                                                        ) : (
                                                            <span className="flex items-center gap-1.5 text-[12px] font-semibold text-orange-600 bg-orange-50 px-2 py-1 rounded-md border border-orange-200">
                                                                <AlertTriangle className="w-3.5 h-3.5" /> Open
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

            {/* Report Incident Modal */}
            {isIncidentModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="w-full max-w-2xl rounded-xl bg-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                            <div>
                                <h2 className="text-lg font-bold text-gray-800">Report Incident</h2>
                                <p className="text-[13px] text-gray-500">Log equipment damage or maintenance needs</p>
                            </div>
                            <button 
                                onClick={() => setIsIncidentModalOpen(false)}
                                className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                            >
                                <XCircle className="h-5 w-5" />
                            </button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto px-6 py-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
                                {/* Row 1: Item & Severity */}
                                <div>
                                    <label className="mb-1.5 block text-[13px] font-semibold text-gray-700">Item Issue</label>
                                    <input type="text" className="block w-full rounded-lg border border-[#d2deeb] bg-white px-3 py-2.5 text-[13px] text-gray-800 placeholder-gray-400 focus:border-[#4663ac] focus:outline-none focus:ring-1 focus:ring-[#4663ac] shadow-sm transition-colors" placeholder="Search Item or enter SKU" />
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-[13px] font-semibold text-gray-700">Severity</label>
                                    <select className="block w-full rounded-lg border border-[#d2deeb] bg-white px-3 py-2.5 text-[13px] text-gray-800 focus:border-[#4663ac] focus:outline-none focus:ring-1 focus:ring-[#4663ac] shadow-sm transition-colors">
                                        <option value="Low">Low</option>
                                        <option value="Medium">Medium</option>
                                        <option value="High">High</option>
                                        <option value="Critical">Critical</option>
                                    </select>
                                </div>

                                {/* Row 2: Reporter & Action */}
                                <div>
                                    <label className="mb-1.5 block text-[13px] font-semibold text-gray-700">Reported By</label>
                                    <input type="text" className="block w-full rounded-lg border border-[#d2deeb] bg-white px-3 py-2.5 text-[13px] text-gray-800 placeholder-gray-400 focus:border-[#4663ac] focus:outline-none focus:ring-1 focus:ring-[#4663ac] shadow-sm transition-colors" placeholder="User ID or Name" />
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-[13px] font-semibold text-gray-700">Action Taken</label>
                                    <select className="block w-full rounded-lg border border-[#d2deeb] bg-white px-3 py-2.5 text-[13px] text-gray-800 focus:border-[#4663ac] focus:outline-none focus:ring-1 focus:ring-[#4663ac] shadow-sm transition-colors">
                                        <option value="Pending">Pending</option>
                                        <option value="Under Repair">Under Repair</option>
                                        <option value="Replaced">Replaced</option>
                                        <option value="Discarded">Discarded</option>
                                    </select>
                                </div>

                                {/* Row 3: Date & Cost */}
                                <div>
                                    <label className="mb-1.5 block text-[13px] font-semibold text-gray-700">Incident Date</label>
                                    <input type="date" className="block w-full rounded-lg border border-[#d2deeb] bg-white px-3 py-2 text-[13px] text-gray-800 focus:border-[#4663ac] focus:outline-none focus:ring-1 focus:ring-[#4663ac] shadow-sm transition-colors" />
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-[13px] font-semibold text-gray-700">Est. Repair Cost</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[13px]">₱</span>
                                        <input type="number" step="0.01" className="block w-full rounded-lg border border-[#d2deeb] bg-white pl-7 pr-3 py-2.5 text-[13px] text-gray-800 placeholder-gray-400 focus:border-[#4663ac] focus:outline-none focus:ring-1 focus:ring-[#4663ac] shadow-sm transition-colors" placeholder="0.00" />
                                    </div>
                                </div>

                                {/* Row 4: Damage Details (TextArea) & Upload (Integrated) */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="mb-1.5 block text-[13px] font-semibold text-gray-700">Damage Details</label>
                                        <textarea className="block w-full rounded-lg border border-[#d2deeb] bg-white px-3 py-2.5 text-[13px] text-gray-800 placeholder-gray-400 focus:border-[#4663ac] focus:outline-none focus:ring-1 focus:ring-[#4663ac] shadow-sm transition-colors" placeholder="Describe the damage..." rows="4"></textarea>
                                    </div>
                                    <div className="flex items-center">
                                        <label className="relative flex cursor-pointer items-center gap-3 group">
                                            <div className="relative flex h-5 w-5 items-center justify-center">
                                                <input type="checkbox" className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-[#d2deeb] bg-white checked:border-green-600 checked:bg-green-600 focus:outline-none focus:ring-1 focus:ring-green-600 transition-all shadow-sm" />
                                                <svg className="pointer-events-none absolute h-3.5 w-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                            </div>
                                            <span className="text-[13px] font-semibold text-gray-700 group-hover:text-gray-900 transition-colors">Mark as Resolved</span>
                                        </label>
                                    </div>
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-[13px] font-semibold text-gray-700 italic opacity-80">Supporting Document / Evidence</label>
                                    <div className="relative group h-[calc(100%-28px)] min-h-[140px]">
                                        <input 
                                            type="file" 
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                                        />
                                        <div className="flex flex-col items-center justify-center h-full w-full rounded-lg border-2 border-dashed border-gray-200 bg-gray-50/50 px-4 py-6 text-center group-hover:border-[#3f59a3] group-hover:bg-white transition-all shadow-inner">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-gray-400 group-hover:text-[#3f59a3] transition-colors shadow-sm mb-3">
                                                <FileUp className="h-6 w-6" />
                                            </div>
                                            <span className="font-bold text-gray-800 block">Upload Attachment</span>
                                            <span className="text-[11px] text-gray-500 mt-1">PDF, PNG, JPG up to 10MB</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 border-t border-gray-100 bg-gray-50/50 px-6 py-4">
                            <button onClick={() => setIsIncidentModalOpen(false)} className="rounded-lg border border-[#d2deeb] bg-white px-5 py-2.5 text-[13px] font-semibold text-gray-600 shadow-sm hover:bg-gray-50 transition-colors">Cancel</button>
                            <button onClick={() => setIsIncidentModalOpen(false)} className="rounded-lg bg-orange-600 hover:bg-orange-700 px-6 py-2.5 text-[13px] font-semibold text-white shadow-sm transition-colors">File Report</button>
                        </div>
                    </div>
                </div>
            )}
        </LabLayout>
    );
}
