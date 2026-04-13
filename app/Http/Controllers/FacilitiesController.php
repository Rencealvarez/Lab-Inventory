<?php

namespace App\Http\Controllers;

use App\Models\Laboratory;
use App\Models\Transaction;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class FacilitiesController extends Controller
{
    public function index(): Response
    {
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
            ->map(function (Laboratory $lab) use ($occupancyByLaboratory) {
                $currentOccupancy = (int) ($occupancyByLaboratory[$lab->id] ?? 0);
                $maxCapacity = $lab->capacity !== null ? (int) $lab->capacity : 0;

                $primaryLocation = $lab->locations->sortBy('id')->first();
                $floorLabel = $primaryLocation?->floor
                    ?? $primaryLocation?->room_number
                    ?? '—';

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
                    'is_available_for_booking' => $lab->status === Laboratory::STATUS_ACTIVE,
                    'description' => $lab->description ?? '',
                ];
            })
            ->values()
            ->all();

        return Inertia::render('Facilities', [
            'facilities' => $facilities,
        ]);
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
