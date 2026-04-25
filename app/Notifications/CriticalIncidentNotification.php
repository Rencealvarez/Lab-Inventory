<?php

namespace App\Notifications;

use App\Models\IncidentReport;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class CriticalIncidentNotification extends Notification
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(private readonly IncidentReport $incident)
    {
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $itemName = $this->incident->item?->name ?? 'Equipment';
        $itemSku = $this->incident->item?->sku ?? 'N/A';
        $severity = ucfirst((string) ($this->incident->severity ?? 'critical'));

        return [
            'type' => 'incident',
            'title' => 'Critical Incident',
            'message' => $itemName.' ('.$itemSku.') reported with '.$severity.' severity',
            'incident_id' => $this->incident->id,
        ];
    }
}
