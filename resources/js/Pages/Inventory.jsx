import React, { useCallback, useMemo, useState } from 'react';
import { router, useForm } from '@inertiajs/react';
import {
    FileText,
    Plus,
    Search,
    XCircle
} from 'lucide-react';
import LabLayout from '@/Layouts/LabLayout';

export default function Inventory({ items = [], categories = [], locations = [] }) {
    const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [search, setSearch] = useState('');
    const { data, setData, post, processing, reset, errors } = useForm({
        sku: '',
        name: '',
        type: '',
        location_id: '',
        current_stock: 0,
        min_stock_alert: '',
        status: 'available',
    });

    const closeModal = () => {
        setIsAddItemModalOpen(false);
        setSelectedItem(null);
        reset();
    };

    const openAddModal = () => {
        setSelectedItem(null);
        reset();
        setData({
            sku: '',
            name: '',
            type: '',
            location_id: '',
            current_stock: 0,
            min_stock_alert: '',
            status: 'available',
        });
        setIsAddItemModalOpen(true);
    };

    const openEditModal = (item) => {
        setSelectedItem(item);
        setData({
            sku: item.sku ?? '',
            name: item.name ?? '',
            type: item.category_id ? String(item.category_id) : '',
            location_id: item.location_id ? String(item.location_id) : '',
            current_stock: item.stock ?? 0,
            min_stock_alert: item.min_stock_alert ?? '',
            status: item.status_raw ?? 'available',
        });
        setIsAddItemModalOpen(true);
    };

    const submit = (e) => {
        e.preventDefault();
        if (selectedItem) {
            router.put(route('inventory.update', selectedItem.id), data, {
                preserveState: true,
                preserveScroll: true,
                only: ['items', 'categories', 'locations', 'flash', 'errors', 'systemStatus'],
                onSuccess: () => closeModal(),
            });

            return;
        }

        post(route('inventory.store'), {
            preserveState: true,
            preserveScroll: true,
            only: ['items', 'categories', 'locations', 'flash', 'errors', 'systemStatus'],
            onSuccess: () => closeModal(),
        });
    };

    const handleDelete = (item) => {
        if (!window.confirm(`Delete "${item.name}"? This action cannot be undone.`)) {
            return;
        }

        router.delete(route('inventory.destroy', item.id), {
            preserveState: true,
            preserveScroll: true,
            only: ['items', 'categories', 'locations', 'flash', 'errors', 'systemStatus'],
        });
    };

    const getStatusStyle = useCallback((status) => {
        switch (status) {
            case 'Active': return 'text-emerald-700 bg-emerald-50 border-emerald-100';
            case 'Low Stock': return 'text-amber-700 bg-amber-50 border-amber-100';
            case 'Maintenance': return 'text-blue-700 bg-blue-50 border-blue-100';
            case 'Damaged': return 'text-red-700 bg-red-50 border-red-100';
            case 'Under Repair': return 'text-yellow-700 bg-yellow-50 border-yellow-100';
            case 'Inactive': return 'text-gray-600 bg-gray-100 border-gray-200';
            case 'Decommissioned': return 'text-gray-600 bg-gray-100 border-gray-200';
            default: return 'text-gray-600 bg-gray-50 border-gray-100';
        }
    }, []);

    const filteredItems = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return items;

        return items.filter((item) =>
            [item.sku, item.name, item.type, item.location, item.status]
                .filter(Boolean)
                .some((value) => String(value).toLowerCase().includes(q))
        );
    }, [items, search]);

    return (
        <LabLayout title="Inventory">
            <div className="flex-1 overflow-auto p-8">
                <div className="mx-auto w-full max-w-[1100px] rounded-xl bg-white shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-[#e1f1fd]">
                    {/* Header Section */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-8 py-6">
                        <div className="flex items-center gap-3">
                            <div className="flex h-[42px] w-[42px] items-center justify-center rounded-lg bg-white border border-[#d2deeb] text-gray-600 shadow-sm">
                                <FileText className="h-[22px] w-[22px]" strokeWidth={1.5} />
                            </div>
                            <div>
                                <h1 className="text-[22px] font-bold text-gray-800 tracking-tight">Laboratory Inventory</h1>
                                <p className="mt-0.5 text-xs text-gray-500">
                                    {filteredItems.length} item{filteredItems.length === 1 ? '' : 's'} shown
                                </p>
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
                                    className="block w-full sm:w-64 rounded-lg border border-[#d2deeb] bg-[#f8fafc] py-2.5 pl-10 pr-3 text-[13px] text-gray-800 placeholder-gray-400 focus:border-[#4663ac] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#4663ac] transition-colors shadow-sm"
                                    placeholder="Search SKU, item, type, location..."
                                />
                            </div>
                            <button 
                                onClick={openAddModal}
                                className="flex items-center gap-2 rounded-lg bg-[#1e293b] px-4 py-2.5 text-[13px] font-semibold text-white shadow-sm hover:bg-gray-800 transition-colors whitespace-nowrap"
                            >
                                <Plus className="h-4 w-4" strokeWidth={2.5} />
                                Add Item
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
                                    <th className="px-5 py-3.5">SKU / Serial</th>
                                    <th className="px-5 py-3.5">Item Name</th>
                                    <th className="px-5 py-3.5">Type</th>
                                    <th className="px-5 py-3.5">Location</th>
                                    <th className="px-5 py-3.5">Stock</th>
                                    <th className="px-5 py-3.5">Status</th>
                                    <th className="px-5 py-3.5 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#f1f5f9] text-gray-600">
                                {filteredItems.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={8}
                                            className="px-5 py-10 text-center text-sm text-gray-500"
                                        >
                                            No matching items found.
                                        </td>
                                    </tr>
                                ) : (
                                filteredItems.map((item) => {
                                    const min = item.min_stock_alert ?? 0;
                                    const isLow =
                                        min > 0 && item.stock <= min;
                                    const barPct = min > 0
                                        ? Math.min(
                                              (item.stock /
                                                  Math.max(min * 2, 1)) *
                                                  100,
                                              100
                                          )
                                        : Math.min((item.stock / 200) * 100, 100);

                                    return (
                                    <tr key={item.id} className="hover:bg-[#f8fafc] transition-colors group">
                                        <td className="px-5 py-3.5">
                                            <div className="flex h-4 w-4 items-center justify-center rounded border border-gray-300" />
                                        </td>
                                        <td className="px-5 py-3.5 font-medium text-gray-700">{item.sku}</td>
                                        <td className="px-5 py-3.5 font-semibold text-gray-800">{item.name}</td>
                                        <td className="px-5 py-3.5 text-gray-600">{item.type}</td>
                                        <td className="px-5 py-3.5 text-gray-600">{item.location}</td>
                                        <td className="px-5 py-3.5">
                                            <div className="flex items-center gap-3">
                                                <span className="font-medium text-gray-700 w-8">{item.stock}</span>
                                                <div className="h-1.5 w-20 rounded-full bg-gray-200 overflow-hidden">
                                                    <div 
                                                        className={`h-full rounded-full ${isLow ? 'bg-orange-500' : 'bg-[#4663ac]'}`} 
                                                        style={{ width: `${barPct}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <span className={`inline-flex items-center rounded border px-2.5 py-0.5 text-[11px] font-semibold ${getStatusStyle(item.status)}`}>
                                                {item.status}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <div className="flex items-center justify-end gap-2 pr-2">
                                                <button
                                                    type="button"
                                                    onClick={() => openEditModal(item)}
                                                    className="rounded-md border border-gray-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-gray-700 hover:bg-gray-50"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(item)}
                                                    className="rounded-md border border-red-100 bg-red-50 px-2.5 py-1 text-[11px] font-semibold text-red-600 hover:bg-red-100"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                    );
                                })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Add Item Modal */}
            {isAddItemModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="w-full max-w-2xl rounded-xl bg-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                            <div>
                                <h2 className="text-lg font-bold text-gray-800">
                                    {selectedItem ? 'Edit Inventory Item' : 'Add New Inventory Item'}
                                </h2>
                                <p className="text-[13px] text-gray-500">Register new equipment or consumables</p>
                            </div>
                            <button 
                                onClick={closeModal}
                                className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                            >
                                <XCircle className="h-5 w-5" />
                            </button>
                        </div>
                        
                        <form className="flex-1 overflow-y-auto px-6 py-6" onSubmit={submit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {/* Left Column */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="mb-1.5 block text-[13px] font-semibold text-gray-700">SKU / Serial Number</label>
                                        <input value={data.sku} onChange={(e) => setData('sku', e.target.value)} type="text" className="block w-full rounded-lg border border-[#d2deeb] bg-white px-3 py-2.5 text-[13px] text-gray-800 placeholder-gray-400 focus:border-[#4663ac] focus:outline-none focus:ring-1 focus:ring-[#4663ac] shadow-sm transition-colors" placeholder="e.g. SKU-001" />
                                        {errors.sku && <p className="mt-1 text-xs text-red-500">{errors.sku}</p>}
                                    </div>
                                    <div>
                                        <label className="mb-1.5 block text-[13px] font-semibold text-gray-700">Item Name</label>
                                        <input value={data.name} onChange={(e) => setData('name', e.target.value)} type="text" className="block w-full rounded-lg border border-[#d2deeb] bg-white px-3 py-2.5 text-[13px] text-gray-800 placeholder-gray-400 focus:border-[#4663ac] focus:outline-none focus:ring-1 focus:ring-[#4663ac] shadow-sm transition-colors" placeholder="e.g. Microscope" />
                                        {(errors.name || errors.item_name) && <p className="mt-1 text-xs text-red-500">{errors.name ?? errors.item_name}</p>}
                                    </div>
                                    <div>
                                        <label className="mb-1.5 block text-[13px] font-semibold text-gray-700">Item Type</label>
                                        <select value={data.type} onChange={(e) => setData('type', e.target.value)} className="block w-full rounded-lg border border-[#d2deeb] bg-white px-3 py-2.5 text-[13px] text-gray-800 focus:border-[#4663ac] focus:outline-none focus:ring-1 focus:ring-[#4663ac] shadow-sm transition-colors">
                                            <option value="">Select type</option>
                                            {categories.map((category) => (
                                                <option key={category.id} value={category.id}>
                                                    {category.name}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.type && <p className="mt-1 text-xs text-red-500">{errors.type}</p>}
                                    </div>
                                </div>

                                {/* Right Column */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="mb-1.5 block text-[13px] font-semibold text-gray-700">Facility / Location</label>
                                        <select value={data.location_id} onChange={(e) => setData('location_id', e.target.value)} className="block w-full rounded-lg border border-[#d2deeb] bg-white px-3 py-2.5 text-[13px] text-gray-800 focus:border-[#4663ac] focus:outline-none focus:ring-1 focus:ring-[#4663ac] shadow-sm transition-colors">
                                            <option value="">Select location</option>
                                            {locations.map((location) => (
                                                <option key={location.id} value={location.id}>
                                                    {location.laboratory ? `${location.laboratory} / ${location.name}` : location.name}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.location_id && <p className="mt-1 text-xs text-red-500">{errors.location_id}</p>}
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="mb-1.5 block text-[13px] font-semibold text-gray-700">Stock Quantity</label>
                                            <input value={data.current_stock} onChange={(e) => setData('current_stock', e.target.value)} type="number" className="block w-full rounded-lg border border-[#d2deeb] bg-white px-3 py-2.5 text-[13px] text-gray-800 focus:border-[#4663ac] focus:outline-none focus:ring-1 focus:ring-[#4663ac] shadow-sm transition-colors" placeholder="0" />
                                            {errors.current_stock && <p className="mt-1 text-xs text-red-500">{errors.current_stock}</p>}
                                        </div>
                                        <div>
                                            <label className="mb-1.5 block text-[13px] font-semibold text-gray-700">Reorder Point</label>
                                            <input value={data.min_stock_alert} onChange={(e) => setData('min_stock_alert', e.target.value)} type="number" className="block w-full rounded-lg border border-[#d2deeb] bg-white px-3 py-2.5 text-[13px] text-gray-800 focus:border-[#4663ac] focus:outline-none focus:ring-1 focus:ring-[#4663ac] shadow-sm transition-colors" placeholder="0" />
                                            {errors.min_stock_alert && <p className="mt-1 text-xs text-red-500">{errors.min_stock_alert}</p>}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="mb-1.5 block text-[13px] font-semibold text-gray-700">Status</label>
                                        <select value={data.status} onChange={(e) => setData('status', e.target.value)} className="block w-full rounded-lg border border-[#d2deeb] bg-white px-3 py-2.5 text-[13px] text-gray-800 focus:border-[#4663ac] focus:outline-none focus:ring-1 focus:ring-[#4663ac] shadow-sm transition-colors">
                                            <option value="available">Available</option>
                                            <option value="reserved">Reserved</option>
                                            <option value="in_use">In Use</option>
                                            <option value="lost">Lost</option>
                                            <option value="damaged">Damaged</option>
                                            <option value="under_repair">Under Repair</option>
                                            <option value="inactive">Inactive</option>
                                        </select>
                                        {errors.status && <p className="mt-1 text-xs text-red-500">{errors.status}</p>}
                                    </div>
                                </div>
                            </div>
                        </form>

                        <div className="flex items-center justify-end gap-3 border-t border-gray-100 bg-gray-50/80 px-6 py-4">
                            <button onClick={closeModal} type="button" className="rounded-lg border border-[#d2deeb] bg-white px-5 py-2.5 text-[13px] font-semibold text-gray-600 shadow-sm hover:bg-gray-50 transition-colors">Cancel</button>
                            <button type="button" disabled={processing} onClick={submit} className="rounded-lg bg-[#4663ac] hover:bg-[#3f59a3] px-6 py-2.5 text-[13px] font-semibold text-white shadow-sm transition-colors disabled:opacity-60">{processing ? 'Saving...' : selectedItem ? 'Update Item' : 'Save Item'}</button>
                        </div>
                    </div>
                </div>
            )}
        </LabLayout>
    );
}
