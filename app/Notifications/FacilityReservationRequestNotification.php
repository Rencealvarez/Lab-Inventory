<?php

namespace App\Notifications;

use App\Models\FacilityReservation;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class FacilityReservationRequestNotification extends Notification
{
    use Queueable;

    public function __construct(private readonly FacilityReservation $reservation)
    {
    }

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $lab = $this->reservation->laboratory?->name ?? 'A facility';
        $requester = $this->reservation->requester?->displayName() ?? 'Staff member';

        return [
            'type' => 'facility_reservation',
            'title' => 'Facility reservation request',
            'message' => $requester.' requested to reserve '.$lab,
            'facility_reservation_id' => $this->reservation->id,
        ];
    }
}
