<?php

use App\Models\Book;
use App\Models\BookCopy;
use App\Models\Loan;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;

beforeEach(function () {
    $this->seed(DatabaseSeeder::class);
});

test('opac catalog page can be rendered for guest', function () {
    $response = $this->get('/katalog');
    $response->assertStatus(200);
});

test('opac book detail page can be rendered', function () {
    $book = Book::first();
    $response = $this->get("/katalog/buku/{$book->id}");
    $response->assertStatus(200);
});

test('login page can be rendered', function () {
    $response = $this->get('/login');
    $response->assertStatus(200);
});

test('user can log in using email and password', function () {
    $response = $this->post('/login', [
        'identity' => 'rizky@siswa.sch.id',
        'password' => 'password',
    ]);

    $response->assertRedirect('/peminjaman-saya');
    $this->assertAuthenticated();
});

test('user can log in using identity number (NIS)', function () {
    $response = $this->post('/login', [
        'identity' => 'NIS-2024-001',
        'password' => 'password',
    ]);

    $response->assertRedirect('/peminjaman-saya');
    $this->assertAuthenticated();
});

test('login fails with invalid credentials', function () {
    $response = $this->post('/login', [
        'identity' => 'rizky@siswa.sch.id',
        'password' => 'wrong-password',
    ]);

    $response->assertSessionHasErrors('identity');
    $this->assertGuest();
});

test('registration page can be rendered for guest', function () {
    $response = $this->get('/daftar');
    $response->assertStatus(200);
});

test('student can register self successfully and is automatically logged in', function () {
    $response = $this->post('/daftar', [
        'name' => 'Fajar Nugraha',
        'member_type' => 'siswa',
        'identity_number' => 'NIS-2024-999',
        'class_name' => 'X RPL 1',
        'email' => 'fajar@siswa.sch.id',
        'phone' => '081299998888',
        'password' => 'secret123',
        'password_confirmation' => 'secret123',
    ]);

    $response->assertRedirect('/peminjaman-saya');
    $this->assertAuthenticated();

    $user = User::where('identity_number', 'NIS-2024-999')->first();
    expect($user)->not->toBeNull()
        ->and($user->name)->toBe('Fajar Nugraha')
        ->and($user->role)->toBe('anggota')
        ->and($user->member_type)->toBe('siswa')
        ->and($user->class_name)->toBe('X RPL 1')
        ->and($user->max_loan_limit)->toBe(3)
        ->and($user->status)->toBe('aktif');
});

test('teacher can register self successfully with teacher loan limit', function () {
    $response = $this->post('/daftar', [
        'name' => 'Dra. Endang Lestari',
        'member_type' => 'guru',
        'identity_number' => 'NIP-198005052005012001',
        'email' => 'endang@guru.sch.id',
        'password' => 'secret123',
        'password_confirmation' => 'secret123',
    ]);

    $response->assertRedirect('/peminjaman-saya');
    $this->assertAuthenticated();

    $user = User::where('identity_number', 'NIP-198005052005012001')->first();
    expect($user)->not->toBeNull()
        ->and($user->role)->toBe('anggota')
        ->and($user->member_type)->toBe('guru')
        ->and($user->max_loan_limit)->toBe(5);
});

test('registration fails if identity number already exists', function () {
    $existing = User::where('identity_number', 'NIS-2024-001')->first();

    $response = $this->post('/daftar', [
        'name' => 'Duplikat Siswa',
        'member_type' => 'siswa',
        'identity_number' => $existing->identity_number,
        'class_name' => 'X MIPA 1',
        'email' => 'unik@siswa.sch.id',
        'password' => 'secret123',
        'password_confirmation' => 'secret123',
    ]);

    $response->assertSessionHasErrors('identity_number');
});

test('registration fails if email already exists', function () {
    $existing = User::where('email', 'rizky@siswa.sch.id')->first();

    $response = $this->post('/daftar', [
        'name' => 'Duplikat Email',
        'member_type' => 'siswa',
        'identity_number' => 'NIS-2024-888',
        'class_name' => 'X MIPA 1',
        'email' => $existing->email,
        'password' => 'secret123',
        'password_confirmation' => 'secret123',
    ]);

    $response->assertSessionHasErrors('email');
});

test('registration fails if password confirmation does not match', function () {
    $response = $this->post('/daftar', [
        'name' => 'Password Beda',
        'member_type' => 'siswa',
        'identity_number' => 'NIS-2024-777',
        'class_name' => 'X MIPA 1',
        'email' => 'beda@siswa.sch.id',
        'password' => 'secret123',
        'password_confirmation' => 'secret999',
    ]);

    $response->assertSessionHasErrors('password');
});

test('guest is redirected to login when accessing circulation desk', function () {
    $response = $this->get('/sirkulasi');
    $response->assertRedirect('/login');
});

test('student is forbidden from accessing circulation desk and book management', function () {
    $student = User::where('identity_number', 'NIS-2024-001')->first();
    $this->actingAs($student);

    $responseCirculation = $this->get('/sirkulasi');
    $responseCirculation->assertRedirect('/peminjaman-saya');

    $responseBooks = $this->get('/kelola-buku');
    $responseBooks->assertRedirect('/peminjaman-saya');
});

test('student can access my loans dashboard', function () {
    $student = User::where('identity_number', 'NIS-2024-001')->first();
    $this->actingAs($student);

    $response = $this->get('/peminjaman-saya');
    $response->assertStatus(200);
});

