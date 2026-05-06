<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RestrictStaffRoutes
{
    /**
     * Path prefixes staff may not access (view hidden sidebar targets).
     */
    private const RESTRICTED_PREFIXES = [
        'inventory',
        'facilities',
        'reports',
        'users',
        'departments',
    ];

    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user || ! $user->isStaff()) {
            return $next($request);
        }

        $path = trim($request->path(), '/');

        if ($path === 'dashboard' || str_starts_with($path, 'dashboard/')) {
            return redirect()->route('transactions');
        }

        foreach (self::RESTRICTED_PREFIXES as $prefix) {
            if ($path === $prefix || str_starts_with($path, $prefix.'/')) {
                abort(403);
            }
        }

        return $next($request);
    }
}
