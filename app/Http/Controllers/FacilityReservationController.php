<?php

namespace App\Http\Controllers;

use App\Models\FacilityReservation;
use App\Models\Laboratory;
use App\Models\User;
use App\Notifications\FacilityReservationRequestNotification;
use App\Notifications\FacilityReservationReviewedNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\ValidationException;

class FacilityReservationController extends Controller
{
    public function store(Request $request): RedirectResponse|JsonResponse
    {
        if (! $request->user()?->isStaff()) {
            abort(403);
        }

        if (! Schema::hasTable('facility_reservations')) {
            throw ValidationException::withMessages([
                'facility' => 'Facility reservations are not ready yet. Ask an admin to run database migrations.',
            ]);
        }

        $validated = $request->validate([
            'laboratory_id' => ['required', 'integer', 'exists:laboratories,id'],
            'start_at' => ['required', 'date'],
            'end_at' => ['required', 'date', 'after:start_at'],
            'purpose' => ['nullable', 'string', 'max:2000'],
        ]);

        /** @var Laboratory $lab */
        $lab = Laboratory::query()->findOrFail((int) $validated['laboratory_id']);

        if ($lab->status !== Laboratory::STATUS_ACTIVE) {
            throw ValidationException::withMessages([
                'laboratory_id' => 'This facility is not available for booking.',
            ]);
        }

        $start = \Carbon\Carbon::parse($validated['start_at']);
        $end = \Carbon\Carbon::parse($validated['end_at']);

        $overlapExists = FacilityReservation::query()
            ->where('laboratory_id', $lab->id)
            ->whereIn('status', [
                FacilityReservation::STATUS_PENDING,
                FacilityReservation::STATUS_APPROVED,
            ])
            ->where('start_at', '<', $end)
            ->where('end_at', '>', $start)
            ->exists();

        if ($overlapExists) {
            throw ValidationException::withMessages([
                'start_at' => 'That time range overlaps an existing reservation for this facility.',
            ]);
        }

        $reservation = FacilityReservation::create([
            'laboratory_id' => $lab->id,
            'requested_by' => $request->user()->id,
            'status' => FacilityReservation::STATUS_PENDING,
            'start_at' => $start,
            'end_at' => $end,
            'purpose' => $validated['purpose'] ?? null,
        ]);

        $reservation->loadMissing([
            'laboratory:id,name,department_id',
            'laboratory.department:id,name',
            'requester:id,name,username,email',
        ]);

        $this->notifyAdmins(new FacilityReservationRequestNotification($reservation));

        if ($request->expectsJson()) {
            return response()->json([
                'message' => 'Facility reservation submitted. An administrator will review it.',
                'facilityReservation' => $this->mapForStaff($reservation),
            ]);
        }

        return redirect()->back()->with('success', 'Facility reservation submitted. An administrator will review it.');
    }

    public function approve(Request $request, FacilityReservation $facilityReservation): RedirectResponse
    {
        if ($request->user()?->isStaff()) {
            abort(403);
        }

        if (! Schema::hasTable('facility_reservations')) {
            return redirect()->back()->with('error', 'Facility reservations table is missing. Run migrations.');
        }

        if ($facilityReservation->status !== FacilityReservation::STATUS_PENDING) {
            return redirect()->back()->with('error', 'This reservation was already reviewed.');
        }

        $start = $facilityReservation->start_at;
        $end = $facilityReservation->end_at;

        $overlapExists = FacilityReservation::query()
            ->where('laboratory_id', $facilityReservation->laboratory_id)
            ->where('id', '!=', $facilityReservation->id)
            ->whereIn('status', [
                FacilityReservation::STATUS_PENDING,
                FacilityReservation::STATUS_APPROVED,
            ])
            ->where('start_at', '<', $end)
            ->where('end_at', '>', $start)
            ->exists();

        if ($overlapExists) {
            return redirect()->back()->with(
                'error',
                'Another approved reservation already covers part of this time range.',
            );
        }

        try {
            DB::transaction(function () use ($facilityReservation, $request): void {
                $locked = FacilityReservation::query()->lockForUpdate()->findOrFail($facilityReservation->id);
                if ($locked->status !== FacilityReservation::STATUS_PENDING) {
                    throw ValidationException::withMessages([
                        'reservation' => 'This reservation was already reviewed.',
                    ]);
                }

                $locked->update([
                    'status' => FacilityReservation::STATUS_APPROVED,
                    'reviewed_by' => $request->user()->id,
                    'reviewed_at' => now(),
                    'rejection_reason' => null,
                ]);
            });
        } catch (ValidationException $e) {
            return redirect()->back()->with(
                'error',
                collect($e->errors())->flatten()->first() ?? 'Unable to approve reservation.',
            );
        }

        $facilityReservation->refresh()->loadMissing([
            'laboratory:id,name',
            'laboratory.department:id,name',
            'requester:id,name,username,email',
        ]);

        if ($facilityReservation->requester) {
            $facilityReservation->requester->notify(
                new FacilityReservationReviewedNotification($facilityReservation, true)
            );
        }

        return redirect()->back()->with('success', 'Facility reservation approved.');
    }