test('member fast lookup api returns eligibility and active loans for librarian', function () {
    $librarian = User::where('role', 'petugas')->first();
    $this->actingAs($librarian);

    $user = User::where('identity_number', 'NIS-2024-001')->first();

    $response = $this->getJson("/sirkulasi/lookup-member?code={$user->identity_number}");
    $response->assertStatus(200)
        ->assertJson([
            'success' => true,
            'user' => [
                'name' => $user->name,
                'identity_number' => $user->identity_number,
            ],
            'eligibility' => [
                'allowed' => true,
            ],
        ]);
});

test('member with unpaid fines is blocked from borrowing', function () {
    $librarian = User::where('role', 'petugas')->first();
    $this->actingAs($librarian);

    $user = User::where('identity_number', 'NIS-2024-002')->first();

    $response = $this->getJson("/sirkulasi/lookup-member?code={$user->identity_number}");
    $response->assertStatus(200)
        ->assertJson([
            'success' => true,
            'eligibility' => [
                'allowed' => false,
            ],
        ]);
});

test('fast scan book lookup returns available copy and metadata', function () {
    $librarian = User::where('role', 'petugas')->first();
    $this->actingAs($librarian);

    $copy = BookCopy::where('status', 'tersedia')->first();

    $response = $this->getJson("/sirkulasi/lookup-book?barcode={$copy->barcode}");
    $response->assertStatus(200)
        ->assertJson([
            'success' => true,
            'copy' => [
                'barcode' => $copy->barcode,
                'status' => 'tersedia',
            ],
        ]);
});

test('librarian can process new book loan transaction', function () {
    $librarian = User::where('role', 'petugas')->first();
    $student = User::where('identity_number', 'NIS-2024-001')->first();
    $availableCopy = BookCopy::where('status', 'tersedia')->first();

    $this->actingAs($librarian);

    $response = $this->post('/sirkulasi/pinjam', [
        'user_id' => $student->id,
        'book_copy_barcode' => $availableCopy->barcode,
        'notes' => 'Peminjaman tes feature pest',
    ]);

    $response->assertRedirect();
    $response->assertSessionHas('success');

    $this->assertDatabaseHas('loans', [
        'user_id' => $student->id,
        'book_copy_id' => $availableCopy->id,
        'status' => 'dipinjam',
    ]);

    expect($availableCopy->fresh()->status)->toBe('dipinjam');
});

test('returning on-time book closes loan without fine', function () {
    $librarian = User::where('role', 'petugas')->first();
    $this->actingAs($librarian);

    $activeLoan = Loan::where('status', 'dipinjam')->first();
    $barcode = $activeLoan->bookCopy->barcode;

    $response = $this->post('/sirkulasi/kembali', [
        'barcode_or_id' => $barcode,
        'condition' => 'baik',
        'pay_fine_now' => false,
    ]);

    $response->assertRedirect();
    $response->assertSessionHas('success');

    $updatedLoan = $activeLoan->fresh();
    expect($updatedLoan->status)->toBe('kembali');
    expect($activeLoan->bookCopy->fresh()->status)->toBe('tersedia');
});

test('returning overdue book calculates fine correctly', function () {
    $librarian = User::where('role', 'petugas')->first();
    $this->actingAs($librarian);

    $overdueLoan = Loan::where('status', 'terlambat')->first();
    $barcode = $overdueLoan->bookCopy->barcode;

    $response = $this->post('/sirkulasi/kembali', [
        'barcode_or_id' => $barcode,
        'condition' => 'baik',
        'pay_fine_now' => true,
    ]);

    $response->assertRedirect();
    $response->assertSessionHas('success');

    $freshLoan = $overdueLoan->fresh();
    expect($freshLoan->status)->toBe('kembali');
    expect($freshLoan->fine_status)->toBe('paid');
    expect($freshLoan->fine_paid)->toBeGreaterThan(0);
});

test('attendance kiosk check-in records visitor log', function () {
    $response = $this->post('/presensi/checkin', [
        'identity_number' => 'NIS-2024-001',
        'purpose' => 'Membaca Buku',
    ]);

    $response->assertRedirect();
    $response->assertSessionHas('success');

    $this->assertDatabaseHas('attendance_logs', [
        'identity_number' => 'NIS-2024-001',
        'visitor_name' => 'Muhammad Rizky Pratama',
        'purpose' => 'Membaca Buku',
    ]);
});

test('clearance eligibility check returns true for student without loans and fines', function () {
    $librarian = User::where('role', 'petugas')->first();
    $this->actingAs($librarian);

    $cleanStudent = User::factory()->create([
        'role' => 'anggota',
        'member_type' => 'siswa',
        'identity_number' => 'NIS-CLEAN-001',
    ]);

    $response = $this->getJson("/bebas-pustaka/cek-kelayakan?user_id={$cleanStudent->id}");
    $response->assertStatus(200)
        ->assertJson([
            'success' => true,
            'is_clear' => true,
            'active_loans_count' => 0,
            'unpaid_fines' => 0,
        ]);
});

test('student with active loan is marked not clear for clearance letter', function () {
    $librarian = User::where('role', 'petugas')->first();
    $this->actingAs($librarian);

    $studentWithLoan = User::where('identity_number', 'NIS-2024-003')->first();

    $response = $this->getJson("/bebas-pustaka/cek-kelayakan?user_id={$studentWithLoan->id}");
    $response->assertStatus(200)
        ->assertJson([
            'success' => true,
            'is_clear' => false,
            'active_loans_count' => 1,
        ]);
});

test('user can log out and session is cleared', function () {
    $student = User::where('identity_number', 'NIS-2024-001')->first();
    $this->actingAs($student);

    $response = $this->post('/logout');
    $response->assertRedirect('/login');

    $this->assertGuest();
});
