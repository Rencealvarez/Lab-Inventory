<?php

namespace App\Notifications;

use App\Models\TransactionBorrowRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class TransactionBorrowRequestReviewedNotification extends Notification
{
    use Queueable;

    public function __construct(
        private readonly TransactionBorrowRequest $borrowRequest,
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
        $itemName = $this->borrowRequest->item?->name ?? 'Unknown item';
        $itemSku = $this->borrowRequest->item?->sku ?? 'N/A';
        $message = $this->approved
            ? 'Your borrow request for '.$itemName.' ('.$itemSku.') was approved. You may now proceed with standard borrowing and return workflows in Transactions.'
            : 'Your borrow request for '.$itemName.' ('.$itemSku.') was rejected. Please contact the lab admin for details.';

        return [
            'type' => 'borrow_request_reviewed',
            'title' => $this->approved ? 'Borrow Request Approved' : 'Borrow Request Rejected',
            'message' => $message,
            'borrow_request_id' => $this->borrowRequest->id,
            'review_status' => $this->approved ? 'approved' : 'rejected',
            'rejection_reason' => $this->approved ? null : $this->borrowRequest->rejection_reason,
        ];
    }
}
