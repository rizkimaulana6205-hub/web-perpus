<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $book_id
 * @property int $user_id
 * @property Carbon $reservation_date
 * @property string $status
 * @property int $queue_position
 * @property Carbon|null $expires_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable([
    'book_id',
    'user_id',
    'reservation_date',
    'status',
    'queue_position',
    'expires_at',
])]
class Reservation extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return [
            'reservation_date' => 'date',
            'expires_at' => 'datetime',
            'queue_position' => 'integer',
        ];
    }

    /**
     * @return BelongsTo<Book, $this>
     */
    public function book(): BelongsTo
    {
        return $this->belongsTo(Book::class);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
