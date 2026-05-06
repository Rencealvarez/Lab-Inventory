<?php

namespace App\Http\Controllers;

use App\Models\Department;
use App\Models\FacilityReservation;
use App\Models\Laboratory;
use App\Models\Location;
use App\Models\Transaction;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class FacilitiesController extends Controller
{
    public function index(): Response
    {
        $hasReservationTable = Schema::hasTable('facility_reservations');

        $reservedLaboratoryIds = [];
        if ($hasReservationTable) {
            $reservedLaboratoryIds = FacilityReservation::query()
                ->where('status', FacilityReservation::STATUS_APPROVED)
                ->where('start_at', '<=', now())
                ->where('end_at', '>', now())
                ->pluck('laboratory_id')
                ->unique()
                ->all();
        }

        $occupancyByLaboratory = DB::table('transactions')
            ->join('items', 'transactions.item_id', '=', 'items.id')
            ->join('locations', 'items.location_id', '=', 'locations.id')
            ->where('transactions.transaction_type', Transaction::TYPE_BORROW)
            ->whereIn('transactions.status', [
                Transaction::STATUS_ISSUED,
                Transaction::STATUS_ACTIVE,
            ])
            ->whereNull('items.deleted_at')
            ->select('locations.laboratory_id', DB::raw('count(*) as cnt'))
            ->groupBy('locations.laboratory_id')
            ->pluck('cnt', 'laboratory_id');

        $facilities = Laboratory::query()
            ->select([
                'id',
                'name',
                'code',
                'description',
                'status',
                'capacity',
                'department_id',
            ])
            ->with([
                'department:id,name',
                'locations:id,laboratory_id,floor,room_number,name',
            ])
            ->orderBy('name')
            ->withCount(['items as total_items'])
            ->get()
            ->map(function (Laboratory $lab) use ($occupancyByLaboratory, $reservedLaboratoryIds) {
                $currentOccupancy = (int) ($occupancyByLaboratory[$lab->id] ?? 0);
                $maxCapacity = $lab->capacity !== null ? (int) $lab->capacity : 0;

                $primaryLocation = $lab->locations->sortBy('id')->first();
                $floorLabel = $primaryLocation?->floor
                    ?? $primaryLocation?->room_number
                    ?? '—';

                $isActiveLab = $lab->status === Laboratory::STATUS_ACTIVE;

                return [
                    'id' => $lab->id,
                    'lab_name' => $lab->name,
                    'code' => $lab->code,
                    'building_name' => $lab->department?->name ?? '—',
                    'floor_level' => $floorLabel,
                    'manager_id' => '—',
                    'opening_hours' => '—',
                    'status' => $this->displayLaboratoryStatus($lab->status),
                    'status_raw' => $lab->status,
                    'current_occupancy' => $currentOccupancy,
                    'max_capacity' => $maxCapacity,
                    'total_items' => (int) $lab->total_items,
                    'is_available_for_booking' => $isActiveLab,
                    'is_reserved_now' => $isActiveLab && in_array($lab->id, $reservedLaboratoryIds, true),
                    'description' => $lab->description ?? '',
                ];
            })
            ->values()
            ->all();

        $pendingFacilityReservations = [];
        $approvedFacilityReservations = [];

        if (request()->user() && ! request()->user()->isStaff() && $hasReservationTable) {
            $mapper = app(FacilityReservationController::class);

            $pendingFacilityReservations = FacilityReservation::query()
                ->with(['laboratory.department:id,name', 'requester:id,name,username,email'])
                ->where('status', FacilityReservation::STATUS_PENDING)
                ->orderBy('start_at')
                ->limit(100)
                ->get()
                ->map(fn (FacilityReservation $r) => $mapper->mapForAdmin($r))
                ->values()
                ->all();

            $approvedFacilityReservations = FacilityReservation::query()
                ->with(['laboratory.department:id,name', 'requester:id,name,username,email'])
                ->where('status', FacilityReservation::STATUS_APPROVED)
                ->where('end_at', '>', now())
                ->orderBy('start_at')
                ->limit(200)
                ->get()
                ->map(fn (FacilityReservation $r) => $mapper->mapForApprovedSchedule($r))
                ->values()
                ->all();
        }

        $departments = Department::query()
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(fn (Department $d) => [
                'id' => $d->id,
                'name' => $d->name,
            ])
            ->values()
            ->all();

        return Inertia::render('Facilities', [
            'facilities' => $facilities,
            'pendingFacilityReservations' => $pendingFacilityReservations,
            'approvedFacilityReservations' => $approvedFacilityReservations,
            'canReviewFacilityReservations' => request()->user() && ! request()->user()->isStaff(),
            'departments' => $departments,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        if ($request->user()?->isStaff()) {
            abort(403);
        }

        $capacityIn = $request->input('capacity');
        $capacityNormalized = ($capacityIn === null || $capacityIn === '')
            ? null
            : (int) $capacityIn;
        $opensIn = $request->input('operating_opens_at');
        $closesIn = $request->input('operating_closes_at');
        $request->merge([
            'capacity' => $capacityNormalized,
            'operating_opens_at' => ($opensIn === null || $opensIn === '') ? null : $opensIn,
            'operating_closes_at' => ($closesIn === null || $closesIn === '') ? null : $closesIn,
        ]);

        $validated = $request->validate([
            'department_id' => ['required', 'integer', Rule::exists('departments', 'id')],
            'name' => ['required', 'string', 'max:150'],
            'description' => ['nullable', 'string', 'max:5000'],
            'floor' => ['nullable', 'string', 'max:30'],
            'room_number' => ['nullable', 'string', 'max:50'],
            'capacity' => ['nullable', 'integer', 'min:0', 'max:999999'],
            'ui_status' => ['required', 'string', Rule::in(['Active', 'Maintenance', 'Closed'])],
            'available_for_booking' => ['required', 'boolean'],
            'operating_opens_at' => ['nullable', 'date_format:H:i'],
            'operating_closes_at' => ['nullable', 'date_format:H:i'],
        ]);

        $opens = $validated['operating_opens_at'] ?? null;
        $closes = $validated['operating_closes_at'] ?? null;
        if (($opens && ! $closes) || (! $opens && $closes)) {
            throw ValidationException::withMessages([
                'operating_opens_at' => 'Provide both opening and closing times, or leave both empty.',
            ]);
        }

        $statusFromUi = match ($validated['ui_status']) {
            'Active' => Laboratory::STATUS_ACTIVE,
            'Maintenance' => Laboratory::STATUS_MAINTENANCE,
            'Closed' => Laboratory::STATUS_INACTIVE,
            default => Laboratory::STATUS_ACTIVE,
        };

        $status = $validated['available_for_booking'] ? $statusFromUi : Laboratory::STATUS_INACTIVE;

        $description = trim((string) ($validated['description'] ?? ''));
        if ($opens && $closes) {
            $hoursLine = 'Operating hours: '.$opens.' – '.$closes;
            $description .= ($description !== '' ? "\n\n" : '').$hoursLine;
        }

        DB::transaction(function () use ($validated, $status, $description): void {
            $capacity = $validated['capacity'] ?? null;

            $lab = Laboratory::create([
                'department_id' => (int) $validated['department_id'],
                'name' => $validated['name'],
                'code' => $this->uniqueLaboratoryCode($validated['name']),
                'description' => $description !== '' ? $description : null,
                'status' => $status,
                'capacity' => $capacity,
            ]);

            $floor = $validated['floor'] ?? null;
            $floor = is_string($floor) && trim($floor) === '' ? null : $floor;
            $roomNumber = $validated['room_number'] ?? null;
            $roomNumber = is_string($roomNumber) && trim($roomNumber) === '' ? null : $roomNumber;

            Location::create([
                'laboratory_id' => $lab->id,
                'name' => $validated['name'],
                'room_number' => $roomNumber !== null ? (string) $roomNumber : null,
                'floor' => $floor !== null ? (string) $floor : null,
                'description' => null,
            ]);
        });

        return redirect()->route('facilities')->with('success', 'Facility created successfully.');
    }

    private function uniqueLaboratoryCode(string $name): string
    {
        $compressed = strtoupper(preg_replace('/[^A-Z0-9]+/i', '', $name));
        $base = $compressed !== '' ? Str::substr($compressed, 0, 8) : 'LAB';

        for ($i = 0; $i < 200; $i++) {
            $candidate = $i === 0 ? $base : $base.'-'.$i;
            if (strlen($candidate) > 40) {
                $candidate = Str::substr($base, 0, 32).'-'.$i;
            }
            if (! Laboratory::query()->where('code', $candidate)->exists()) {
                return $candidate;
            }
        }

        return Str::upper(Str::substr(str_replace('-', '', (string) Str::uuid()), 0, 40));
    }

    private function displayLaboratoryStatus(?string $status): string
    {
        return match ($status) {
            Laboratory::STATUS_ACTIVE => 'Active',
            Laboratory::STATUS_MAINTENANCE => 'Maintenance',
            Laboratory::STATUS_INACTIVE => 'Closed',
            default => $status !== null && $status !== ''
                ? ucfirst($status)
                : 'Active',
        };
    }
}
