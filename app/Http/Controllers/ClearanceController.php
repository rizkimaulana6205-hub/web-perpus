<?php

namespace App\Http\Controllers;

use App\Models\ClearanceLetter;
use App\Models\LibrarySetting;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class ClearanceController extends Controller
{
    /**
     * Modul Surat Bebas Pustaka Digital.
     */
    public function index(Request $request): Response
    {
        $letters = ClearanceLetter::with(['user', 'approver'])
            ->latest('issued_at')
            ->paginate(15)
            ->withQueryString();

        $students = User::where('role', 'anggota')
            ->where('member_type', 'siswa')
            ->orderBy('name')
            ->get(['id', 'name', 'identity_number', 'class_name']);

        $setting = LibrarySetting::current();
        $currentUser = Auth::user();

        $myClearance = null;
        if ($currentUser && $currentUser->role === 'anggota') {
            $myClearance = [
                'is_clear' => $currentUser->activeLoans()->count() === 0 && $currentUser->unpaidFinesTotal() === 0,
                'active_loans_count' => $currentUser->activeLoans()->count(),
                'unpaid_fines' => $currentUser->unpaidFinesTotal(),
                'active_loans' => $currentUser->activeLoans()->with('bookCopy.book')->get()->map(fn ($l) => [
                    'title' => $l->bookCopy?->book?->title,
                    'due_date' => $l->due_date->format('d/m/Y'),
                ]),
                'existing_letter' => ClearanceLetter::where('user_id', $currentUser->id)->first(),
            ];
        }

        return Inertia::render('clearance/index', [
            'letters' => $letters,
            'students' => $students,
            'setting' => $setting,
            'myClearance' => $myClearance,
        ]);
    }

    /**
     * Periksa Kelayakan Siswa untuk Penerbitan Surat Bebas Pustaka.
     */
    public function check(Request $request): JsonResponse
    {
        $userId = $request->input('user_id');
        $identity = $request->input('identity_number');

        $user = User::with(['loans' => function ($q) {
            $q->whereIn('status', ['dipinjam', 'terlambat'])->with('bookCopy.book');
        }])
            ->when($userId, fn ($q) => $q->where('id', $userId))
            ->when(! $userId && $identity, fn ($q) => $q->where('identity_number', $identity))
            ->first();

        if (! $user) {
            return response()->json(['success' => false, 'message' => 'Data siswa tidak ditemukan.'], 404);
        }

        $activeLoans = $user->loans;
        $unpaidFines = $user->unpaidFinesTotal();
        $isClear = $activeLoans->isEmpty() && $unpaidFines === 0;

        $existingLetter = ClearanceLetter::where('user_id', $user->id)
            ->where('status', 'valid')
            ->latest('issued_at')
            ->first();

        return response()->json([
            'success' => true,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'identity_number' => $user->identity_number,
                'class_name' => $user->class_name,
            ],
            'is_clear' => $isClear,
            'active_loans_count' => $activeLoans->count(),
            'unpaid_fines' => $unpaidFines,
            'active_loans' => $activeLoans->map(fn ($l) => [
                'title' => $l->bookCopy?->book?->title,
                'due_date' => $l->due_date->format('d/m/Y'),
            ]),
            'existing_letter' => $existingLetter ? [
                'id' => $existingLetter->id,
                'letter_number' => $existingLetter->letter_number,
                'issued_at' => $existingLetter->issued_at->format('d/m/Y'),
            ] : null,
        ]);
    }

    /**
     * Terbitkan Surat Bebas Pustaka Digital.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'notes' => 'nullable|string|max:500',
        ]);

        $user = User::findOrFail($validated['user_id']);

        if ($user->activeLoans()->count() > 0) {
            return back()->with('error', 'Penerbitan gagal: Siswa masih memiliki tanggungan buku pinjaman yang belum dikembalikan.');
        }

        if ($user->unpaidFinesTotal() > 0) {
            return back()->with('error', 'Penerbitan gagal: Siswa masih memiliki tunggakan denda perpustakaan.');
        }

        $year = date('Y');
        $month = date('m');
        $count = ClearanceLetter::whereYear('issued_at', $year)->count() + 1;
        $letterNumber = sprintf('SKBP/PERPUS/%s/%s/%04d', $year, $month, $count);

        $letter = ClearanceLetter::create([
            'letter_number' => $letterNumber,
            'user_id' => $user->id,
            'issued_at' => Carbon::today()->toDateString(),
            'valid_until' => Carbon::today()->addMonths(6)->toDateString(),
            'notes' => $validated['notes'] ?? 'Syarat administrasi kelulusan / mutasi siswa.',
            'status' => 'valid',
            'approved_by' => Auth::id(),
        ]);

        return back()->with('success', "Surat Keterangan Bebas Pustaka ({$letterNumber}) berhasil diterbitkan untuk {$user->name}.");
    }

    /**
     * Tampilan Resmi & Cetak Surat Bebas Pustaka.
     */
    public function show(int $id): Response
    {
        $letter = ClearanceLetter::with(['user', 'approver'])->findOrFail($id);
        $setting = LibrarySetting::current();

        return Inertia::render('clearance/show', [
            'letter' => $letter,
            'setting' => $setting,
        ]);
    }
}
