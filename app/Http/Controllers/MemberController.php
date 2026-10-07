<?php

namespace App\Http\Controllers;

use App\Models\LibrarySetting;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class MemberController extends Controller
{
    /**
     * Direktori Keanggotaan Perpustakaan (Siswa, Guru, Staf).
     */
    public function index(Request $request): Response
    {
        $query = User::withCount(['loans' => function ($q) {
            $q->whereIn('status', ['dipinjam', 'terlambat']);
        }]);

        if ($type = $request->input('type')) {
            $query->where('member_type', $type);
        }

        if ($search = $request->input('q')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('identity_number', 'like', "%{$search}%")
                    ->orWhere('class_name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $members = $query->latest()->paginate(15)->withQueryString();

        $stats = [
            'total_members' => User::where('role', 'anggota')->count(),
            'total_students' => User::where('role', 'anggota')->where('member_type', 'siswa')->count(),
            'total_teachers' => User::where('role', 'anggota')->where('member_type', 'guru')->count(),
            'total_staff' => User::whereIn('role', ['petugas', 'super_admin'])->count(),
        ];

        return Inertia::render('members/index', [
            'members' => $members,
            'filters' => [
                'type' => (string) $request->input('type', ''),
                'q' => (string) $request->input('q', ''),
            ],
            'stats' => $stats,
        ]);
    }

    /**
     * Tambah Anggota Baru secara Manual.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'member_type' => 'required|in:siswa,guru,staf,umum',
            'identity_number' => 'required|string|unique:users,identity_number',
            'phone' => 'nullable|string|max:50',
            'class_name' => 'nullable|string|max:100',
            'address' => 'nullable|string|max:500',
        ]);

        $maxLimit = match ($validated['member_type']) {
            'guru' => 5,
            'staf' => 5,
            'umum' => 0,
            default => 3,
        };

        User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make('password'),
            'role' => $validated['member_type'] === 'umum' ? 'tamu' : 'anggota',
            'member_type' => $validated['member_type'],
            'identity_number' => $validated['identity_number'],
            'phone' => $validated['phone'] ?? null,
            'class_name' => $validated['class_name'] ?? null,
            'address' => $validated['address'] ?? null,
            'max_loan_limit' => $maxLimit,
            'status' => 'active',
        ]);

        return back()->with('success', "Anggota baru {$validated['name']} ({$validated['identity_number']}) berhasil didaftarkan.");
    }

    /**
     * Impor Massal Data Siswa / Guru (Simulasi Impor CSV Dapodik / Excel).
     */
    public function import(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'csv_data' => 'required|string',
            'default_type' => 'required|in:siswa,guru',
        ]);

        $lines = preg_split('/\r\n|\r|\n/', trim($validated['csv_data']));
        $importedCount = 0;

        foreach ($lines as $index => $line) {
            if ($index === 0 && str_contains(strtolower($line), 'nama')) {
                // Header line, skip
                continue;
            }

            $cols = str_getcsv($line, ',');
            if (count($cols) < 2) {
                $cols = str_getcsv($line, ';');
            }

            if (count($cols) >= 2) {
                $identity = trim($cols[0]);
                $name = trim($cols[1]);
                $className = isset($cols[2]) ? trim($cols[2]) : ($validated['default_type'] === 'siswa' ? 'X MIPA 1' : 'Guru Mapel');
                $email = isset($cols[3]) && filter_var(trim($cols[3]), FILTER_VALIDATE_EMAIL)
                    ? trim($cols[3])
                    : strtolower(preg_replace('/[^a-zA-Z0-9]/', '', $identity)).'@perpustakaan.sch.id';

                if (! User::where('identity_number', $identity)->orWhere('email', $email)->exists()) {
                    User::create([
                        'name' => $name,
                        'email' => $email,
                        'password' => Hash::make('password'),
                        'role' => 'anggota',
                        'member_type' => $validated['default_type'],
                        'identity_number' => $identity,
                        'class_name' => $className,
                        'max_loan_limit' => $validated['default_type'] === 'guru' ? 5 : 3,
                        'status' => 'active',
                    ]);
                    $importedCount++;
                }
            }
        }

        return back()->with('success', "Sinkronisasi selesai! Berhasil mengimpor {$importedCount} data anggota ke sistem perpustakaan.");
    }

    /**
     * Cetak Kartu Anggota Digital dengan Barcode.
     */
    public function card(int $id): Response
    {
        $member = User::findOrFail($id);
        $setting = LibrarySetting::current();

        return Inertia::render('members/card', [
            'member' => $member,
            'setting' => $setting,
        ]);
    }
}
