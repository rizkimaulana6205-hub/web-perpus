<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $title
 * @property string $author
 * @property string $publisher
 * @property int $publication_year
 * @property string $isbn
 * @property string $ddc_code
 * @property int $category_id
 * @property string $rack_location
 * @property string|null $synopsis
 * @property string|null $cover_image
 * @property string|null $table_of_contents
 * @property int $total_copies
 * @property int $available_copies
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable([
    'title',
    'author',
    'publisher',
    'publication_year',
    'isbn',
    'ddc_code',
    'category_id',
    'rack_location',
    'synopsis',
    'cover_image',
    'table_of_contents',
    'total_copies',
    'available_copies',
])]
class Book extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return [
            'publication_year' => 'integer',
            'total_copies' => 'integer',
            'available_copies' => 'integer',
        ];
    }

    /**
     * @return BelongsTo<Category, $this>
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * @return HasMany<BookCopy, $this>
     */
    public function copies(): HasMany
    {
        return $this->hasMany(BookCopy::class);
    }

    /**
     * @return HasMany<Reservation, $this>
     */
    public function reservations(): HasMany
    {
        return $this->hasMany(Reservation::class);
    }

    /**
     * Recalculate copies count.
     */
    public function syncCopiesCount(): void
    {
        $total = $this->copies()->count();
        $available = $this->copies()->where('status', 'tersedia')->count();

        $this->update([
            'total_copies' => $total,
            'available_copies' => $available,
        ]);
    }
}
