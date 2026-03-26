import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import {
    FileText,
    Plus,
    MoreVertical,
    Search,
    XCircle
} from 'lucide-react';

import LabLayout from '@/Layouts/LabLayout';

export default function Transactions() {
    const [isNewTxModalOpen, setIsNewTxModalOpen] = useState(false);

    const transactions = [
        { id: 'TRX-001', item: 'Microscope', user: 'Dr. Smith', type: 'Borrow', borrowDate: '2023-11-01', returnDate: '2023-11-15', status: 'Active', conditionOut: 'Good' },
        { id: 'TRX-002', item: 'Beaker 500ml', user: 'Jane Doe', type: 'Consume', borrowDate: '2023-11-05', returnDate: '-', status: 'Completed', conditionOut: 'New' },
        { id: 'TRX-003', item: 'Oscilloscope', user: 'Dr. Jones', type: 'Borrow', borrowDate: '2023-10-20', returnDate: '2023-11-20', status: 'Overdue', conditionOut: 'Fair' },
        { id: 'TRX-004', item: 'Petri Dish', user: 'Alice Chen', type: 'Consume', borrowDate: '2023-11-10', returnDate: '-', status: 'Completed', conditionOut: 'New' },
        { id: 'TRX-005', item: 'Bunsen Burner', user: 'Bob Wilson', type: 'Borrow', borrowDate: '2023-11-12', returnDate: '2023-11-19', status: 'Active', conditionOut: 'Good' },
    ];

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Completed': return 'text-green-500 bg-green-50';
            case 'Overdue': return 'text-red-500 bg-red-50';
            case 'Active': return 'text-blue-500 bg-blue-50';
            case 'Cancelled': return 'text-gray-500 bg-gray-100';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    return (
        <LabLayout title="Transactions">
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
                                onClick={() => setIsNewTxModalOpen(true)}
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
                                {transactions.map((trx, i) => (
                                    <tr key={trx.id} className={`hover:bg-[#f8fafc] transition-colors group ${i === 2 ? 'bg-[#f8fafc]' : ''}`}>
                                        <td className="px-5 py-3.5">
                                            <div className={`w-4 h-4 rounded border ${i === 2 ? 'bg-[#4663ac] border-[#4663ac]' : 'border-gray-300'} flex items-center justify-center`}>
                                                {i === 2 && <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 4L4 7L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5 font-medium text-gray-700">{trx.id}</td>
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
                                                <div className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-[#f1f5f9] cursor-pointer text-gray-400 relative">
                                                    <MoreVertical className="h-[18px] w-[18px]" />
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* New Transaction Modal */}
            {isNewTxModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="w-full max-w-2xl rounded-xl bg-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                            <div>
                                <h2 className="text-lg font-bold text-gray-800">Process Transaction</h2>
                                <p className="text-[13px] text-gray-500">Checkout or return a lab item</p>
                            </div>
                            <button 
                                onClick={() => setIsNewTxModalOpen(false)}
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
                                        <label className="mb-1.5 block text-[13px] font-semibold text-gray-700">Transaction Type</label>
                                        <select className="block w-full rounded-lg border border-[#d2deeb] bg-white px-3 py-2.5 text-[13px] text-gray-800 focus:border-[#4663ac] focus:outline-none focus:ring-1 focus:ring-[#4663ac] shadow-sm transition-colors">
                                            <option value="Borrow">Borrow (Check-out)</option>
                                            <option value="Return">Return (Check-in)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="mb-1.5 block text-[13px] font-semibold text-gray-700">Item Search</label>
                                        <input type="text" className="block w-full rounded-lg border border-[#d2deeb] bg-white px-3 py-2.5 text-[13px] text-gray-800 placeholder-gray-400 focus:border-[#4663ac] focus:outline-none focus:ring-1 focus:ring-[#4663ac] shadow-sm transition-colors" placeholder="Scan or enter SKU / Item Name" />
                                    </div>
                                    <div>
                                        <label className="mb-1.5 block text-[13px] font-semibold text-gray-700">User Identification</label>
                                        <input type="text" className="block w-full rounded-lg border border-[#d2deeb] bg-white px-3 py-2.5 text-[13px] text-gray-800 placeholder-gray-400 focus:border-[#4663ac] focus:outline-none focus:ring-1 focus:ring-[#4663ac] shadow-sm transition-colors" placeholder="Enter User ID or Email" />
                                    </div>
                                </div>

                                {/* Right Column */}
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="mb-1.5 block text-[13px] font-semibold text-gray-700">Date Issued</label>
                                            <input type="date" className="block w-full rounded-lg border border-[#d2deeb] bg-white px-3 py-1.5 text-[13px] text-gray-800 focus:border-[#4663ac] focus:outline-none focus:ring-1 focus:ring-[#4663ac] shadow-sm transition-colors" />
                                        </div>
                                        <div>
                                            <label className="mb-1.5 block text-[13px] font-semibold text-gray-700">Expected Return</label>
                                            <input type="date" className="block w-full rounded-lg border border-[#d2deeb] bg-white px-3 py-1.5 text-[13px] text-gray-800 focus:border-[#4663ac] focus:outline-none focus:ring-1 focus:ring-[#4663ac] shadow-sm transition-colors" />
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
                                        <textarea className="block w-full rounded-lg border border-[#d2deeb] bg-white px-3 py-2.5 text-[13px] text-gray-800 placeholder-gray-400 focus:border-[#4663ac] focus:outline-none focus:ring-1 focus:ring-[#4663ac] shadow-sm transition-colors" placeholder="Any additional notes..." rows="2"></textarea>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 border-t border-gray-100 bg-gray-50/50 px-6 py-4">
                            <button onClick={() => setIsNewTxModalOpen(false)} className="rounded-lg border border-[#d2deeb] bg-white px-5 py-2.5 text-[13px] font-semibold text-gray-600 shadow-sm hover:bg-gray-50 transition-colors">Cancel</button>
                            <button onClick={() => setIsNewTxModalOpen(false)} className="rounded-lg bg-[#4663ac] hover:bg-[#3f59a3] px-6 py-2.5 text-[13px] font-semibold text-white shadow-sm transition-colors">Process Transaction</button>
                        </div>
                    </div>
                </div>
            )}
        </LabLayout>
    );
}
