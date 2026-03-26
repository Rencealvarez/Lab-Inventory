import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { 
    LayoutDashboard, 
    Package, 
    ArrowLeftRight, 
    Building2, 
    FileText, 
    Wrench, 
    Users,
    LogOut,
    UserCircle
} from 'lucide-react';
import GlobalNotifications from '@/Components/GlobalNotifications';
import GlobalChat from '@/Components/GlobalChat';

export default function LabLayout({ children, title }) {
    const { auth } = usePage().props;
    const user = auth.user;

    const navLinks = [
        { name: 'Dashboard', href: route('dashboard'), icon: LayoutDashboard },
        { name: 'Inventory', href: route('inventory'), icon: Package },
        { name: 'Transactions', href: route('transactions'), icon: ArrowLeftRight },
        { name: 'Facilities', href: route('facilities'), icon: Building2 },
        { name: 'Reports', href: route('reports'), icon: FileText },
        { name: 'Maintenance', href: route('maintenance'), icon: Wrench },
        { name: 'Users', href: route('users'), icon: Users },
    ];

    return (
        <div className="flex h-screen w-full bg-[#f4f7fb] text-sm overflow-hidden text-gray-700 font-sans">
            <Head title={title} />
            
            {/* Sidebar */}
            <aside className="h-full w-[260px] flex-shrink-0 bg-[#3f59a3] px-5 py-6 text-white shadow-lg flex flex-col overflow-hidden">
                <div className="flex items-center gap-3 mb-8 px-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/20">
                        <Building2 className="h-5 w-5 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight">Lab System</h1>
                </div>
                
                <nav className="flex-1 flex flex-col gap-2 overflow-y-auto custom-scrollbar">
                    {navLinks.map((link) => {
                        const Icon = link.icon;
                        const isActive = route().current(link.href.split('/').pop()) || (link.name === 'Maintenance' && route().current('maintenance'));
                        // Actually let's use a simpler current route check
                        const active = window.location.pathname === new URL(link.href).pathname;

                        return (
                            <Link
                                key={link.name}
                                href={link.href}
                                className={`flex items-center gap-3 space-x-3 rounded-xl px-4 py-3 transition-all duration-200 group ${
                                    active 
                                    ? 'bg-white text-[#3f59a3] font-bold shadow-md' 
                                    : 'text-blue-100 hover:bg-white/10 hover:text-white'
                                }`}
                            >
                                <Icon className={`h-5 w-5 transition-transform duration-200 group-hover:scale-110 ${active ? 'text-[#3f59a3]' : 'text-blue-200'}`} />
                                <span className="text-[14px]">{link.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="mt-auto pt-6 border-t border-white/10">
                    <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-black/10 mb-4">
                        <div className="h-9 w-9 rounded-full bg-[#4663ac] flex items-center justify-center border border-white/20 shadow-inner">
                            <UserCircle className="h-6 w-6 text-blue-100" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-bold truncate">{user.name}</p>
                            <p className="text-[11px] text-blue-200 truncate opacity-80 uppercase tracking-tighter">Administrator</p>
                        </div>
                    </div>
                    
                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-blue-100 transition-all hover:bg-red-500/20 hover:text-red-100 group"
                    >
                        <LogOut className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
                        <span className="text-[14px] font-medium">Log out</span>
                    </Link>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-full overflow-hidden relative">
                {/* Top Header / Bar */}
                <header className="h-16 shrink-0 bg-white/80 backdrop-blur-md border-b border-gray-200 flex items-center justify-between px-8 z-10">
                    <div className="flex items-center gap-2">
                        <span className="text-gray-400 font-medium">Pages</span>
                        <span className="text-gray-400">/</span>
                        <span className="text-gray-800 font-bold">{title}</span>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex flex-col items-end mr-2">
                            <span className="text-[12px] font-bold text-gray-800 leading-none">System Status</span>
                            <span className="text-[10px] text-green-500 font-bold flex items-center gap-1">
                                <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                Fully Operational
                            </span>
                        </div>
                        
                        {/* Global Notifications Wrapper */}
                        <div className="border-l border-gray-200 pl-4">
                            <GlobalNotifications />
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-auto bg-[#f8fafc]/50 p-0 shadow-inner">
                    {children}
                </main>

                {/* Global Chat Overlay */}
                <GlobalChat />
            </div>
        </div>
    );
}
