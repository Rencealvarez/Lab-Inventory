<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Illuminate\Validation\Rule;

class Laboratory extends Model
{
    use HasFactory;

    protected $table = 'laboratories';

    public const STATUS_ACTIVE = 'active';
    public const STATUS_INACTIVE = 'inactive';
    public const STATUS_MAINTENANCE = 'maintenance';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'department_id',
        'name',
        'code',
        'description',
        'status',
        'capacity',
    ];

    public static function validationRules(): array
    {
        return [
            'status' => ['required', 'string', Rule::in([
                self::STATUS_ACTIVE,
                self::STATUS_INACTIVE,
                self::STATUS_MAINTENANCE,
            ])],
        ];
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    public function locations(): HasMany
    {
        return $this->hasMany(Location::class);
    }

    /**
     * Convenience relationship: laboratory -> locations -> items.
     */
    public function items(): HasManyThrough
    {
        return $this->hasManyThrough(
            Item::class,
            Location::class,
            'laboratory_id',
            'location_id',
            'id',
            'id',
        );
    }

    public function serviceFeedbacks(): HasMany
    {
        return $this->hasMany(ServiceFeedback::class);
    }

    public function incidentReports(): HasMany
    {
        return $this->hasMany(IncidentReport::class);
    }

    public function feedbackUsers(): BelongsToMany
    {
        return $this->belongsToMany(
            User::class,
            'service_feedback',
            'laboratory_id',
            'user_id'
        )->withPivot(['service_type', 'rating', 'status'])->withTimestamps();
    }
}
