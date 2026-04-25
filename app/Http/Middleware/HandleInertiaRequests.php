<?php

namespace App\Http\Middleware;

use App\Models\IncidentReport;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }
    
    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $criticalUnresolved = false;
        if ($request->user()) {
            $criticalUnresolved = Cache::remember(
                'inertia:system-status:critical-unresolved',
                now()->addSeconds(20),
                fn () => IncidentReport::query()
                    ->where('severity', IncidentReport::SEVERITY_CRITICAL)
                    ->whereNotIn('status', [
                        IncidentReport::STATUS_RESOLVED,
                        IncidentReport::STATUS_CLOSED,
                    ])
                    ->exists()
            );
        }

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user()
                    ? $request->user()->only(['id', 'name', 'username', 'email', 'role', 'status'])
                    : null,
            ],
            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
            ],
            'systemStatus' => [
                'fullyOperational' => ! $criticalUnresolved,
            ],
        ];
    }
}
