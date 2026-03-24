import { Head } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowLeftRight,
    Clock3,
    Package,
    User,
    AlertCircle,
    Building2,
} from 'lucide-react';

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

export default function Dashboard({ stats, lowStock, recentActivity }) {
    const summary = stats ?? {};
    const lowStockItems = lowStock ?? [];
    const recentItems = recentActivity ?? [];

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

    const labStatus = [
        {
            name: 'Physics',
            status: 'Active',
            statusTone: 'bg-green-100 text-green-700 border-green-200',
            occupancy: 65,
            assigned: 18,
        },
        {
            name: 'Chemistry',
            status: 'Maintenance',
            statusTone: 'bg-orange-100 text-orange-700 border-orange-200',
            occupancy: 42,
            assigned: 12,
        },
        {
            name: 'Biology',
            status: 'Active',
            statusTone: 'bg-green-100 text-green-700 border-green-200',
            occupancy: 58,
            assigned: 9,
        },
        {
            name: 'IT',
            status: 'Active',
            statusTone: 'bg-green-100 text-green-700 border-green-200',
            occupancy: 71,
            assigned: 24,
        },
    ];

    const navLinks = [
        'Dashboard',
        'Inventory',
        'Transactions',
        'Facilities',
        'Reports',
        'Maintenance',
        'Users',
    ];

    return (
        <>
            <Head title="Dashboard" />
            <div className="h-screen overflow-hidden bg-[#f8fafc]">
                <div className="flex h-full">
                    <aside className="h-full w-[260px] flex-shrink-0 bg-[#3f59a3] px-5 py-6 text-white shadow-lg overflow-hidden">
                        <h1 className="mb-6 text-3xl font-semibold leading-none">
                            Lab System
                        </h1>
                        <nav className="flex flex-col gap-4 text-base font-medium">
                            {navLinks.map((link) => (
                                <a
                                    key={link}
                                    href="#"
                                    className="rounded-md px-2 py-1 transition-colors hover:bg-white/10 hover:text-blue-100"
                                >
                                    {link}
                                </a>
                            ))}
                        </nav>
                    </aside>

                    <main className="flex-1 h-full overflow-hidden flex flex-col">
                        <header className="shrink-0 border-b border-gray-200 bg-[#e6eff8] px-4 py-2 shadow-sm">
                            <h2 className="text-2xl font-medium text-gray-800">
                                Welcome Admin
                            </h2>
                        </header>

                        <div className="flex-1 overflow-y-auto p-4">
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
                                        {recentItems.map((entry) => (
                                            <li
                                                key={`${entry.item}-${entry.time}`}
                                                className="flex items-start justify-between rounded-md bg-gray-50 px-3 py-2"
                                            >
                                                <div className="min-w-0 pr-3">
                                                    <p className="truncate text-sm font-semibold text-gray-800">
                                                        {entry.item}
                                                    </p>
                                                    <p className="truncate text-sm text-gray-500">
                                                        {entry.borrower} - {entry.lab}
                                                    </p>
                                                </div>
                                                <span className="shrink-0 pl-2 text-sm text-gray-500">
                                                    {formatRelativeTime(entry.time)}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </article>

                                <article className="rounded-xl bg-white p-3 shadow-sm">
                                    <h3 className="flex items-center justify-center gap-2 text-lg font-medium text-gray-800">
                                        Low Stock Alert
                                        <AlertCircle className="h-5 w-5 text-gray-900" />
                                    </h3>

                                    <ul className="mt-2 space-y-2">
                                        {lowStockItems.map((entry) => (
                                            <li
                                                key={entry.item}
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
                                        ))}
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

                                <div className="mt-3 grid grid-cols-4 gap-3">
                                    {labStatus.map((lab) => (
                                        <div
                                            key={lab.name}
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
                            </section>
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
}