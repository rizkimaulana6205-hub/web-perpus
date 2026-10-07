<?php

use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\BookManagementController;
use App\Http\Controllers\CirculationController;
use App\Http\Controllers\ClearanceController;
use App\Http\Controllers\MemberController;
use App\Http\Controllers\OpacController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\SettingController;
use Illuminate\Support\Facades\Route;

// Main OPAC Landing Page (Public / Tamu)
Route::get('/', [OpacController::class, 'index'])->name('home');

// Auth Routes (Login, Logout, Role Demo Switcher, Registration)
Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
Route::post('/login', [AuthController::class, 'login'])->name('auth.login');
Route::get('/daftar', [AuthController::class, 'showRegister'])->name('register');
Route::post('/daftar', [AuthController::class, 'register'])->name('auth.register');
Route::post('/logout', [AuthController::class, 'logout'])->name('auth.logout');
Route::post('/demo-switch/{role}', [AuthController::class, 'switchRole'])->name('auth.demo_switch');

// Modul A: Katalog (OPAC - Online Public Access Catalog)
Route::prefix('katalog')->name('opac.')->group(function () {
    Route::get('/', [OpacController::class, 'index'])->name('index');
    Route::get('/buku/{id}', [OpacController::class, 'show'])->name('show');
    Route::get('/informasi-dan-tata-tertib', [OpacController::class, 'rules'])->name('rules');

    // Actions requiring authentication (Anggota / Staf)
    Route::middleware('auth')->group(function () {
        Route::post('/buku/{id}/reservasi', [OpacController::class, 'reserve'])->name('reserve');
        Route::post('/usulkan-buku', [OpacController::class, 'suggest'])->name('suggest');
    });
});

// Modul Khusus Anggota (Siswa & Guru)
Route::middleware(['auth', 'role:anggota,petugas,super_admin'])->group(function () {
    Route::get('/peminjaman-saya', [CirculationController::class, 'myLoans'])->name('loans.my_loans');
    Route::post('/sirkulasi/{id}/perpanjang', [CirculationController::class, 'renew'])->name('circulation.renew');
});

// Modul B: Meja Sirkulasi (Pustakawan / Petugas & Super Admin)
Route::prefix('sirkulasi')->name('circulation.')->middleware(['auth', 'role:petugas,super_admin'])->group(function () {
    Route::get('/', [CirculationController::class, 'index'])->name('index');
    Route::get('/lookup-member', [CirculationController::class, 'lookupMember'])->name('lookup_member');
    Route::get('/lookup-book', [CirculationController::class, 'lookupBookCopy'])->name('lookup_book');
    Route::post('/pinjam', [CirculationController::class, 'borrow'])->name('borrow');
    Route::post('/kembali', [CirculationController::class, 'returnBook'])->name('return');
    Route::post('/{id}/bayar-denda', [CirculationController::class, 'payFine'])->name('pay_fine');
});

// Modul C: Keanggotaan & Presensi (Buku Tamu Digital)
Route::prefix('presensi')->name('attendance.')->group(function () {
    // Kiosk is public / kiosk screen at entrance
    Route::get('/kiosk', [AttendanceController::class, 'kiosk'])->name('kiosk');
    Route::post('/checkin', [AttendanceController::class, 'checkin'])->name('checkin');

    // Log Rekapitulasi (Petugas & Super Admin)
    Route::middleware(['auth', 'role:petugas,super_admin'])->group(function () {
        Route::get('/rekap', [AttendanceController::class, 'index'])->name('index');
    });
});

Route::prefix('anggota')->name('members.')->middleware(['auth', 'role:petugas,super_admin'])->group(function () {
    Route::get('/', [MemberController::class, 'index'])->name('index');
    Route::post('/', [MemberController::class, 'store'])->name('store');
    Route::post('/impor-massal', [MemberController::class, 'import'])->name('import');
    Route::get('/{id}/cetak-kartu', [MemberController::class, 'card'])->name('card');
});

// Surat Bebas Pustaka Digital
Route::prefix('bebas-pustaka')->name('clearance.')->group(function () {
    Route::middleware(['auth', 'role:anggota,petugas,super_admin'])->group(function () {
        Route::get('/', [ClearanceController::class, 'index'])->name('index');
    });

    Route::middleware(['auth', 'role:petugas,super_admin'])->group(function () {
        Route::get('/cek-kelayakan', [ClearanceController::class, 'check'])->name('check');
        Route::post('/terbitkan', [ClearanceController::class, 'store'])->name('store');
    });

    // Public / Print Certificate (QR Verification accessible)
    Route::get('/{id}/cetak', [ClearanceController::class, 'show'])->name('show');
});

// Modul Manajemen Buku & Generator Barcode Label (Petugas & Super Admin)
Route::prefix('kelola-buku')->name('books.')->middleware(['auth', 'role:petugas,super_admin'])->group(function () {
    Route::get('/', [BookManagementController::class, 'index'])->name('index');
    Route::post('/', [BookManagementController::class, 'store'])->name('store');
    Route::put('/{id}', [BookManagementController::class, 'update'])->name('update');
    Route::delete('/{id}', [BookManagementController::class, 'destroy'])->name('destroy');
    Route::get('/cetak-barcode-label', [BookManagementController::class, 'printBarcodes'])->name('barcodes');
});

// Modul D: Laporan & Statistik (Super Admin / Kepala Perpustakaan)
Route::prefix('laporan')->name('reports.')->middleware(['auth', 'role:super_admin'])->group(function () {
    Route::get('/', [ReportController::class, 'index'])->name('index');
    Route::get('/akreditasi', [ReportController::class, 'exportAccreditation'])->name('accreditation');
});

// Tata Kelola & Pengaturan (Super Admin / Kepala Perpustakaan)
Route::prefix('pengaturan')->name('settings.')->middleware(['auth', 'role:super_admin'])->group(function () {
    Route::get('/', [SettingController::class, 'index'])->name('index');
    Route::put('/', [SettingController::class, 'update'])->name('update');
    Route::post('/staf', [SettingController::class, 'storeStaff'])->name('store_staff');
    Route::patch('/usulan/{id}', [SettingController::class, 'updateSuggestion'])->name('update_suggestion');
});
