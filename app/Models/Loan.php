<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $loan_code
 * @property int $user_id
 * @property int $book_copy_id
 * @property int|null $librarian_id
 * @property Carbon $borrow_date
 * @property Carbon $due_date
 * @property Carbon|null $return_date
 * @property string $status
 * @property int $renewed_count
 * @property int $fine_amount
 * @property int $fine_paid
 * @property string $fine_status
 * @property string|null $fine_reason
 * @property string|null $notes
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable([
    'loan_code',
    'user_id',
    'book_copy_id',
    'librarian_id',
    'borrow_date',
    'due_date',
    'return_date',
    'status',
    'renewed_count',
    'fine_amount',
    'fine_paid',
    'fine_status',
    'fine_reason',
    'notes',
])]
class Loan extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return [
            'borrow_date' => 'date',
            'due_date' => 'date',
            'return_date' => 'date',
            'renewed_count' => 'integer',
            'fine_amount' => 'integer',
            'fine_paid' => 'integer',
        ];
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return BelongsTo<BookCopy, $this>
     */
    public function bookCopy(): BelongsTo
    {
        return $this->belongsTo(BookCopy::class);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function librarian(): BelongsTo
    {
        return $this->belongsTo(User::class, 'librarian_id');
    }

    /**
     * Calculate days overdue up to today or return date.
     */
    public function getDaysOverdue(): int
    {
        $comparisonDate = $this->return_date ?? Carbon::today();
        if ($comparisonDate->greaterThan($this->due_date)) {
            return (int) $this->due_date->diffInDays($comparisonDate);
        }

        return 0;
    }

    /**
     * Calculate expected fine.
     */
    public function calculateFine(int $ratePerDay = 1000): int
    {
        $days = $this->getDaysOverdue();

        return $days * $ratePerDay;
    }

    /**
     * Check if loan is eligible for self-renewal.
     * Rule: Can be renewed max 1 time, must not be overdue, and book must not have active reservations.
     *
     * @return array{allowed: bool, reason: string|null}
     */
    public function canBeRenewed(): array
    {
        if ($this->status !== 'dipinjam') {
            return ['allowed' => false, 'reason' => 'Status peminjaman bukan aktif dipinjam.'];
        }

        if ($this->renewed_count >= 1) {
            return ['allowed' => false, 'reason' => 'Buku ini sudah pernah diperpanjang 1 kali (maksimal perpanjangan mandiri tercapai).'];
        }

        if (Carbon::today()->greaterThan($this->due_date)) {
            return ['allowed' => false, 'reason' => 'Tidak dapat diperpanjang karena sudah melewati tanggal jatuh tempo (terlambat). Harap kembalikan ke meja sirkulasi.'];
        }

        // Check if there is an active reservation by another user for this book
        $bookId = $this->bookCopy?->book_id;
        if ($bookId) {
            $hasReservation = Reservation::where('book_id', $bookId)
                ->where('status', 'pending')
                ->where('user_id', '!=', $this->user_id)
                ->exists();

            if ($hasReservation) {
                return ['allowed' => false, 'reason' => 'Buku ini sedang masuk dalam antrean reservasi / booking oleh anggota lain.'];
            }
        }

        return ['allowed' => true, 'reason' => null];
    }
}
