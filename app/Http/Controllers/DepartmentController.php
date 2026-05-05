<?php

namespace App\Http\Controllers;

use App\Models\Department;
use Illuminate\Database\Query\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class DepartmentController extends Controller
{
    public function index(): Response
    {
        $departments = Department::query()
            ->withCount('laboratories')
            ->selectSub(
                fn (Builder $query) => $query
                    ->from('users')
                    ->selectRaw('COUNT(DISTINCT users.id)')
                    ->where(function (Builder $userQuery) {
                        $userQuery
                            ->whereColumn('users.department_id', 'departments.id')
                            ->orWhere(function (Builder $legacyQuery) {
                                $legacyQuery
                                    ->whereNull('users.department_id')
                                    ->whereRaw(
                                        'LOWER(TRIM(users.department)) IN (LOWER(TRIM(departments.name)), LOWER(TRIM(departments.code)))'
                                    );
                            });
                    }),
                'users_count'
            )
            ->orderBy('name')
            ->get()
            ->map(fn (Department $department) => [
                'id' => $department->id,
                'name' => $department->name,
                'code' => $department->code,
                'description' => $department->description,
                'users_count' => (int) $department->users_count,
                'laboratories_count' => (int) $department->laboratories_count,
            ])
            ->values()
            ->all();

        return Inertia::render('Departments', [
            'departments' => $departments,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:120', 'unique:departments,name'],
            'code' => ['required', 'string', 'max:30', 'unique:departments,code'],
            'description' => ['nullable', 'string', 'max:1000'],
        ]);

        Department::create($validated);

        return redirect()->back()->with('success', 'Department created successfully.');
    }

    public function update(Request $request, Department $department): RedirectResponse
    {
        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:120',
                Rule::unique('departments', 'name')->ignore($department->id),
            ],
            'code' => [
                'required',
                'string',
                'max:30',
                Rule::unique('departments', 'code')->ignore($department->id),
            ],
            'description' => ['nullable', 'string', 'max:1000'],
        ]);

        $department->update($validated);

        return redirect()->back()->with('success', 'Department updated successfully.');
    }

    public function destroy(Department $department): RedirectResponse
    {
        if ($department->users()->exists()) {
            return redirect()->back()->with('error', 'Cannot delete a department with assigned users.');
        }

        if ($department->laboratories()->exists()) {
            return redirect()->back()->with('error', 'Cannot delete a department with assigned facilities.');
        }

        $department->delete();

        return redirect()->back()->with('success', 'Department removed successfully.');
    }
}
