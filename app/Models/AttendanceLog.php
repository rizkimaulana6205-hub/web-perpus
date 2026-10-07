<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int|null $user_id
 * @property string $identity_number
 * @property string $visitor_name
 * @property string $visitor_type
 * @property string|null $class_name
 * @property string $purpose
 * @property Carbon $checkin_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable([
    'user_id',
    'identity_number',
    'visitor_name',
    'visitor_type',
    'class_name',
    'purpose',
    'checkin_at',
])]
class AttendanceLog extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return [
            'checkin_at' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
