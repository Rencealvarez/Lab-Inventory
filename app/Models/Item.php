<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Validation\Rule;

class Item extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'items';

    public const CONDITION_GOOD = 'good';
    public const CONDITION_FAIR = 'fair';
    public const CONDITION_DAMAGED = 'damaged';

    public const STATUS_AVAILABLE = 'available';
    public const STATUS_RESERVED = 'reserved';
    public const STATUS_IN_USE = 'in_use';
    public const STATUS_LOST = 'lost';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'category_id',
        'type',
        'location_id',
        'created_by',
        'assigned_to',
        'name',
        'item_name',
        'sku',
        'description',
        'unit_cost',
        'quantity',
        'current_stock',
        'min_stock_alert',
        'unit',
        'item_condition',
        'status',
        'is_decommissioned',
        'decommissioned_at',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'unit_cost' => 'decimal:2',
            'min_stock_alert' => 'integer',
            'is_decommissioned' => 'boolean',
            'decommissioned_at' => 'datetime',
        ];
    }

    public static function validationRules(): array
    {
        return [
            'item_condition' => ['required', 'string', Rule::in([
                self::CONDITION_GOOD,
                self::CONDITION_FAIR,
                self::CONDITION_DAMAGED,
            ])],
            'status' => ['required', 'string', Rule::in([
                self::STATUS_AVAILABLE,
                self::STATUS_RESERVED,
                self::STATUS_IN_USE,
                self::STATUS_LOST,
            ])],
        ];
    }

    public function scopeActive(Builder $query): Builder
    {
        // PostgreSQL: compare boolean to false/true, not 0/1 (avoids "boolean = integer" errors).
        return $query->whereRaw('is_decommissioned IS NOT TRUE');
    }

    public function scopeDecommissioned(Builder $query): Builder
    {
        return $query->whereRaw('is_decommissioned IS TRUE');
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class, 'category_id');
    }

    public function location(): BelongsTo
    {
        return $this->belongsTo(Location::class, 'location_id');
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function assignedTo(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }

    public function setItemNameAttribute(?string $value): void
    {
        $this->attributes['name'] = $value;
    }

    public function setCurrentStockAttribute(int|string|null $value): void
    {
        $this->attributes['quantity'] = $value;
    }

    public function setTypeAttribute(int|string|null $value): void
    {
        $this->attributes['category_id'] = $value;
    }
}
