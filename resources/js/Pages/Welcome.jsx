import { Link, Head } from '@inertiajs/react';

export default function Welcome({ auth }) {
    return (
        <>
            <Head title="Welcome" />
            <div className="relative min-h-screen bg-gray-100 flex flex-col items-center justify-center">
                <div className="text-center">
                    <h1 className="text-5xl font-bold text-gray-900 mb-4">Lab Inventory System</h1>
                    <p className="text-lg text-gray-600 mb-8">Manage laboratory equipment and supplies with ease.</p>
                    
                    <div className="space-x-4">
                        {auth.user ? (
                            <Link href={route('dashboard')} className="px-6 py-3 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700">
                                Go to Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link href={route('login')} className="px-6 py-3 bg-gray-800 text-white rounded-md font-semibold hover:bg-gray-900">
                                    Log in
                                </Link>
                                <Link href={route('register')} className="px-6 py-3 bg-white text-gray-800 border border-gray-300 rounded-md font-semibold hover:bg-gray-50">
                                    Register
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}