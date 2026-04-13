<?php

namespace App\Http\Controllers;

use App\Models\Department;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function index(): Response
    {
        $users = User::query()
            ->with(['department:id,name'])
            ->orderByRaw('COALESCE(name, username, email)')
            ->get()
            ->map(fn (User $user) => [
                'id' => $user->id,
                'id_number' => $user->id_number,
                'name' => $user->displayName(),
                'email' => $user->email,
                'username' => $user->username,
                'role' => $user->role,
                'status' => $user->status ?? 'active',
                'department' => $user->department?->name ?? '—',
                'department_id' => $user->department_id,
            ])
            ->values()
            ->all();

        $departments = Department::query()
            ->orderBy('name')
            ->get(['id', 'name'])
            ->values()
            ->all();

        return Inertia::render('Users', [
            'users' => $users,
            'departments' => $departments,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'first_name' => ['required', 'string', 'max:120'],
            'last_name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:150', 'unique:users,email'],
            'username' => ['required', 'string', 'max:100', 'unique:users,username'],
            'id_number' => ['required', 'string', 'max:40', 'unique:users,id_number'],
            'role' => ['required', 'string', Rule::in(User::roles())],
            'department_id' => ['nullable', 'integer', 'exists:departments,id'],
            'status' => ['required', 'string', Rule::in(User::statuses())],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        User::create([
            'name' => trim($validated['first_name'].' '.$validated['last_name']),
            'email' => $validated['email'],
            'username' => $validated['username'],
            'id_number' => $validated['id_number'],
            'role' => $validated['role'],
            'department_id' => $validated['department_id'] ?? null,
            'status' => $validated['status'],
            'password' => Hash::make($validated['password']),
        ]);

        return redirect()->back()->with('success', 'User created successfully.');
    }

    public function update(Request $request, User $user): RedirectResponse
    {
        $validated = $request->validate([
            'first_name' => ['required', 'string', 'max:120'],
            'last_name' => ['required', 'string', 'max:120'],
            'email' => [
                'required',
                'string',
                'lowercase',
                'email',
                'max:150',
                Rule::unique('users', 'email')->ignore($user->id),
            ],
            'username' => [
                'required',
                'string',
                'max:100',
                Rule::unique('users', 'username')->ignore($user->id),
            ],
            'id_number' => [
                'required',
                'string',
                'max:40',
                Rule::unique('users', 'id_number')->ignore($user->id),
            ],
            'role' => ['required', 'string', Rule::in(User::roles())],
            'department_id' => ['nullable', 'integer', 'exists:departments,id'],
            'status' => ['required', 'string', Rule::in(User::statuses())],
            'password' => ['nullable', 'string', 'min:8', 'confirmed'],
        ]);

        $payload = [
            'name' => trim($validated['first_name'].' '.$validated['last_name']),
            'email' => $validated['email'],
            'username' => $validated['username'],
            'id_number' => $validated['id_number'],
            'role' => $validated['role'],
            'department_id' => $validated['department_id'] ?? null,
            'status' => $validated['status'],
        ];

        if (! empty($validated['password'])) {
            $payload['password'] = Hash::make($validated['password']);
        }

        $user->update($payload);

        return redirect()->back()->with('success', 'User updated successfully.');
    }

    public function destroy(Request $request, User $user): RedirectResponse
    {
        if ($request->user()->id === $user->id) {
            return redirect()->back()->with('error', 'You cannot delete your own account.');
        }

        $user->delete();

        return redirect()->back()->with('success', 'User removed successfully.');
    }
}
