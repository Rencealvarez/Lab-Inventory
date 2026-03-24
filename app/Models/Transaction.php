<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Validation\Rule;

class Transaction extends Model
{
    use HasFactory;

    public const TYPE_STOCK_IN = 'stock_in';
    public const TYPE_STOCK_OUT = 'stock_out';
    public const TYPE_TRANSFER = 'transfer';
    public const TYPE_ADJUSTMENT = 'adjustment';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'item_id',
        'user_id',
        'from_location_id',
        'to_location_id',
        'transaction_type',
        'quantity',
        'remarks',
        'transacted_at',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'transacted_at' => 'datetime',
        ];
    }

    public static function validationRules(): array
    {
        return [
            'transaction_type' => ['required', 'string', Rule::in([
                self::TYPE_STOCK_IN,
                self::TYPE_STOCK_OUT,
                self::TYPE_TRANSFER,
                self::TYPE_ADJUSTMENT,
            ])],
        ];
    }

    public function item(): BelongsTo
    {
        return $this->belongsTo(Item::class, 'item_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function fromLocation(): BelongsTo
    {
        return $this->belongsTo(Location::class, 'from_location_id');
    }

    public function toLocation(): BelongsTo
    {
        return $this->belongsTo(Location::class, 'to_location_id');
    }
}
