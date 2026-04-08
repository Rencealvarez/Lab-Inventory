import { usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowLeftRight,
    Clock3,
    Package,
    User,
    AlertCircle,
    Building2,
} from 'lucide-react';
import LabLayout from '@/Layouts/LabLayout';

function formatRelativeTime(isoString) {
    if (!isoString) return '';

    const date = isoString instanceof Date ? isoString : new Date(isoString);
    const timeMs = date.getTime();
    if (Number.isNaN(timeMs)) return '';

    const diffSeconds = Math.floor((Date.now() - timeMs) / 1000);
    if (diffSeconds < 60) return 'Just now';

    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) {
        const unit = diffMinutes === 1 ? 'Minute' : 'Minutes';
        return `${diffMinutes} ${unit} ago`;
    }

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) {
        const unit = diffHours === 1 ? 'Hour' : 'Hours';
        return `${diffHours} ${unit} ago`;
    }

    const diffDays = Math.floor(diffHours / 24);
    const unit = diffDays === 1 ? 'Day' : 'Days';
    return `${diffDays} ${unit} ago`;
}

export default function Dashboard({
    stats,
    lowStock,
    recentActivity,
    laboratoryStatus,
}) {
    const { auth } = usePage().props;
    const user = auth?.user;
    const displayName =
        user?.name ?? user?.username ?? user?.email ?? 'Admin';

    const summary = stats ?? {};
    const lowStockItems = lowStock ?? [];
    const recentItems = recentActivity ?? [];
    const labs = laboratoryStatus ?? [];

    const summaryCards = [
        {
            title: 'Total Items',
            value: summary.totalItems ?? 0,
            icon: Package,
            iconClass: 'bg-blue-100 text-blue-500',
        },
        {
            title: 'Borrowed',
            value: summary.borrowed ?? 0,
            icon: ArrowLeftRight,
            iconClass: 'bg-green-100 text-green-600',
        },
        {
            title: 'Damaged Items',
            value: summary.damaged ?? 0,
            icon: AlertTriangle,
            iconClass: 'bg-red-100 text-red-500',
        },
        {
            title: 'Total Users',
            value: summary.totalUsers ?? 0,
            icon: User,
            iconClass: 'bg-purple-100 text-purple-500',
        },
    ];

    return (
        <LabLayout title="Dashboard">
            <div className="flex-1 overflow-y-auto p-4">
                <header className="mb-4">
                    <h2 className="text-2xl font-medium text-gray-800 tracking-tight">
                        Welcome back,{' '}
                        <span className="font-bold text-[#3f59a3]">{displayName}</span>
                    </h2>
                </header>

                <section className="grid grid-cols-4 gap-4">
                    {summaryCards.map((card) => {
                        const Icon = card.icon;

                        return (
                            <article
                                key={card.title}
                                className="rounded-xl bg-white p-3 text-center shadow-sm"
                            >
                                <div
                                    className={`mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full ${card.iconClass}`}
                                >
                                    <Icon className="h-5 w-5" />
                                </div>
                                <p className="text-3xl font-semibold text-gray-800">
                                    {card.value}
                                </p>
                                <p className="mt-1 text-sm text-gray-600">
                                    {card.title}
                                </p>
                            </article>
                        );
                    })}
                </section>

                <section className="mt-3 grid grid-cols-2 gap-4">
                    <article className="rounded-xl bg-white p-3 shadow-sm">
                        <h3 className="flex items-center justify-center gap-2 text-lg font-medium text-gray-800">
                            Recent Activity
                            <Clock3 className="h-5 w-5" />
                        </h3>

                        <ul className="mt-2 space-y-2">
                            {recentItems.length === 0 ? (
                                <li className="rounded-md bg-gray-50 px-3 py-2 text-sm text-gray-500">
                                    No transactions yet.
                                </li>
                            ) : (
                                recentItems.map((entry) => (
                                    <li
                                        key={entry.id}
                                        className="flex items-start justify-between rounded-md bg-gray-50 px-3 py-2"
                                    >
                                        <div className="min-w-0 pr-3">
                                            <p className="truncate text-sm font-semibold text-gray-800">
                                                {entry.item}
                                            </p>
                                            <p className="truncate text-sm text-gray-500">
                                                {entry.borrower} · {entry.lab}
                                            </p>
                                            <p className="mt-0.5 text-[11px] text-gray-400">
                                                {entry.typeLabel}
                                            </p>
                                        </div>
                                        <span className="shrink-0 pl-2 text-sm text-gray-500">
                                            {formatRelativeTime(entry.time)}
                                        </span>
                                    </li>
                                ))
                            )}
                        </ul>
                    </article>

                    <article className="rounded-xl bg-white p-3 shadow-sm">
                        <h3 className="flex items-center justify-center gap-2 text-lg font-medium text-gray-800">
                            Low Stock Alert
                            <AlertCircle className="h-5 w-5 text-gray-900" />
                        </h3>

                        <ul className="mt-2 space-y-2">
                            {lowStockItems.length === 0 ? (
                                <li className="rounded-md bg-gray-50 px-3 py-2 text-sm text-gray-500">
                                    No low stock items.
                                </li>
                            ) : (
                                lowStockItems.map((entry) => (
                                    <li
                                        key={entry.id}
                                        className="flex items-start justify-between rounded-md bg-gray-50 px-3 py-2"
                                    >
                                        <div className="min-w-0 pr-3">
                                            <p className="truncate text-sm font-semibold text-gray-800">
                                                {entry.item}
                                            </p>
                                            <p className="truncate text-sm text-gray-500">
                                                {entry.lab}
                                            </p>
                                        </div>
                                        <span className="shrink-0 pl-2 text-right text-sm font-medium text-red-500">
                                            {entry.left} Left
                                        </span>
                                    </li>
                                ))
                            )}
                        </ul>
                    </article>
                </section>

                <section className="mt-3 rounded-xl bg-white p-3 shadow-sm">
                    <div className="flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-gray-800" />
                        <h3 className="text-lg font-medium text-gray-800">
                            Laboratory Facility Status
                        </h3>
                    </div>

                    {labs.length === 0 ? (
                        <p className="mt-3 text-sm text-gray-500">
                            No laboratories configured yet.
                        </p>
                    ) : (
                        <div className="mt-3 grid grid-cols-4 gap-3">
                            {labs.map((lab) => (
                                <div
                                    key={lab.id}
                                    className="rounded-lg border border-gray-100 bg-gray-50 p-2"
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <p className="text-sm font-semibold text-gray-800">
                                            {lab.name}
                                        </p>
                                        <span
                                            className={`inline-flex whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-medium ${lab.statusTone}`}
                                        >
                                            {lab.status}
                                        </span>
                                    </div>

                                    <div className="mt-2">
                                        <div className="flex items-center justify-between text-[11px] text-gray-600">
                                            <span className="font-medium text-gray-700">
                                                Occupancy
                                            </span>
                                            <span className="font-medium text-gray-800">
                                                {lab.occupancy}%
                                            </span>
                                        </div>
                                        <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
                                            <div
                                                className="h-full rounded-full bg-blue-500"
                                                style={{
                                                    width: `${lab.occupancy}%`,
                                                }}
                                            />
                                        </div>
                                    </div>

                                    <div className="mt-2 text-[11px] text-gray-600">
                                        Items Assigned:{' '}
                                        <span className="font-semibold text-gray-800">
                                            {lab.assigned}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </LabLayout>
    );
}
