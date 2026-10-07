<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('role')->default('anggota')->after('password'); // super_admin, petugas, anggota, tamu
            $table->string('member_type')->default('siswa')->after('role'); // siswa, guru, staf, umum
            $table->string('identity_number')->nullable()->unique()->after('member_type'); // NIS / NIP / NIK
            $table->string('phone')->nullable()->after('identity_number');
            $table->string('address')->nullable()->after('phone');
            $table->string('class_name')->nullable()->after('address'); // misal XII MIPA 1 atau Ruang Guru
            $table->integer('max_loan_limit')->default(3)->after('class_name');
            $table->string('status')->default('active')->after('max_loan_limit'); // active, suspended
        });

        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique(); // DDC code e.g. 000, 100, 500
            $table->string('name');
            $table->text('description')->nullable();
            $table->timestamps();
        });

        Schema::create('books', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('author');
            $table->string('publisher');
            $table->integer('publication_year');
            $table->string('isbn')->unique();
            $table->string('ddc_code')->index();
            $table->foreignId('category_id')->constrained()->cascadeOnDelete();
            $table->string('rack_location');
            $table->text('synopsis')->nullable();
            $table->string('cover_image')->nullable();
            $table->text('table_of_contents')->nullable(); // Preview lampiran / daftar isi digital
            $table->integer('total_copies')->default(1);
            $table->integer('available_copies')->default(1);
            $table->timestamps();
        });

        Schema::create('book_copies', function (Blueprint $table) {
            $table->id();
            $table->foreignId('book_id')->constrained()->cascadeOnDelete();
            $table->string('barcode')->unique(); // e.g. BK-2026-00101
            $table->string('call_number'); // e.g. 510 STE k.1
            $table->string('condition')->default('baik'); // baik, rusak_ringan, rusak_berat, hilang
            $table->string('status')->default('tersedia'); // tersedia, dipinjam, reservasi, pemeliharaan
            $table->timestamps();
        });

        Schema::create('loans', function (Blueprint $table) {
            $table->id();
            $table->string('loan_code')->unique(); // e.g. PJ-202610-001
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('book_copy_id')->constrained()->cascadeOnDelete();
            $table->foreignId('librarian_id')->nullable()->constrained('users')->nullOnDelete();
            $table->date('borrow_date');
            $table->date('due_date');
            $table->date('return_date')->nullable();
            $table->string('status')->default('dipinjam'); // dipinjam, kembali, terlambat, hilang
            $table->integer('renewed_count')->default(0);
            $table->integer('fine_amount')->default(0);
            $table->integer('fine_paid')->default(0);
            $table->string('fine_status')->default('none'); // none, unpaid, paid
            $table->string('fine_reason')->nullable(); // terlambat, rusak, hilang
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('reservations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('book_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->date('reservation_date');
            $table->string('status')->default('pending'); // pending, notified, fulfilled, cancelled
            $table->integer('queue_position')->default(1);
            $table->dateTime('expires_at')->nullable();
            $table->timestamps();
        });

        Schema::create('book_suggestions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->string('author');
            $table->string('publisher')->nullable();
            $table->text('reason');
            $table->string('status')->default('pending'); // pending, approved, rejected
            $table->text('admin_note')->nullable();
            $table->timestamps();
        });

        Schema::create('attendance_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('identity_number');
            $table->string('visitor_name');
            $table->string('visitor_type')->default('siswa'); // siswa, guru, tamu
            $table->string('class_name')->nullable();
            $table->string('purpose'); // Membaca, Meminjam Buku, Tugas / Riset, Kunjungan Kelas, Lainnya
            $table->timestamp('checkin_at')->useCurrent();
            $table->timestamps();
        });

        Schema::create('clearance_letters', function (Blueprint $table) {
            $table->id();
            $table->string('letter_number')->unique();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->date('issued_at');
            $table->date('valid_until');
            $table->text('notes')->nullable();
            $table->string('status')->default('valid'); // valid, revoked
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('library_settings', function (Blueprint $table) {
            $table->id();
            $table->integer('loan_duration_days')->default(7);
            $table->integer('daily_fine_rate')->default(1000);
            $table->integer('max_loan_siswa')->default(3);
            $table->integer('max_loan_guru')->default(5);
            $table->integer('max_renewal_count')->default(1);
            $table->string('library_name')->default('Perpustakaan Cendekia Nusantara');
            $table->string('institution_name')->default('SMA Negeri 1 Prestasi Bangsa');
            $table->string('head_librarian_name')->default('Dra. Hj. Siti Rahmawati, M.Pd');
            $table->string('head_librarian_nip')->default('19750814 200003 2 001');
            $table->string('opening_hours')->default('Senin - Jumat: 07.30 - 16.00 WIB | Sabtu: 08.00 - 13.00 WIB');
            $table->text('rules_text')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('library_settings');
        Schema::dropIfExists('clearance_letters');
        Schema::dropIfExists('attendance_logs');
        Schema::dropIfExists('book_suggestions');
        Schema::dropIfExists('reservations');
        Schema::dropIfExists('loans');
        Schema::dropIfExists('book_copies');
        Schema::dropIfExists('books');
        Schema::dropIfExists('categories');

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'role',
                'member_type',
                'identity_number',
                'phone',
                'address',
                'class_name',
                'max_loan_limit',
                'status',
            ]);
        });
    }
};
