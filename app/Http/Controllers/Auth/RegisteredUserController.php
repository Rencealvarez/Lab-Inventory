<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $rules = [
            'email' => 'required|string|lowercase|email|max:255|unique:' . User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ];

        $hasUsernameColumn = Schema::hasColumn('users', 'username');

        if ($hasUsernameColumn) {
            $rules['username'] = 'required|string|max:100';
            $rules['name'] = 'nullable|string|max:255';
        } else {
            // Legacy fallback for DBs that still only have `name`.
            $rules['name'] = 'required|string|max:255';
            $rules['username'] = 'nullable|string|max:100';
        }

        $request->validate($rules);

        $identity = $request->input('username') ?? $request->input('name');

        $data = [
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ];

        if (Schema::hasColumn('users', 'username')) {
            $data['username'] = $identity;
        }

        if (Schema::hasColumn('users', 'name')) {
            $data['name'] = $identity;
        }

        $user = User::create($data);

        event(new Registered($user));

        Auth::login($user);

        return redirect(route('dashboard', absolute: false));
    }
}
