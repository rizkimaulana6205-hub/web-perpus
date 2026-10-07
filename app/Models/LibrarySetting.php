<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $loan_duration_days
 * @property int $daily_fine_rate
 * @property int $max_loan_siswa
 * @property int $max_loan_guru
 * @property int $max_renewal_count
 * @property string $library_name
 * @property string $institution_name
 * @property string $head_librarian_name
 * @property string $head_librarian_nip
 * @property string $opening_hours
 * @property string|null $rules_text
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable([
    'loan_duration_days',
    'daily_fine_rate',
    'max_loan_siswa',
    'max_loan_guru',
    'max_renewal_count',
    'library_name',
    'institution_name',
    'head_librarian_name',
    'head_librarian_nip',
    'opening_hours',
    'rules_text',
])]
class LibrarySetting extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return [
            'loan_duration_days' => 'integer',
            'daily_fine_rate' => 'integer',
            'max_loan_siswa' => 'integer',
            'max_loan_guru' => 'integer',
            'max_renewal_count' => 'integer',
        ];
    }

    /**
     * Get or create active singleton configuration.
     */
    public static function current(): self
    {
        /** @var self $setting */
        $setting = static::firstOrCreate([], [
            'loan_duration_days' => 7,
            'daily_fine_rate' => 1000,
            'max_loan_siswa' => 3,
            'max_loan_guru' => 5,
            'max_renewal_count' => 1,
            'library_name' => 'Perpustakaan Cendekia Nusantara',
            'institution_name' => 'SMA Negeri 1 Prestasi Bangsa',
            'head_librarian_name' => 'Dra. Hj. Siti Rahmawati, M.Pd',
            'head_librarian_nip' => '19750814 200003 2 001',
            'opening_hours' => 'Senin - Jumat: 07.30 - 16.00 WIB | Sabtu: 08.00 - 13.00 WIB',
            'rules_text' => "1. Menjaga ketertiban, ketenangan, dan kebersihan di ruang baca.\n2. Maksimal peminjaman 3 eksemplar buku untuk siswa selama 7 hari kalender.\n3. Denda keterlambatan Rp 1.000 / hari per buku.\n4. Perpanjangan peminjaman dapat dilakukan mandiri 1x sebelum jatuh tempo jika buku tidak direservasi peminjam lain.\n5. Buku yang rusak atau hilang wajib diganti dengan judul dan edisi yang sama atau setara.",
        ]);

        return $setting;
    }
}
