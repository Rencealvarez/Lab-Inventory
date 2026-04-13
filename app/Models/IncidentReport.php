<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Validation\Rule;

class IncidentReport extends Model
{
    use HasFactory;

    public const SEVERITY_LOW = 'low';

    public const SEVERITY_MEDIUM = 'medium';

    public const SEVERITY_HIGH = 'high';

    public const SEVERITY_CRITICAL = 'critical';

    public const STATUS_OPEN = 'open';

    public const STATUS_IN_PROGRESS = 'in_progress';

    public const STATUS_RESOLVED = 'resolved';

    public const STATUS_CLOSED = 'closed';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'item_id',
        'laboratory_id',
        'location_id',
        'reported_by',
        'assigned_to',
        'title',
        'description',
        'damage_details',
        'estimated_cost',
        'severity',
        'status',
        'action_taken',
        'attachment_path',
        'occurred_at',
        'resolved_at',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'estimated_cost' => 'decimal:2',
            'occurred_at' => 'datetime',
            'resolved_at' => 'datetime',
        ];
    }

    public static function validationRules(): array
    {
        return [
            'severity' => ['required', 'string', Rule::in([
                self::SEVERITY_LOW,
                self::SEVERITY_MEDIUM,
                self::SEVERITY_HIGH,
                self::SEVERITY_CRITICAL,
            ])],
            'status' => ['required', 'string', Rule::in([
                self::STATUS_OPEN,
                self::STATUS_IN_PROGRESS,
                self::STATUS_RESOLVED,
                self::STATUS_CLOSED,
            ])],
        ];
    }

    public function item(): BelongsTo
    {
        return $this->belongsTo(Item::class);
    }

    public function laboratory(): BelongsTo
    {
        return $this->belongsTo(Laboratory::class);
    }

    public function location(): BelongsTo
    {
        return $this->belongsTo(Location::class);
    }

    public function reporter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reported_by');
    }

    public function assignee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }
}
