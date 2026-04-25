<?php

namespace App\Notifications;

use App\Models\Transaction;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class NewTransactionNotification extends Notification
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(private readonly Transaction $transaction)
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
        $itemName = $this->transaction->item?->name ?? 'Unknown item';
        $itemSku = $this->transaction->item?->sku ?? 'N/A';
        $borrower = $this->transaction->user?->displayName() ?? 'Unknown user';

        return [
            'type' => 'transaction',
            'title' => 'New Transaction',
            'message' => $borrower.' borrowed '.$itemName.' ('.$itemSku.')',
            'transaction_id' => $this->transaction->id,
        ];
    }
}
