<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Validation\Rule;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    public const ROLE_ADMIN = 'admin';
    public const ROLE_TECHNICIAN = 'technician';
    public const ROLE_STAFF = 'staff';

    /**
     * Validation rule helper for enum-like fields on PostgreSQL.
     */
    public static function validationRules(): array
    {
        return [
            'role' => ['required', 'string', Rule::in([
                self::ROLE_ADMIN,
                self::ROLE_TECHNICIAN,
                self::ROLE_STAFF,
            ])],
        ];
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
        'role',
        'department_id',
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
