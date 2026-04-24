<?php

namespace App\Http\Middleware;

use App\Models\IncidentReport;
use Illuminate\Http\Request;
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
        $criticalUnresolved = $request->user()
            && IncidentReport::query()
                ->where('severity', IncidentReport::SEVERITY_CRITICAL)
                ->whereNotIn('status', [
                    IncidentReport::STATUS_RESOLVED,
                    IncidentReport::STATUS_CLOSED,
                ])
                ->exists();

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),
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
