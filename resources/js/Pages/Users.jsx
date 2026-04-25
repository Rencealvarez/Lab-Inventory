import React, { useEffect, useMemo, useState } from 'react';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import {
    Users as UsersIcon,
    Plus,
    Search,
    XCircle,
    CheckCircle2,
} from 'lucide-react';

import LabLayout from '@/Layouts/LabLayout';

const ROLE_LABELS = {
    lab_manager: 'Lab Manager',
    professor: 'Professor',
    student: 'Student',
    admin: 'Admin',
    technician: 'Technician',
    staff: 'Staff',
};

const emptyFormState = {
    first_name: '',
    last_name: '',
    email: '',
    username: '',
    id_number: '',
    role: 'student',
    department_id: '',
    status: 'active',
    password: '',
    password_confirmation: '',
};

function roleLabel(role) {
    return ROLE_LABELS[role] ?? role ?? '—';
}

function formatStatus(status) {
    if (!status) return 'Active';
    return status.charAt(0).toUpperCase() + status.slice(1);
}

export default function Users({ users: usersProp = [], departments = [] }) {
    const { flash } = usePage().props;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [search, setSearch] = useState('');
    const [toast, setToast] = useState(null);

    const form = useForm(emptyFormState);

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

    const filteredUsers = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return usersProp;
        return usersProp.filter((u) => {
            const hay = [
                u.id_number,
                u.name,
                u.email,
                u.username,
                roleLabel(u.role),
                u.department,
                formatStatus(u.status),
            ]
                .filter(Boolean)
                .join(' ')
                .toLowerCase();
            return hay.includes(q);
        });
    }, [usersProp, search]);

    const getStatusStyle = (status) => {
        const s = (status || 'active').toLowerCase();
        switch (s) {
            case 'active':
                return 'text-green-600 bg-green-50 border-green-200';
            case 'inactive':
                return 'text-gray-500 bg-gray-100 border-gray-200';
            case 'suspended':
                return 'text-red-600 bg-red-50 border-red-200';
            default:
                return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    const getRoleStyle = (role) => {
        switch (role) {
            case 'lab_manager':
                return 'text-purple-600 bg-purple-50';
            case 'professor':
                return 'text-blue-600 bg-blue-50';
            case 'student':
                return 'text-gray-600 bg-gray-50';
            case 'admin':
                return 'text-amber-700 bg-amber-50';
            default:
                return 'text-slate-600 bg-slate-50';
        }
    };

    const openAdd = () => {
        setEditingId(null);
        form.clearErrors();
        form.setData({ ...emptyFormState });
        setIsModalOpen(true);
    };

    const openEdit = (user) => {
        setEditingId(user.id);
        const parts = (user.name || '').trim().split(/\s+/);
        const first = parts[0] || '';
        const last = parts.slice(1).join(' ') || '';
        form.clearErrors();
        form.setData({
            ...emptyFormState,
            first_name: first,
            last_name: last,
            email: user.email || '',
            username: user.username || '',
            id_number: user.id_number || '',
            role: user.role || 'student',
            department_id: user.department_id != null ? String(user.department_id) : '',
            status: user.status || 'active',
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
        form.clearErrors();
    };

    const submitUser = (e) => {
        e.preventDefault();
        const opts = {
            preserveScroll: true,
            onSuccess: () => {
                closeModal();
                form.setData({ ...emptyFormState });
            },
        };

        if (editingId) {
            form.put(route('users.update', editingId), opts);
        } else {
            form.post(route('users.store'), opts);
        }
    };

    const confirmDelete = (user) => {
        if (!window.confirm(`Remove user ${user.name}? This cannot be undone.`)) return;
        router.delete(route('users.destroy', user.id), { preserveScroll: true });
    };

    return (
        <LabLayout title="Users">
            <Head title="Users" />

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
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="block w-full sm:w-64 rounded-lg border border-[#d2deeb] bg-[#f8fafc] py-2.5 pl-10 pr-3 text-[13px] text-gray-800 placeholder-gray-400 focus:border-[#4663ac] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#4663ac] transition-colors shadow-sm"
                                    placeholder="Search users..."
                                />
                            </div>
                            <button
                                type="button"
                                onClick={openAdd}
                                className="flex items-center gap-2 rounded-lg bg-[#1e293b] px-4 py-2.5 text-[13px] font-semibold text-white shadow-sm hover:bg-gray-800 transition-colors whitespace-nowrap"
                            >
                                <Plus className="h-4 w-4" strokeWidth={2.5} />
                                Add User
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto border-t border-[#f1f5f9] mt-2">
                        <table className="w-full text-left text-[13px] whitespace-nowrap">
                            <thead className="bg-[#f8fafc] text-[11px] font-bold text-gray-400 uppercase tracking-wider border-b border-[#f1f5f9]">
                                <tr>
                                    <th className="px-6 py-3.5 w-5 font-normal">
                                        <div className="w-4 h-4 rounded border border-gray-300" />
                                    </th>
                                    <th className="px-6 py-3.5">ID Number</th>
                                    <th className="px-6 py-3.5">User Details</th>
                                    <th className="px-6 py-3.5">Role</th>
                                    <th className="px-6 py-3.5">Department</th>
                                    <th className="px-6 py-3.5 shrink-0">Status</th>
                                    <th className="px-6 py-3.5 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#f1f5f9] text-gray-600">
                                {filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-10 text-center text-[13px] text-gray-500">
                                            No users match your search.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredUsers.map((user) => (
                                        <tr key={user.id} className="hover:bg-[#f8fafc] transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="w-4 h-4 rounded border border-gray-300" />
                                            </td>
                                            <td className="px-6 py-4 font-semibold text-gray-800">
                                                {user.id_number || '—'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-gray-800">{user.name}</div>
                                                <div className="text-[12px] text-gray-500 mt-0.5">{user.email}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className={`inline-flex items-center rounded px-2 py-0.5 text-[11px] font-bold ${getRoleStyle(user.role)}`}
                                                >
                                                    {roleLabel(user.role)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-medium text-gray-700">{user.department}</td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className={`inline-flex items-center rounded-md px-2 py-1 text-[11px] font-bold shadow-sm border ${getStatusStyle(user.status)}`}
                                                >
                                                    {formatStatus(user.status)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-2 pr-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => openEdit(user)}
                                                        className="rounded-md border border-gray-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-gray-700 hover:bg-gray-50"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => confirmDelete(user)}
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
                    <div className="w-full max-w-2xl rounded-xl bg-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <form onSubmit={submitUser}>
                            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                                <div>
                                    <h2 className="text-lg font-bold text-gray-800">
                                        {editingId ? 'Edit User' : 'Add New User'}
                                    </h2>
                                    <p className="text-[13px] text-gray-500">
                                        {editingId ? 'Update account details' : 'Register a new system user or student'}
                                    </p>
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
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="mb-1.5 block text-[13px] font-semibold text-gray-700">
                                                    First Name
                                                </label>
                                                <input
                                                    type="text"
                                                    value={form.data.first_name}
                                                    onChange={(e) => form.setData('first_name', e.target.value)}
                                                    className="block w-full rounded-lg border border-[#d2deeb] bg-white px-3 py-2.5 text-[13px] text-gray-800 placeholder-gray-400 focus:border-[#4663ac] focus:outline-none focus:ring-1 focus:ring-[#4663ac] shadow-sm transition-colors"
                                                    placeholder="First Name"
                                                    required
                                                />
                                                {form.errors.first_name && (
                                                    <p className="mt-1 text-xs text-red-500">{form.errors.first_name}</p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="mb-1.5 block text-[13px] font-semibold text-gray-700">
                                                    Last Name
                                                </label>
                                                <input
                                                    type="text"
                                                    value={form.data.last_name}
                                                    onChange={(e) => form.setData('last_name', e.target.value)}
                                                    className="block w-full rounded-lg border border-[#d2deeb] bg-white px-3 py-2.5 text-[13px] text-gray-800 placeholder-gray-400 focus:border-[#4663ac] focus:outline-none focus:ring-1 focus:ring-[#4663ac] shadow-sm transition-colors"
                                                    placeholder="Last Name"
                                                    required
                                                />
                                                {form.errors.last_name && (
                                                    <p className="mt-1 text-xs text-red-500">{form.errors.last_name}</p>
                                                )}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="mb-1.5 block text-[13px] font-semibold text-gray-700">
                                                Email Address
                                            </label>
                                            <input
                                                type="email"
                                                value={form.data.email}
                                                onChange={(e) => form.setData('email', e.target.value)}
                                                className="block w-full rounded-lg border border-[#d2deeb] bg-white px-3 py-2.5 text-[13px] text-gray-800 placeholder-gray-400 focus:border-[#4663ac] focus:outline-none focus:ring-1 focus:ring-[#4663ac] shadow-sm transition-colors"
                                                placeholder="Email Address"
                                                required
                                            />
                                            {form.errors.email && (
                                                <p className="mt-1 text-xs text-red-500">{form.errors.email}</p>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="mb-1.5 block text-[13px] font-semibold text-gray-700">
                                                    ID Number
                                                </label>
                                                <input
                                                    type="text"
                                                    value={form.data.id_number}
                                                    onChange={(e) => form.setData('id_number', e.target.value)}
                                                    className="block w-full rounded-lg border border-[#d2deeb] bg-white px-3 py-2.5 text-[13px] text-gray-800 placeholder-gray-400 focus:border-[#4663ac] focus:outline-none focus:ring-1 focus:ring-[#4663ac] shadow-sm transition-colors"
                                                    placeholder="ID Number"
                                                    required
                                                />
                                                {form.errors.id_number && (
                                                    <p className="mt-1 text-xs text-red-500">{form.errors.id_number}</p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="mb-1.5 block text-[13px] font-semibold text-gray-700">
                                                    Username
                                                </label>
                                                <input
                                                    type="text"
                                                    value={form.data.username}
                                                    onChange={(e) => form.setData('username', e.target.value)}
                                                    className="block w-full rounded-lg border border-[#d2deeb] bg-white px-3 py-2.5 text-[13px] text-gray-800 placeholder-gray-400 focus:border-[#4663ac] focus:outline-none focus:ring-1 focus:ring-[#4663ac] shadow-sm transition-colors"
                                                    placeholder="Username"
                                                    required
                                                />
                                                {form.errors.username && (
                                                    <p className="mt-1 text-xs text-red-500">{form.errors.username}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="mb-1.5 block text-[13px] font-semibold text-gray-700">Role</label>
                                            <select
                                                value={form.data.role}
                                                onChange={(e) => form.setData('role', e.target.value)}
                                                className="block w-full rounded-lg border border-[#d2deeb] bg-white px-3 py-2.5 text-[13px] text-gray-800 focus:border-[#4663ac] focus:outline-none focus:ring-1 focus:ring-[#4663ac] shadow-sm transition-colors"
                                            >
                                                <option value="student">Student</option>
                                                <option value="professor">Professor</option>
                                                <option value="lab_manager">Lab Manager</option>
                                                <option value="admin">Admin</option>
                                                <option value="technician">Technician</option>
                                                <option value="staff">Staff</option>
                                            </select>
                                            {form.errors.role && (
                                                <p className="mt-1 text-xs text-red-500">{form.errors.role}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="mb-1.5 block text-[13px] font-semibold text-gray-700">
                                                Department
                                            </label>
                                            <select
                                                value={form.data.department_id}
                                                onChange={(e) => form.setData('department_id', e.target.value)}
                                                className="block w-full rounded-lg border border-[#d2deeb] bg-white px-3 py-2.5 text-[13px] text-gray-800 focus:border-[#4663ac] focus:outline-none focus:ring-1 focus:ring-[#4663ac] shadow-sm transition-colors"
                                            >
                                                <option value="">— None —</option>
                                                {departments.map((d) => (
                                                    <option key={d.id} value={d.id}>
                                                        {d.name}
                                                    </option>
                                                ))}
                                            </select>
                                            {form.errors.department_id && (
                                                <p className="mt-1 text-xs text-red-500">{form.errors.department_id}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="mb-1.5 block text-[13px] font-semibold text-gray-700">Status</label>
                                            <select
                                                value={form.data.status}
                                                onChange={(e) => form.setData('status', e.target.value)}
                                                className="block w-full rounded-lg border border-[#d2deeb] bg-white px-3 py-2.5 text-[13px] text-gray-800 focus:border-[#4663ac] focus:outline-none focus:ring-1 focus:ring-[#4663ac] shadow-sm transition-colors"
                                            >
                                                <option value="active">Active</option>
                                                <option value="inactive">Inactive</option>
                                                <option value="suspended">Suspended</option>
                                            </select>
                                            {form.errors.status && (
                                                <p className="mt-1 text-xs text-red-500">{form.errors.status}</p>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-1 gap-4">
                                            <div>
                                                <label className="mb-1.5 block text-[13px] font-semibold text-gray-700">
                                                    {editingId ? 'New password (optional)' : 'Password'}
                                                </label>
                                                <input
                                                    type="password"
                                                    value={form.data.password}
                                                    onChange={(e) => form.setData('password', e.target.value)}
                                                    className="block w-full rounded-lg border border-[#d2deeb] bg-white px-3 py-2.5 text-[13px] text-gray-800 focus:border-[#4663ac] focus:outline-none focus:ring-1 focus:ring-[#4663ac] shadow-sm transition-colors"
                                                    placeholder={editingId ? 'Leave blank to keep current' : 'Min. 8 characters'}
                                                    autoComplete="new-password"
                                                    required={!editingId}
                                                />
                                                {form.errors.password && (
                                                    <p className="mt-1 text-xs text-red-500">{form.errors.password}</p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="mb-1.5 block text-[13px] font-semibold text-gray-700">
                                                    Confirm password
                                                </label>
                                                <input
                                                    type="password"
                                                    value={form.data.password_confirmation}
                                                    onChange={(e) =>
                                                        form.setData('password_confirmation', e.target.value)
                                                    }
                                                    className="block w-full rounded-lg border border-[#d2deeb] bg-white px-3 py-2.5 text-[13px] text-gray-800 focus:border-[#4663ac] focus:outline-none focus:ring-1 focus:ring-[#4663ac] shadow-sm transition-colors"
                                                    autoComplete="new-password"
                                                    required={!editingId}
                                                />
                                            </div>
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
                                    disabled={form.processing}
                                    className="rounded-lg bg-[#4663ac] hover:bg-[#3f59a3] disabled:opacity-60 px-6 py-2.5 text-[13px] font-semibold text-white shadow-sm transition-colors"
                                >
                                    {form.processing ? 'Saving…' : editingId ? 'Update User' : 'Save User'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </LabLayout>
    );
}
