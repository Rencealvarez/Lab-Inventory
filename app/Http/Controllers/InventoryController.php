<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Item;
use App\Models\Location;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class InventoryController extends Controller
{
    public function index(): Response
    {
        $items = Item::query()
            ->with([
                'category',
                'location.laboratory',
            ])
            ->orderBy('name')
            ->get()
            ->map(fn (Item $item) => [
                'id' => $item->id,
                'sku' => $item->sku,
                'name' => $item->name,
                'type' => $item->category?->name ?? '—',
                'category_id' => $item->category_id,
                'stock' => (int) $item->quantity,
                'min_stock_alert' => $item->min_stock_alert !== null
                    ? (int) $item->min_stock_alert
                    : null,
                'location' => $this->formatLocationLabel($item),
                'location_id' => $item->location_id,
                'status' => $this->displayStatus($item),
                'status_raw' => $item->status,
            ]);

        return Inertia::render('Inventory', [
            'items' => $items,
            'categories' => Category::query()->orderBy('name')->get(['id', 'name']),
            'locations' => Location::query()
                ->with('laboratory:id,name')
                ->orderBy('name')
                ->get(['id', 'name', 'laboratory_id'])
                ->map(fn (Location $location) => [
                    'id' => $location->id,
                    'name' => $location->name,
                    'laboratory' => $location->laboratory?->name,
                ]),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'sku' => 'required|string|max:60|unique:items,sku',
            'name' => 'required|string|max:150',
            'type' => 'required|integer|exists:categories,id',
            'location_id' => 'required|integer|exists:locations,id',
            'current_stock' => 'required|integer|min:0',
            'min_stock_alert' => 'nullable|integer|min:0',
            'status' => 'required|string|in:available,reserved,in_use,lost',
        ]);

        Item::create([
            'sku' => $validated['sku'],
            'name' => $validated['name'],
            'type' => (int) $validated['type'],
            'location_id' => (int) $validated['location_id'],
            'current_stock' => (int) $validated['current_stock'],
            'min_stock_alert' => array_key_exists('min_stock_alert', $validated)
                && $validated['min_stock_alert'] !== null
                ? (int) $validated['min_stock_alert']
                : null,
            'status' => $validated['status'],
            'item_condition' => Item::CONDITION_GOOD,
            'created_by' => $request->user()?->id,
        ]);

        return redirect()->back();
    }

    public function update(Request $request, Item $item): RedirectResponse
    {
        $validated = $request->validate([
            'sku' => 'required|string|max:60|unique:items,sku,' . $item->id,
            'name' => 'required|string|max:150',
            'type' => 'required|integer|exists:categories,id',
            'location_id' => 'required|integer|exists:locations,id',
            'current_stock' => 'required|integer|min:0',
            'min_stock_alert' => 'nullable|integer|min:0',
            'status' => 'required|string|in:available,reserved,in_use,lost',
        ]);

        $item->update([
            'sku' => $validated['sku'],
            'name' => $validated['name'],
            'type' => (int) $validated['type'],
            'location_id' => (int) $validated['location_id'],
            'current_stock' => (int) $validated['current_stock'],
            'min_stock_alert' => array_key_exists('min_stock_alert', $validated)
                && $validated['min_stock_alert'] !== null
                ? (int) $validated['min_stock_alert']
                : null,
            'status' => $validated['status'],
        ]);

        return redirect()->back();
    }

    public function destroy(Item $item): RedirectResponse
    {
        $item->delete();

        return redirect()->back();
    }

    private function formatLocationLabel(Item $item): string
    {
        $lab = $item->location?->laboratory?->name;
        $loc = $item->location?->name;

        if ($lab && $loc) {
            return $lab.' / '.$loc;
        }

        return $lab ?? $loc ?? '—';
    }

    private function displayStatus(Item $item): string
    {
        if ($item->is_decommissioned) {
            return 'Decommissioned';
        }

        if ($item->min_stock_alert !== null && (int) $item->min_stock_alert > 0
            && (int) $item->quantity <= (int) $item->min_stock_alert) {
            return 'Low Stock';
        }

        if ($item->item_condition === Item::CONDITION_DAMAGED) {
            return 'Maintenance';
        }

        return match ($item->status) {
            Item::STATUS_IN_USE => 'Active',
            Item::STATUS_RESERVED => 'Active',
            Item::STATUS_LOST => 'Maintenance',
            default => 'Active',
        };
    }
}
