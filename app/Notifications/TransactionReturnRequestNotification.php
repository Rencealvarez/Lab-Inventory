<?php

namespace App\Notifications;

use App\Models\Transaction;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class TransactionReturnRequestNotification extends Notification
{
    use Queueable;

    public function __construct(private readonly Transaction $transaction)
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
        $itemName = $this->transaction->item?->name ?? 'Unknown item';
        $itemSku = $this->transaction->item?->sku ?? 'N/A';
        $borrower = $this->transaction->user?->displayName() ?? 'Unknown user';

        return [
            'type' => 'return_request',
            'title' => 'Return request',
            'message' => $borrower.' requested to return '.$itemName.' ('.$itemSku.')',
            'transaction_id' => $this->transaction->id,
        ];
    }
}