    public function reject(Request $request, FacilityReservation $facilityReservation): RedirectResponse
    {
        if ($request->user()?->isStaff()) {
            abort(403);
        }

        if (! Schema::hasTable('facility_reservations')) {
            return redirect()->back()->with('error', 'Facility reservations table is missing. Run migrations.');
        }

        if ($facilityReservation->status !== FacilityReservation::STATUS_PENDING) {
            return redirect()->back()->with('error', 'This reservation was already reviewed.');
        }

        $validated = $request->validate([
            'reason' => ['required', 'string', 'max:500'],
        ]);

        $facilityReservation->update([
            'status' => FacilityReservation::STATUS_REJECTED,
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
            'rejection_reason' => $validated['reason'],
        ]);

        $facilityReservation->refresh()->loadMissing([
            'laboratory:id,name',
            'laboratory.department:id,name',
            'requester:id,name,username,email',
        ]);

        if ($facilityReservation->requester) {
            $facilityReservation->requester->notify(
                new FacilityReservationReviewedNotification($facilityReservation, false)
            );
        }

        return redirect()->back()->with('success', 'Facility reservation rejected.');
    }

    /**
     * @return array<string, mixed>
     */
    public function mapForStaff(FacilityReservation $r): array
    {
        $lab = $r->laboratory;
        $deptName = $lab?->department?->name ?? '—';

        return [
            'id' => $r->id,
            'displayId' => 'FRQ-'.str_pad((string) $r->id, 3, '0', STR_PAD_LEFT),
            'facilityName' => $lab?->name ?? '—',
            'facilityBuilding' => $deptName,
            'requester' => $r->requester?->displayName() ?? '—',
            'startAt' => $r->start_at?->format('Y-m-d H:i') ?? '—',
            'endAt' => $r->end_at?->format('Y-m-d H:i') ?? '—',
            'startAtDate' => $r->start_at?->format('Y-m-d') ?? '—',
            'endAtDate' => $r->end_at?->format('Y-m-d') ?? '—',
            'purpose' => $r->purpose ?? '—',
            'status' => ucfirst((string) $r->status),
            'rejectionReason' => $r->rejection_reason,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function mapForAdmin(FacilityReservation $r): array
    {
        $mapped = $this->mapForStaff($r);
        $mapped['canApprove'] = $r->status === FacilityReservation::STATUS_PENDING;
        $mapped['canReject'] = $r->status === FacilityReservation::STATUS_PENDING;

        return $mapped;
    }

    /**
     * Approved bookings shown on the Facilities schedule (end time not yet passed).
     *
     * @return array<string, mixed>
     */
    public function mapForApprovedSchedule(FacilityReservation $r): array
    {
        $row = $this->mapForStaff($r);
        $now = now();
        $row['isActiveNow'] = $r->start_at && $r->end_at
            && $r->start_at->lte($now) && $r->end_at->gt($now);

        return $row;
    }

    private function notifyAdmins(FacilityReservationRequestNotification $notification): void
    {
        app()->terminating(function () use ($notification): void {
            User::query()
                ->where('status', User::STATUS_ACTIVE)
                ->where('role', User::ROLE_ADMIN)
                ->each(fn (User $admin) => $admin->notify($notification));
        });
    }
}
