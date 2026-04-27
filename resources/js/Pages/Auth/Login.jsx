import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Log in" />

            {status && (
                <div className="mb-4 text-sm font-medium text-green-600">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-6">
                <div>
                    <InputLabel htmlFor="email" value="Email Address" className="text-slate-700 font-medium mb-1.5" />

                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full bg-slate-50 border-slate-200 focus:bg-white transition-all duration-200 rounded-xl py-3"
                        autoComplete="username"
                        isFocused={true}
                        onChange={(e) => setData('email', e.target.value)}
                        placeholder=" "
                    />

                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div>
                    <div className="flex items-center justify-between mb-1.5">
                        <InputLabel htmlFor="password" value="Password" className="text-slate-700 font-medium" />
                        {canResetPassword && (
                            <Link
                                href={route('password.request')}
                                className="text-sm font-semibold text-indigo-600 hover:text-indigo-500 transition-colors"
                            >
                                Forgot password?
                            </Link>
                        )}
                    </div>

                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full bg-slate-50 border-slate-200 focus:bg-white transition-all duration-200 rounded-xl py-3"
                        autoComplete="current-password"
                        onChange={(e) => setData('password', e.target.value)}
                        placeholder=" "
                    />

                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="flex items-center">
                    <Checkbox
                        name="remember"
                        checked={data.remember}
                        onChange={(e) =>
                            setData('remember', e.target.checked)
                        }
                        className="rounded border-slate-300 text-indigo-600 shadow-sm focus:ring-indigo-500"
                    />
                    <span className="ms-3 text-sm text-slate-600 font-medium">
                        Keep me logged in
                    </span>
                </div>

                <div className="pt-2">
                    <PrimaryButton 
                        className="w-full justify-center py-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-sm font-bold tracking-normal rounded-xl transition-all duration-200 shadow-lg shadow-indigo-200" 
                        disabled={processing}
                    >
                        Sign in
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
