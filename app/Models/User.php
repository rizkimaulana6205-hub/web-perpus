<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $name
 * @property string $email
 * @property Carbon|null $email_verified_at
 * @property string $password
 * @property string $role
 * @property string $member_type
 * @property string|null $identity_number
 * @property string|null $phone
 * @property string|null $address
 * @property string|null $class_name
 * @property int $max_loan_limit
 * @property string $status
 * @property string|null $remember_token
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable([
    'name',
    'email',
    'password',
    'role',
    'member_type',
    'identity_number',
    'phone',
    'address',
    'class_name',
    'max_loan_limit',
    'status',
])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

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
            'max_loan_limit' => 'integer',
        ];
    }

    /**
     * Get loans of the user.
     *
     * @return HasMany<Loan, $this>
     */
    public function loans(): HasMany
    {
        return $this->hasMany(Loan::class);
    }

    /**
     * Get active loans of the user.
     *
     * @return HasMany<Loan, $this>
     */
    public function activeLoans(): HasMany
    {
        return $this->hasMany(Loan::class)->whereIn('status', ['dipinjam', 'terlambat']);
    }

    /**
     * Get unpaid fines count or total.
     */
    public function unpaidFinesTotal(): int
    {
        return (int) $this->loans()->where('fine_status', 'unpaid')->sum('fine_amount');
    }

    /**
     * Check if user is eligible to borrow.
     *
     * @return array{allowed: bool, reason: string|null}
     */
    public function eligibilityForBorrowing(): array
    {
        if ($this->status !== 'active') {
            return [
                'allowed' => false,
                'reason' => 'Status keanggotaan sedang dinonaktifkan / disuspend.',
            ];
        }

        $activeLoansCount = $this->activeLoans()->count();
        if ($activeLoansCount >= $this->max_loan_limit) {
            return [
                'allowed' => false,
                'reason' => "Telah mencapai batas maksimal peminjaman ({$this->max_loan_limit} buku). Kembalikan buku terlebih dahulu.",
            ];
        }

        $unpaidFine = $this->unpaidFinesTotal();
        if ($unpaidFine > 0) {
            return [
                'allowed' => false,
                'reason' => 'Memiliki tunggakan denda sebesar Rp '.number_format($unpaidFine, 0, ',', '.').'. Harap lunasi terlebih dahulu.',
            ];
        }

        // Check if has overdue loans
        $today = Carbon::today()->toDateString();
        $overdueCount = $this->loans()
            ->whereIn('status', ['dipinjam', 'terlambat'])
            ->where('due_date', '<', $today)
            ->count();

        if ($overdueCount > 0) {
            return [
                'allowed' => false,
                'reason' => "Ada {$overdueCount} buku yang telah melewati batas tanggal jatuh tempo. Harap kembalikan terlebih dahulu.",
            ];
        }

        return [
            'allowed' => true,
            'reason' => null,
        ];
    }

    /**
     * Get reservations of the user.
     *
     * @return HasMany<Reservation, $this>
     */
    public function reservations(): HasMany
    {
        return $this->hasMany(Reservation::class);
    }

    /**
     * Get suggestions of the user.
     *
     * @return HasMany<BookSuggestion, $this>
     */
    public function suggestions(): HasMany
    {
        return $this->hasMany(BookSuggestion::class);
    }

    /**
     * Get clearance letters of the user.
     *
     * @return HasMany<ClearanceLetter, $this>
     */
    public function clearanceLetters(): HasMany
    {
        return $this->hasMany(ClearanceLetter::class);
    }

    public function isSuperAdmin(): bool
    {
        return $this->role === 'super_admin';
    }

    public function isPetugas(): bool
    {
        return in_array($this->role, ['super_admin', 'petugas'], true);
    }

    public function isAnggota(): bool
    {
        return $this->role === 'anggota';
    }

    public function isTamu(): bool
    {
        return $this->role === 'tamu';
    }
}
