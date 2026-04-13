<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Validation\Rule;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    protected $table = 'users';

    public const ROLE_ADMIN = 'admin';

    public const ROLE_TECHNICIAN = 'technician';

    public const ROLE_STAFF = 'staff';

    public const ROLE_STUDENT = 'student';

    public const ROLE_PROFESSOR = 'professor';

    public const ROLE_LAB_MANAGER = 'lab_manager';

    public const STATUS_ACTIVE = 'active';

    public const STATUS_INACTIVE = 'inactive';

    public const STATUS_SUSPENDED = 'suspended';

    /**
     * @return list<string>
     */
    public static function roles(): array
    {
        return [
            self::ROLE_STUDENT,
            self::ROLE_PROFESSOR,
            self::ROLE_LAB_MANAGER,
            self::ROLE_ADMIN,
            self::ROLE_TECHNICIAN,
            self::ROLE_STAFF,
        ];
    }

    /**
     * @return list<string>
     */
    public static function statuses(): array
    {
        return [
            self::STATUS_ACTIVE,
            self::STATUS_INACTIVE,
            self::STATUS_SUSPENDED,
        ];
    }

    /**
     * Validation rule helper for enum-like fields on PostgreSQL.
     */
    public static function validationRules(): array
    {
        return [
            'role' => ['required', 'string', Rule::in(self::roles())],
        ];
    }

    public function displayName(): string
    {
        if ($this->name) {
            return (string) $this->name;
        }

        if ($this->username) {
            return (string) $this->username;
        }

        return (string) $this->email;
    }

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'username',
        'email',
        'id_number',
        'role',
        'department_id',
        'status',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    public function createdItems(): HasMany
    {
        return $this->hasMany(Item::class, 'created_by');
    }

    public function assignedItems(): HasMany
    {
        return $this->hasMany(Item::class, 'assigned_to');
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class, 'user_id');
    }

    public function serviceFeedbacks(): HasMany
    {
        return $this->hasMany(ServiceFeedback::class);
    }

    public function incidentReportsCreated(): HasMany
    {
        return $this->hasMany(IncidentReport::class, 'reported_by');
    }

    public function incidentReportsAssigned(): HasMany
    {
        return $this->hasMany(IncidentReport::class, 'assigned_to');
    }

    public function feedbackLaboratories(): BelongsToMany
    {
        return $this->belongsToMany(
            Laboratory::class,
            'service_feedback',
            'user_id',
            'laboratory_id'
        )->withPivot(['service_type', 'rating', 'status'])->withTimestamps();
    }
}
