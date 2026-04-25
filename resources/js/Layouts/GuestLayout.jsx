import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    return (
        <div 
            className="flex min-h-screen flex-col items-center justify-center bg-slate-100 px-4 sm:px-0 relative overflow-hidden"
            style={{
                backgroundImage: "url('/skul.jpg')",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
            }}
        >
            {/* Overlay to ensure form readability if the background is too busy */}
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"></div>

            <div className="relative z-10 w-full sm:max-w-md overflow-hidden bg-white/95 backdrop-blur-md px-8 py-12 shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/20 rounded-[2.5rem]">
                <div className="flex flex-col items-center justify-center mb-10">
                    <Link href="/">
                        <div className="mb-6">
                            <img src="/pculogo.png" alt="PCU Logo" className="h-24 w-auto transition-transform hover:scale-110 duration-300" />
                        </div>
                    </Link>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Lab Inventory</h1>
                    <p className="mt-3 text-slate-600 text-sm font-medium">Welcome back! Please enter your details.</p>
                </div>

                <div className="w-full">
                    {children}
                </div>
            </div>
        </div>
    );
}
