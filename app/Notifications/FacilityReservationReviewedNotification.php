<?php

namespace App\Notifications;

use App\Models\FacilityReservation;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class FacilityReservationReviewedNotification extends Notification
{
    use Queueable;

    public function __construct(
        private readonly FacilityReservation $reservation,
        private readonly bool $approved
    ) {
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
        $lab = $this->reservation->laboratory?->name ?? 'the facility';

        $message = $this->approved
            ? 'Your reservation for '.$lab.' was approved.'
            : 'Your reservation for '.$lab.' was rejected.'
                .($this->reservation->rejection_reason
                    ? ' Reason: '.$this->reservation->rejection_reason
                    : '');

        return [
            'type' => 'facility_reservation_reviewed',
            'title' => $this->approved ? 'Reservation approved' : 'Reservation rejected',
            'message' => $message,
            'facility_reservation_id' => $this->reservation->id,
            'review_status' => $this->approved ? 'approved' : 'rejected',
            'rejection_reason' => $this->approved ? null : $this->reservation->rejection_reason,
        ];
    }
}
