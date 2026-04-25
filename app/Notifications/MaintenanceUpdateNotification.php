<?php

namespace App\Notifications;

use App\Models\IncidentReport;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class MaintenanceUpdateNotification extends Notification
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
        $cost = $this->incident->estimated_cost !== null
            ? 'P'.number_format((float) $this->incident->estimated_cost, 2)
            : 'N/A';

        return [
            'type' => 'maintenance',
            'title' => 'Maintenance Update',
            'message' => $itemName.' repair cost updated to '.$cost,
            'incident_id' => $this->incident->id,
        ];
    }
}
