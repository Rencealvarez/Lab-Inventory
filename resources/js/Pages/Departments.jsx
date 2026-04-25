import React, { useEffect, useMemo, useState } from 'react';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Building2, CheckCircle2, Plus, Search, XCircle } from 'lucide-react';

import LabLayout from '@/Layouts/LabLayout';

const emptyFormState = {
    name: '',
    code: '',
    description: '',
};

export default function Departments({ departments = [] }) {
    const { flash } = usePage().props;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [search, setSearch] = useState('');
    const [toast, setToast] = useState(null);

    const form = useForm(emptyFormState);

    useEffect(() => {
        if (flash?.success) setToast({ type: 'success', message: flash.success });
    }, [flash?.success]);

    useEffect(() => {
        if (flash?.error) setToast({ type: 'error', message: flash.error });
    }, [flash?.error]);

    useEffect(() => {
        if (!toast) return undefined;
        const t = setTimeout(() => setToast(null), 4200);
        return () => clearTimeout(t);
    }, [toast]);

    const filteredDepartments = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return departments;
        return departments.filter((d) =>
            [d.name, d.code, d.description]
                .filter(Boolean)
                .some((value) => String(value).toLowerCase().includes(q))
        );
    }, [departments, search]);

    const openAdd = () => {
        setEditingId(null);
        form.clearErrors();
        form.setData({ ...emptyFormState });
        setIsModalOpen(true);
    };

    const openEdit = (department) => {
        setEditingId(department.id);
        form.clearErrors();
        form.setData({
            name: department.name ?? '',
            code: department.code ?? '',
            description: department.description ?? '',
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
        form.clearErrors();
    };

    const submitDepartment = (e) => {
        e.preventDefault();
        const opts = {
            preserveScroll: true,
            onSuccess: () => {
                closeModal();
                form.setData({ ...emptyFormState });
            },
        };

        if (editingId) {
            form.put(route('departments.update', editingId), opts);
            return;
        }

        form.post(route('departments.store'), opts);
    };

    const confirmDelete = (department) => {
        if (!window.confirm(`Remove "${department.name}" department?`)) return;
        router.delete(route('departments.destroy', department.id), { preserveScroll: true });
    };

    return (
        <LabLayout title="Departments">
            <Head title="Departments" />

            {toast && (
                <div className="fixed right-6 top-6 z-[60] flex max-w-sm items-start gap-3 rounded-xl border border-[#d2deeb] bg-white px-4 py-3 shadow-[0_8px_30px_-8px_rgba(0,0,0,0.12)]">
                    {toast.type === 'success' ? (
                        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" strokeWidth={2} />
                    ) : (
                        <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" strokeWidth={2} />
                    )}
                    <p className="text-[13px] font-medium leading-snug text-gray-800">{toast.message}</p>
                    <button
                        type="button"
                        onClick={() => setToast(null)}
                        className="ml-1 shrink-0 rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                    >
                        <XCircle className="h-4 w-4" />
                    </button>
                </div>
            )}

            <div className="flex-1 overflow-auto p-8">
                <div className="mx-auto w-full max-w-[1100px] rounded-xl border border-[#e1f1fd] bg-white shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
                    <div className="flex flex-col items-start justify-between px-8 py-6 sm:flex-row sm:items-center">
                        <div className="flex items-center gap-3">
                            <div className="flex h-[42px] w-[42px] items-center justify-center rounded-lg border border-[#d2deeb] bg-white text-gray-600 shadow-sm">
                                <Building2 className="h-[22px] w-[22px]" strokeWidth={1.5} />
                            </div>
                            <h1 className="text-[22px] font-bold tracking-tight text-gray-800">Departments</h1>
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
                                    className="block w-full rounded-lg border border-[#d2deeb] bg-[#f8fafc] py-2.5 pl-10 pr-3 text-[13px] text-gray-800 placeholder-gray-400 shadow-sm transition-colors focus:border-[#4663ac] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#4663ac] sm:w-64"
                                    placeholder="Search departments..."
                                />
                            </div>
                            <button
                                type="button"
                                onClick={openAdd}
                                className="flex items-center gap-2 whitespace-nowrap rounded-lg bg-[#1e293b] px-4 py-2.5 text-[13px] font-semibold text-white shadow-sm transition-colors hover:bg-gray-800"
                            >
                                <Plus className="h-4 w-4" strokeWidth={2.5} />
                                Add Department
                            </button>
                        </div>
                    </div>

                    <div className="mt-2 overflow-x-auto border-t border-[#f1f5f9]">
                        <table className="w-full whitespace-nowrap text-left text-[13px]">
                            <thead className="border-b border-[#f1f5f9] bg-[#f8fafc] text-[11px] font-bold uppercase tracking-wider text-gray-400">
                                <tr>
                                    <th className="px-5 py-3.5">Code</th>
                                    <th className="px-5 py-3.5">Name</th>
                                    <th className="px-5 py-3.5">Description</th>
                                    <th className="px-5 py-3.5">Users</th>
                                    <th className="px-5 py-3.5">Facilities</th>
                                    <th className="px-5 py-3.5 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#f1f5f9] text-gray-600">
                                {filteredDepartments.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-5 py-10 text-center text-[13px] text-gray-500">
                                            No departments found.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredDepartments.map((department) => (
                                        <tr key={department.id} className="group transition-colors hover:bg-[#f8fafc]">
                                            <td className="px-5 py-3.5 font-semibold text-gray-700">{department.code}</td>
                                            <td className="px-5 py-3.5 font-semibold text-gray-800">{department.name}</td>
                                            <td className="max-w-[280px] px-5 py-3.5 text-gray-600">
                                                <span className="block truncate">{department.description || '—'}</span>
                                            </td>
                                            <td className="px-5 py-3.5 text-gray-700">{department.users_count}</td>
                                            <td className="px-5 py-3.5 text-gray-700">{department.laboratories_count}</td>
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center justify-end gap-2 pr-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => openEdit(department)}
                                                        className="rounded-md border border-gray-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-gray-700 hover:bg-gray-50"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => confirmDelete(department)}
                                                        className="rounded-md border border-red-100 bg-red-50 px-2.5 py-1 text-[11px] font-semibold text-red-600 hover:bg-red-100"
                                                    >
                                                        Delete
                                                    </button>
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

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
                        <form onSubmit={submitDepartment}>
                            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                                <div>
                                    <h2 className="text-lg font-bold text-gray-800">
                                        {editingId ? 'Edit Department' : 'Add Department'}
                                    </h2>
                                    <p className="text-[13px] text-gray-500">Manage department directory.</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                                >
                                    <XCircle className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="space-y-4 px-6 py-6">
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div>
                                        <label className="mb-1.5 block text-[13px] font-semibold text-gray-700">Code</label>
                                        <input
                                            type="text"
                                            value={form.data.code}
                                            onChange={(e) => form.setData('code', e.target.value)}
                                            className="block w-full rounded-lg border border-[#d2deeb] bg-white px-3 py-2.5 text-[13px] text-gray-800 placeholder-gray-400 shadow-sm transition-colors focus:border-[#4663ac] focus:outline-none focus:ring-1 focus:ring-[#4663ac]"
                                            placeholder="e.g. SCI"
                                            required
                                        />
                                        {form.errors.code && <p className="mt-1 text-xs text-red-500">{form.errors.code}</p>}
                                    </div>
                                    <div>
                                        <label className="mb-1.5 block text-[13px] font-semibold text-gray-700">Name</label>
                                        <input
                                            type="text"
                                            value={form.data.name}
                                            onChange={(e) => form.setData('name', e.target.value)}
                                            className="block w-full rounded-lg border border-[#d2deeb] bg-white px-3 py-2.5 text-[13px] text-gray-800 placeholder-gray-400 shadow-sm transition-colors focus:border-[#4663ac] focus:outline-none focus:ring-1 focus:ring-[#4663ac]"
                                            placeholder="e.g. Science & Technology"
                                            required
                                        />
                                        {form.errors.name && <p className="mt-1 text-xs text-red-500">{form.errors.name}</p>}
                                    </div>
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-[13px] font-semibold text-gray-700">Description</label>
                                    <textarea
                                        value={form.data.description}
                                        onChange={(e) => form.setData('description', e.target.value)}
                                        rows={3}
                                        className="block w-full rounded-lg border border-[#d2deeb] bg-white px-3 py-2.5 text-[13px] text-gray-800 placeholder-gray-400 shadow-sm transition-colors focus:border-[#4663ac] focus:outline-none focus:ring-1 focus:ring-[#4663ac]"
                                        placeholder="Optional department description..."
                                    />
                                    {form.errors.description && (
                                        <p className="mt-1 text-xs text-red-500">{form.errors.description}</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 border-t border-gray-100 bg-gray-50/50 px-6 py-4">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="rounded-lg border border-[#d2deeb] bg-white px-5 py-2.5 text-[13px] font-semibold text-gray-600 shadow-sm transition-colors hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={form.processing}
                                    className="rounded-lg bg-[#4663ac] px-6 py-2.5 text-[13px] font-semibold text-white shadow-sm transition-colors hover:bg-[#3f59a3] disabled:opacity-60"
                                >
                                    {form.processing ? 'Saving…' : editingId ? 'Update Department' : 'Save Department'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </LabLayout>
    );
}
