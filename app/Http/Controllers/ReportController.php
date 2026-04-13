<?php

namespace App\Http\Controllers;

use App\Models\IncidentReport;
use App\Models\Item;
use App\Models\Transaction;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

class ReportController extends Controller
{
    public function inventoryReport(): Response
    {
        $rows = Item::query()
            ->select([
                'id',
                'sku',
                'name',
                'category_id',
                'quantity',
                'min_stock_alert',
                'location_id',
                'status',
                'item_condition',
                'is_decommissioned',
            ])
            ->with([
                'category:id,name',
                'location:id,name,laboratory_id',
                'location.laboratory:id,name',
            ])
            ->orderBy('name')
            ->get()
            ->map(fn (Item $item) => [
                'sku' => $item->sku ?? '—',
                'name' => $item->name,
                'category' => $item->category?->name ?? '—',
                'quantity' => (int) $item->quantity,
                'min_alert' => $item->min_stock_alert !== null ? (int) $item->min_stock_alert : '—',
                'location' => $this->formatLocationLabel($item),
                'status' => $this->displayItemStatus($item),
            ])
            ->all();

        $pdf = Pdf::loadView('reports.inventory', [
            'documentTitle' => 'Laboratory Inventory Report',
            'generatedAt' => $this->formattedGeneratedAt(),
            'rows' => $rows,
        ])->setPaper('a4', 'landscape');

        return $pdf->stream('lab-inventory-report.pdf');
    }

    public function transactionReport(): Response
    {
        $rows = Transaction::query()
            ->with([
                'item:id,name,sku',
                'user:id,name,username,email',
                'fromLocation:id,name',
                'toLocation:id,name',
            ])
            ->latest('transacted_at')
            ->limit(500)
            ->get()
            ->map(function (Transaction $t) {
                $user = $t->user;

                return [
                    'date' => $t->transacted_at?->format('Y-m-d H:i') ?? '—',
                    'type' => $this->transactionTypeLabel($t->transaction_type),
                    'item' => $t->item
                        ? ($t->item->name.($t->item->sku ? ' ('.$t->item->sku.')' : ''))
                        : '—',
                    'user' => $user?->name ?? $user?->username ?? $user?->email ?? '—',
                    'quantity' => (int) $t->quantity,
                    'status' => $this->transactionStatusLabel($t->status),
                    'remarks' => $t->remarks ? Str::limit((string) $t->remarks, 80) : '—',
                ];
            })
            ->all();

        $pdf = Pdf::loadView('reports.transactions', [
            'documentTitle' => 'Transaction Activity Report',
            'generatedAt' => $this->formattedGeneratedAt(),
            'rows' => $rows,
        ])->setPaper('a4', 'landscape');

        return $pdf->stream('lab-transactions-report.pdf');
    }

    public function maintenanceReport(): Response
    {
        $rows = IncidentReport::query()
            ->with(['item:id,sku,name', 'reporter:id,name,username,email', 'laboratory:id,name'])
            ->latest('occurred_at')
            ->limit(500)
            ->get()
            ->map(function (IncidentReport $report) {
                $reporter = $report->reporter;

                return [
                    'ref' => 'INC-'.str_pad((string) $report->id, 3, '0', STR_PAD_LEFT),
                    'occurred' => $report->occurred_at?->format('Y-m-d') ?? '—',
                    'item' => $report->item
                        ? $report->item->name.' ('.$report->item->sku.')'
                        : '—',
                    'laboratory' => $report->laboratory?->name ?? '—',
                    'severity' => ucfirst((string) $report->severity),
                    'status' => ucfirst(str_replace('_', ' ', (string) $report->status)),
                    'action' => $this->formatActionTakenLabel($report->action_taken),
                    'cost' => $report->estimated_cost !== null
                        ? '₱'.number_format((float) $report->estimated_cost, 2)
                        : '—',
                    'reporter' => $reporter?->name
                        ?? $reporter?->username
                        ?? $reporter?->email
                        ?? '—',
                ];
            })
            ->all();

        $pdf = Pdf::loadView('reports.maintenance', [
            'documentTitle' => 'Maintenance & Incident Report',
            'generatedAt' => $this->formattedGeneratedAt(),
            'rows' => $rows,
        ])->setPaper('a4', 'landscape');

        return $pdf->stream('lab-maintenance-report.pdf');
    }

    private function formattedGeneratedAt(): string
    {
        return now()->timezone(config('app.timezone'))->format('F j, Y \a\t g:i A');
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

    private function displayItemStatus(Item $item): string
    {
        if ($item->is_decommissioned) {
            return 'Decommissioned';
        }

        if ($item->min_stock_alert !== null && (int) $item->min_stock_alert > 0
            && (int) $item->quantity <= (int) $item->min_stock_alert) {
            return 'Low Stock';
        }

        if ($item->status === Item::STATUS_DAMAGED) {
            return 'Damaged';
        }
        if ($item->status === Item::STATUS_UNDER_REPAIR) {
            return 'Under Repair';
        }
        if ($item->status === Item::STATUS_INACTIVE) {
            return 'Inactive';
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

    private function transactionTypeLabel(?string $type): string
    {
        return match ($type) {
            Transaction::TYPE_BORROW => 'Borrow',
            Transaction::TYPE_STOCK_IN => 'Stock in',
            Transaction::TYPE_STOCK_OUT => 'Stock out',
            Transaction::TYPE_TRANSFER => 'Transfer',
            Transaction::TYPE_ADJUSTMENT => 'Adjustment',
            default => $type ? ucfirst(str_replace('_', ' ', $type)) : '—',
        };
    }

    private function transactionStatusLabel(?string $status): string
    {
        return match ($status) {
            Transaction::STATUS_ISSUED => 'Issued',
            Transaction::STATUS_ACTIVE => 'Active',
            Transaction::STATUS_RETURNED => 'Returned',
            Transaction::STATUS_CANCELLED => 'Cancelled',
            Transaction::STATUS_COMPLETED => 'Completed',
            default => $status ? ucfirst(str_replace('_', ' ', $status)) : '—',
        };
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
