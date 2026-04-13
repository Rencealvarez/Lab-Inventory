<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Validation\Rule;

class Transaction extends Model
{
    use HasFactory;

    protected $table = 'transactions';

    public const TYPE_BORROW = 'borrow';

    public const TYPE_STOCK_IN = 'stock_in';

    public const TYPE_STOCK_OUT = 'stock_out';

    public const TYPE_TRANSFER = 'transfer';

    public const TYPE_ADJUSTMENT = 'adjustment';

    public const STATUS_ISSUED = 'issued';

    public const STATUS_ACTIVE = 'active';

    public const STATUS_RETURNED = 'returned';

    public const STATUS_CANCELLED = 'cancelled';

    public const STATUS_COMPLETED = 'completed';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'item_id',
        'user_id',
        'from_location_id',
        'to_location_id',
        'type',
        'transaction_type',
        'quantity',
        'status',
        'remarks',
        'transacted_at',
        'expected_return_date',
    ];

    /**
     * @var array<string, string>
     */
    protected $casts = [
        'transacted_at' => 'datetime',
        'expected_return_date' => 'date',
    ];

    public static function validationRules(): array
    {
        return [
            'transaction_type' => ['required', 'string', Rule::in([
                self::TYPE_BORROW,
                self::TYPE_STOCK_IN,
                self::TYPE_STOCK_OUT,
                self::TYPE_TRANSFER,
                self::TYPE_ADJUSTMENT,
            ])],
        ];
    }

    public function setTypeAttribute(?string $value): void
    {
        if ($value !== null) {
            $this->attributes['transaction_type'] = $value;
        }
    }

    public function getTypeAttribute(): ?string
    {
        return $this->attributes['transaction_type'] ?? null;
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
