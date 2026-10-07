<?php

namespace App\Http\Controllers;

use App\Models\LibrarySetting;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class AuthController extends Controller
{
    /**
     * Tampilkan Halaman Login Resmi.
     */
    public function showLogin(): Response|RedirectResponse
    {
        if (Auth::check()) {
            $user = Auth::user();
            $targetUrl = match ($user->role) {
                'super_admin' => route('reports.index'),
                'petugas' => route('circulation.index'),
                default => route('loans.my_loans'),
            };

            return redirect($targetUrl);
        }

        $setting = LibrarySetting::current();

        return Inertia::render('auth/login', [
            'setting' => $setting,
        ]);
    }

    /**
     * Tampilkan Halaman Pendaftaran Anggota Baru (Siswa & Guru).
     */
    public function showRegister(): Response|RedirectResponse
    {
        if (Auth::check()) {
            $user = Auth::user();
            $targetUrl = match ($user->role) {
                'super_admin' => route('reports.index'),
                'petugas' => route('circulation.index'),
                default => route('loans.my_loans'),
            };

            return redirect($targetUrl);
        }

        $setting = LibrarySetting::current();

        return Inertia::render('auth/register', [
            'setting' => $setting,
        ]);
    }

    /**
     * Proses Pendaftaran Mandiri Anggota Baru (Siswa & Guru).
     */
    public function register(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'member_type' => 'required|string|in:siswa,guru',
            'identity_number' => 'required|string|max:50|unique:users,identity_number',
            'class_name' => 'nullable|string|max:50',
            'email' => 'required|string|email|max:255|unique:users,email',
            'phone' => 'nullable|string|max:20',
            'password' => 'required|string|min:6|confirmed',
        ], [
            'name.required' => 'Nama lengkap wajib diisi.',
            'member_type.required' => 'Pilih jenis keanggotaan (Siswa atau Guru).',
            'identity_number.required' => 'Nomor Identitas (NIS / NIP) wajib diisi.',
            'identity_number.unique' => 'Nomor identitas tersebut sudah terdaftar dalam sistem.',
            'email.required' => 'Alamat email wajib diisi.',
            'email.email' => 'Format email tidak valid.',
            'email.unique' => 'Email tersebut sudah digunakan oleh akun lain.',
            'password.required' => 'Kata sandi wajib diisi.',
            'password.min' => 'Kata sandi minimal 6 karakter.',
            'password.confirmed' => 'Konfirmasi kata sandi tidak cocok.',
        ]);

        $setting = LibrarySetting::current();
        $isTeacher = $validated['member_type'] === 'guru';
        $maxLoanLimit = $isTeacher ? ($setting->max_loan_guru ?? 5) : ($setting->max_loan_siswa ?? 3);

        $user = User::create([
            'name' => trim($validated['name']),
            'email' => strtolower(trim($validated['email'])),
            'password' => $validated['password'],
            'role' => 'anggota',
            'member_type' => $validated['member_type'],
            'identity_number' => strtoupper(trim($validated['identity_number'])),
            'class_name' => $isTeacher ? null : (! empty($validated['class_name']) ? trim($validated['class_name']) : null),
            'phone' => ! empty($validated['phone']) ? trim($validated['phone']) : null,
            'max_loan_limit' => $maxLoanLimit,
            'status' => 'aktif',
        ]);

        Auth::login($user);
        $request->session()->regenerate();

        return redirect()->route('loans.my_loans')->with('success', "Pendaftaran berhasil! Selamat datang, {$user->name}. Akun keanggotaan Anda telah aktif.");
    }

    /**
     * Proses Login Pengguna (Berdasarkan Email atau NIS/NIP).
     */
    public function login(Request $request): RedirectResponse
    {
        $request->validate([
            'identity' => 'required|string',
            'password' => 'required|string',
        ], [
            'identity.required' => 'Masukkan alamat email atau nomor identitas (NIS / NIP / NIK).',
            'password.required' => 'Kata sandi wajib diisi.',
        ]);

        $identity = trim($request->input('identity'));
        $password = $request->input('password');
        $remember = $request->boolean('remember');

        $field = filter_var($identity, FILTER_VALIDATE_EMAIL) ? 'email' : 'identity_number';

        if (Auth::attempt([$field => $identity, 'password' => $password], $remember)) {
            $request->session()->regenerate();
            $user = Auth::user();

            $roleLabel = match ($user->role) {
                'super_admin' => 'Kepala Perpustakaan',
                'petugas' => 'Petugas Sirkulasi',
                'anggota' => 'Anggota ('.ucfirst($user->member_type).')',
                default => 'Pengunjung',
            };

            $targetUrl = match ($user->role) {
                'super_admin' => route('reports.index'),
                'petugas' => route('circulation.index'),
                default => route('loans.my_loans'),
            };

            return redirect()->intended($targetUrl)->with('success', "Selamat datang, {$user->name}! Masuk sebagai {$roleLabel}.");
        }

        return back()->withErrors([
            'identity' => 'Identitas (Email/NIS/NIP) atau kata sandi tidak cocok.',
        ])->withInput($request->only('identity', 'remember'));
    }

    /**
     * Switch demo user role for testing and review.
     */
    public function switchRole(Request $request, string $role): RedirectResponse
    {
        $targetUser = match ($role) {
            'super_admin' => User::where('role', 'super_admin')->first(),
            'petugas' => User::where('role', 'petugas')->first(),
            'siswa', 'anggota' => User::where('role', 'anggota')->where('member_type', 'siswa')->first(),
            'guru' => User::where('role', 'anggota')->where('member_type', 'guru')->first(),
            'tamu' => User::where('role', 'tamu')->first(),
            default => null,
        };

        if ($targetUser) {
            Auth::login($targetUser);
            $roleLabel = match ($targetUser->role) {
                'super_admin' => 'Kepala Perpustakaan (Super Admin)',
                'petugas' => 'Petugas Sirkulasi (Pustakawan)',
                'anggota' => 'Anggota Perpustakaan ('.ucfirst($targetUser->member_type).')',
                'tamu' => 'Tamu / Pengunjung Umum',
                default => $targetUser->role,
            };

            return back()->with('success', "Beralih peran aktif sebagai: {$targetUser->name} [{$roleLabel}]");
        }

        return back()->with('error', 'Akun demo peran tersebut tidak ditemukan.');
    }

    /**
     * Log out current session.
     */
    public function logout(Request $request): RedirectResponse
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login')->with('info', 'Anda telah berhasil keluar.');
    }
}
