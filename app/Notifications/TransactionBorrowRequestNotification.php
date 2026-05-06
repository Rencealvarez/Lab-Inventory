<?php

namespace App\Notifications;

use App\Models\TransactionBorrowRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class TransactionBorrowRequestNotification extends Notification
{
    use Queueable;

    public function __construct(private readonly TransactionBorrowRequest $borrowRequest)
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
        $itemName = $this->borrowRequest->item?->name ?? 'Unknown item';
        $itemSku = $this->borrowRequest->item?->sku ?? 'N/A';
        $borrower = $this->borrowRequest->requester?->displayName() ?? 'Unknown user';

        return [
            'type' => 'borrow_request',
            'title' => 'Borrow request',
            'message' => $borrower.' requested to borrow '.$itemName.' ('.$itemSku.')',
            'borrow_request_id' => $this->borrowRequest->id,
        ];
    }
}
