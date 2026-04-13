<?php

namespace App\Http\Controllers;

use App\Models\IncidentReport;
use App\Models\Item;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class MaintenanceController extends Controller
{
    public function index(): Response
    {
        $inventoryItems = Item::query()
            ->select(['id', 'sku', 'name'])
            ->orderBy('name')
            ->get()
            ->map(fn (Item $item) => [
                'id' => $item->id,
                'sku' => $item->sku,
                'name' => $item->name,
            ])
            ->values()
            ->all();

        $incidents = IncidentReport::query()
            ->with(['item:id,sku,name', 'reporter:id,name,username,email'])
            ->latest('occurred_at')
            ->get()
            ->map(function (IncidentReport $report) {
                $reporter = $report->reporter;

                $isDone = $report->status === IncidentReport::STATUS_RESOLVED
                    || $report->status === IncidentReport::STATUS_CLOSED;

                return [
                    'id' => 'INC-'.str_pad((string) $report->id, 3, '0', STR_PAD_LEFT),
                    'numericId' => $report->id,
                    'item' => $report->item
                        ? $report->item->name.' ('.$report->item->sku.')'
                        : '—',
                    'reportedBy' => $reporter?->name
                        ?? $reporter?->username
                        ?? $reporter?->email
                        ?? '—',
                    'date' => $report->occurred_at?->format('Y-m-d') ?? '—',
                    'severity' => ucfirst((string) $report->severity),
                    'damage' => $report->damage_details ?? $report->description,
                    'cost' => $report->estimated_cost !== null
                        ? '₱'.number_format((float) $report->estimated_cost, 2)
                        : '—',
                    'action' => $isDone
                        ? 'Fixed/Repaired'
                        : $this->formatActionTakenLabel($report->action_taken),
                    'attachmentUrl' => $report->attachment_path
                        ? Storage::disk('public')->url($report->attachment_path)
                        : null,
                    'resolved' => $isDone,
                ];
            })
            ->values()
            ->all();

        return Inertia::render('Maintenance', [
            'inventoryItems' => $inventoryItems,
            'incidents' => $incidents,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $request->merge([
            'estimated_cost' => $request->filled('estimated_cost')
                && $request->input('estimated_cost') !== ''
                ? $request->input('estimated_cost')
                : null,
            'mark_resolved' => $request->boolean('mark_resolved'),
        ]);

        $validated = $request->validate([
            'item_id' => ['required', 'integer', 'exists:items,id'],
            'severity' => ['required', 'string', 'in:low,medium,high,critical'],
            'action_taken' => ['required', 'string', 'in:pending,under_repair,replaced,discarded'],
            'occurred_at' => ['required', 'date'],
            'estimated_cost' => ['nullable', 'numeric', 'min:0'],
            'damage_details' => ['required', 'string', 'max:5000'],
            'mark_resolved' => ['sometimes', 'boolean'],
            'attachment' => ['nullable', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:10240'],
        ]);

        /** @var Item $item */
        $item = Item::query()
            ->with(['location:id,laboratory_id', 'location.laboratory:id'])
            ->findOrFail($validated['item_id']);

        $laboratoryId = $item->location?->laboratory_id;
        if ($laboratoryId === null) {
            return redirect()
                ->back()
                ->withErrors(['item_id' => 'Selected item has no laboratory; assign a location first.'])
                ->withInput();
        }

        $markResolved = ! empty($validated['mark_resolved']);
        $severity = $validated['severity'];
        $actionTaken = $validated['action_taken'];

        $titleBase = 'Incident: '.$item->name;
        $title = mb_strlen($titleBase) <= 180
            ? $titleBase
            : mb_substr($titleBase, 0, 177).'...';

        $attachmentPath = null;
        if ($request->hasFile('attachment')) {
            $attachmentPath = $request->file('attachment')->store('incidents', 'public');
        }

        DB::transaction(function () use (
            $validated,
            $item,
            $laboratoryId,
            $markResolved,
            $severity,
            $actionTaken,
            $title,
            $request,
            $attachmentPath
        ): void {
            IncidentReport::create([
                'item_id' => $item->id,
                'laboratory_id' => $laboratoryId,
                'location_id' => $item->location_id,
                'reported_by' => $request->user()->id,
                'assigned_to' => null,
                'title' => $title,
                'description' => $validated['damage_details'],
                'damage_details' => $validated['damage_details'],
                'severity' => $severity,
                'status' => $markResolved
                    ? IncidentReport::STATUS_RESOLVED
                    : IncidentReport::STATUS_OPEN,
                'action_taken' => $actionTaken,
                'estimated_cost' => $validated['estimated_cost'] ?? null,
                'attachment_path' => $attachmentPath,
                'occurred_at' => $validated['occurred_at'],
                'resolved_at' => $markResolved ? now() : null,
            ]);

            $itemUpdates = [
                'item_condition' => Item::CONDITION_DAMAGED,
            ];

            if ($severity === IncidentReport::SEVERITY_CRITICAL) {
                $itemUpdates['status'] = Item::STATUS_INACTIVE;
            } else {
                // Damaged vs maintenance workflow (under repair = maintenance).
                $itemUpdates['status'] = $actionTaken === 'under_repair'
                    ? Item::STATUS_UNDER_REPAIR
                    : Item::STATUS_DAMAGED;
            }

            $item->update($itemUpdates);
        });

        Cache::forget(DashboardController::STATS_CACHE_KEY);

        return redirect()
            ->back()
            ->with('success', 'Incident report filed successfully.');
    }

    public function resolve(IncidentReport $incident): RedirectResponse
    {
        if ($incident->status === IncidentReport::STATUS_RESOLVED
            || $incident->status === IncidentReport::STATUS_CLOSED) {
            return redirect()
                ->back()
                ->with('error', 'This incident is already closed.');
        }

        DB::transaction(function () use ($incident): void {
            $incident->update([
                'status' => IncidentReport::STATUS_CLOSED,
                'resolved_at' => now(),
            ]);

            if ($incident->item_id !== null) {
                Item::query()->whereKey($incident->item_id)->update([
                    'status' => Item::STATUS_AVAILABLE,
                    'item_condition' => Item::CONDITION_GOOD,
                ]);
            }
        });

        Cache::forget(DashboardController::STATS_CACHE_KEY);

        return redirect()
            ->back()
            ->with('success', 'Item repaired and returned to inventory.');
    }

    private function formatActionTakenLabel(?string $action): string
    {
        return match ($action) {
            'under_repair' => 'Under Repair',
            'replaced' => 'Replaced',
            'discarded' => 'Discarded',
            'pending' => 'Pending',
            default => $action ? ucfirst(str_replace('_', ' ', $action)) : '—',
        };
    }
}
