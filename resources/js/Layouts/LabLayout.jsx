import React, { useEffect, useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { 
    LayoutDashboard, 
    Package, 
    ArrowLeftRight, 
    Building2, 
    FileText, 
    Wrench, 
    Users,
    GraduationCap,
    LogOut,
    UserCircle
} from 'lucide-react';
import GlobalNotifications from '@/Components/GlobalNotifications';
import GlobalChat from '@/Components/GlobalChat';

export default function LabLayout({ children, title }) {
    const { auth, systemStatus } = usePage().props;
    const user = auth.user;
    const fullyOperational = systemStatus?.fullyOperational !== false;
    const [isNavigating, setIsNavigating] = useState(false);

    const navLinks = [
        { name: 'Dashboard', href: route('dashboard'), icon: LayoutDashboard },
        { name: 'Inventory', href: route('inventory'), icon: Package },
        { name: 'Transactions', href: route('transactions'), icon: ArrowLeftRight },
        { name: 'Facilities', href: route('facilities'), icon: Building2 },
        { name: 'Reports', href: route('reports'), icon: FileText },
        { name: 'Maintenance', href: route('maintenance'), icon: Wrench },
        { name: 'Users', href: route('users'), icon: Users },
        { name: 'Departments', href: route('departments'), icon: GraduationCap },
    ];

    useEffect(() => {
        const offStart = router.on('start', () => setIsNavigating(true));
        const offFinish = router.on('finish', () => setIsNavigating(false));
        const offError = router.on('error', () => setIsNavigating(false));

        return () => {
            offStart();
            offFinish();
            offError();
        };
    }, []);

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
                        const active = window.location.pathname === new URL(link.href).pathname;

                        return (
                            <Link
                                key={link.name}
                                href={link.href}
                                prefetch
                                cacheFor="5m"
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
                    <Link
                        href={route('profile.show')}
                        prefetch
                        cacheFor="2m"
                        className="flex items-center gap-3 px-3 py-3 rounded-xl bg-black/10 mb-4 hover:bg-black/20 transition-colors group cursor-pointer border border-transparent hover:border-white/10 shadow-sm"
                    >
                        <div className="h-9 w-9 rounded-full bg-[#4663ac] flex items-center justify-center border border-white/20 shadow-inner group-hover:scale-105 transition-transform">
                            <UserCircle className="h-6 w-6 text-blue-100" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-bold truncate">{user.name}</p>
                            <p className="text-[11px] text-blue-200 truncate opacity-80 uppercase tracking-tighter">Administrator</p>
                        </div>
                    </Link>
                    
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
                {isNavigating && (
                    <div className="absolute inset-x-0 top-0 z-20 h-0.5 overflow-hidden">
                        <div className="h-full w-1/3 animate-pulse rounded bg-[#4663ac]" />
                    </div>
                )}
                {/* Top Header / Bar */}
                <header className="h-16 shrink-0 bg-white/80 backdrop-blur-md border-b border-gray-200 flex items-center justify-end px-8 z-10">
                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex flex-col items-end mr-2">
                            <span className="text-[12px] font-bold text-gray-800 leading-none">System Status</span>
                            <span
                                className={`text-[10px] font-bold flex items-center gap-1 ${
                                    fullyOperational ? 'text-green-600' : 'text-red-600'
                                }`}
                            >
                                <span
                                    className={`h-1.5 w-1.5 rounded-full ${
                                        fullyOperational ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                                    }`}
                                />
                                {fullyOperational ? 'Fully Operational' : 'Critical issues open'}
                            </span>
                        </div>
                        
                        {/* Global Notifications Wrapper */}
                        <div className="border-l border-gray-200 pl-4">
                            <GlobalNotifications />
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main
                    className={`flex-1 overflow-auto bg-[#f8fafc]/50 p-0 shadow-inner transition-opacity duration-150 ${
                        isNavigating ? 'opacity-90' : 'opacity-100'
                    }`}
                >
                    {children}
                </main>

                {/* Global Chat Overlay */}
                <GlobalChat />
            </div>
        </div>
    );
}
