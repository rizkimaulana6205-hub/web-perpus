<?php

namespace App\Http\Controllers;

use App\Models\BookCopy;
use App\Models\LibrarySetting;
use App\Models\Loan;
use App\Models\Reservation;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class CirculationController extends Controller
{
    /**
     * Dashboard Modul Sirkulasi (Peminjaman & Pengembalian).
     */
    public function index(Request $request): Response
    {
        $setting = LibrarySetting::current();

        $activeLoans = Loan::with(['user', 'bookCopy.book', 'librarian'])
            ->whereIn('status', ['dipinjam', 'terlambat'])
            ->latest('borrow_date')
            ->paginate(10, ['*'], 'active_page')
            ->withQueryString();

        // Update overdue status dynamically
        $today = Carbon::today();
        foreach ($activeLoans->items() as $loan) {
            if ($loan->due_date < $today && $loan->status === 'dipinjam') {
                $loan->update([
                    'status' => 'terlambat',
                    'fine_amount' => $loan->calculateFine($setting->daily_fine_rate),
                    'fine_status' => 'unpaid',
                    'fine_reason' => 'terlambat',
                ]);
            }
        }

        $completedLoans = Loan::with(['user', 'bookCopy.book', 'librarian'])
            ->whereIn('status', ['kembali', 'hilang'])
            ->latest('return_date')
            ->paginate(10, ['*'], 'history_page')
            ->withQueryString();

        $reservations = Reservation::with(['book', 'user'])
            ->where('status', 'pending')
            ->orderBy('queue_position')
            ->get();

        $stats = [
            'total_active' => Loan::whereIn('status', ['dipinjam', 'terlambat'])->count(),
            'total_overdue' => Loan::where('status', 'terlambat')->count(),
            'total_returned_this_month' => Loan::where('status', 'kembali')
                ->whereMonth('return_date', Carbon::today()->month)
                ->count(),
            'unpaid_fines_sum' => (int) Loan::where('fine_status', 'unpaid')->sum('fine_amount'),
            'daily_fine_rate' => $setting->daily_fine_rate,
            'loan_duration_days' => $setting->loan_duration_days,
        ];

        return Inertia::render('circulation/index', [
            'activeLoans' => $activeLoans,
            'completedLoans' => $completedLoans,
            'reservations' => $reservations,
            'stats' => $stats,
            'setting' => $setting,
        ]);
    }

    /**
     * Fast Scan Lookup: Scan Card (NIS / NIP / Member Code).
     */
    public function lookupMember(Request $request): JsonResponse
    {
        $code = trim((string) $request->input('code'));
        if (! $code) {
            return response()->json(['success' => false, 'message' => 'Kode kartu / NIS tidak boleh kosong.'], 400);
        }

        $user = User::with(['loans' => function ($q) {
            $q->whereIn('status', ['dipinjam', 'terlambat'])->with('bookCopy.book');
        }])
            ->where('identity_number', $code)
            ->orWhere('id', is_numeric($code) ? (int) $code : 0)
            ->orWhere('email', $code)
            ->first();

        if (! $user) {
            return response()->json([
                'success' => false,
                'message' => "Anggota dengan kode/NIS '{$code}' tidak ditemukan di database.",
            ], 404);
        }

        $eligibility = $user->eligibilityForBorrowing();

        return response()->json([
            'success' => true,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'identity_number' => $user->identity_number,
                'role' => $user->role,
                'member_type' => $user->member_type,
                'class_name' => $user->class_name,
                'max_loan_limit' => $user->max_loan_limit,
                'active_loans_count' => $user->loans->count(),
                'unpaid_fines' => $user->unpaidFinesTotal(),
                'active_loans' => $user->loans->map(fn ($l) => [
                    'id' => $l->id,
                    'loan_code' => $l->loan_code,
                    'book_title' => $l->bookCopy?->book?->title,
                    'barcode' => $l->bookCopy?->barcode,
                    'borrow_date' => $l->borrow_date->format('d/m/Y'),
                    'due_date' => $l->due_date->format('d/m/Y'),
                    'is_overdue' => Carbon::today()->greaterThan($l->due_date),
                ]),
            ],
            'eligibility' => $eligibility,
        ]);
    }

    /**
     * Fast Scan Lookup: Scan Book Barcode.
     */
    public function lookupBookCopy(Request $request): JsonResponse
    {
        $barcode = trim((string) $request->input('barcode'));
        if (! $barcode) {
            return response()->json(['success' => false, 'message' => 'Barcode buku tidak boleh kosong.'], 400);
        }

        $copy = BookCopy::with('book.category')->where('barcode', $barcode)->first();
        if (! $copy) {
            return response()->json([
                'success' => false,
                'message' => "Eksemplar buku dengan barcode '{$barcode}' tidak ditemukan.",
            ], 404);
        }

        // Active loan if borrowed
        $activeLoan = null;
        if ($copy->status !== 'tersedia') {
            $activeLoan = Loan::with('user')
                ->where('book_copy_id', $copy->id)
                ->whereIn('status', ['dipinjam', 'terlambat'])
                ->first();
        }

        $setting = LibrarySetting::current();
        $calculatedFine = 0;
        $daysOverdue = 0;
        if ($activeLoan) {
            $daysOverdue = $activeLoan->getDaysOverdue();
            $calculatedFine = $activeLoan->calculateFine($setting->daily_fine_rate);
        }

        return response()->json([
            'success' => true,
            'copy' => [
                'id' => $copy->id,
                'barcode' => $copy->barcode,
                'call_number' => $copy->call_number,
                'condition' => $copy->condition,
                'status' => $copy->status,
                'book' => [
                    'id' => $copy->book->id,
                    'title' => $copy->book->title,
                    'author' => $copy->book->author,
                    'publisher' => $copy->book->publisher,
                    'isbn' => $copy->book->isbn,
                    'rack_location' => $copy->book->rack_location,
                    'cover_image' => $copy->book->cover_image,
                ],
            ],
            'active_loan' => $activeLoan ? [
                'id' => $activeLoan->id,
                'loan_code' => $activeLoan->loan_code,
                'borrower_name' => $activeLoan->user->name,
                'borrower_identity' => $activeLoan->user->identity_number,
                'borrow_date' => $activeLoan->borrow_date->format('d/m/Y'),
                'due_date' => $activeLoan->due_date->format('d/m/Y'),
                'days_overdue' => $daysOverdue,
                'calculated_fine' => $calculatedFine,
            ] : null,
        ]);
    }

    /**
     * Catat Transaksi Peminjaman (Validasi Petugas & Barcode Buku).
     */
    public function borrow(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'book_copy_barcode' => 'required|string',
            'notes' => 'nullable|string|max:500',
        ]);

        $user = User::findOrFail($validated['user_id']);
        $eligibility = $user->eligibilityForBorrowing();
        if (! $eligibility['allowed']) {
            return back()->with('error', 'Validasi gagal: '.$eligibility['reason']);
        }

        $copy = BookCopy::where('barcode', $validated['book_copy_barcode'])->first();
        if (! $copy) {
            return back()->with('error', "Barcode buku '{$validated['book_copy_barcode']}' tidak ditemukan.");
        }

        if ($copy->status !== 'tersedia') {
            return back()->with('error', "Eksemplar buku ini tidak tersedia untuk dipinjam (Status saat ini: {$copy->status}).");
        }

        $setting = LibrarySetting::current();
        $borrowDate = Carbon::today();
        $dueDate = $borrowDate->copy()->addDays($setting->loan_duration_days);

        $loanCode = 'PJ-'.date('Ym').'-'.str_pad((string) (Loan::count() + 1), 4, '0', STR_PAD_LEFT);

        $loan = Loan::create([
            'loan_code' => $loanCode,
            'user_id' => $user->id,
            'book_copy_id' => $copy->id,
            'librarian_id' => Auth::id(),
            'borrow_date' => $borrowDate->toDateString(),
            'due_date' => $dueDate->toDateString(),
            'status' => 'dipinjam',
            'renewed_count' => 0,
            'fine_amount' => 0,
            'fine_paid' => 0,
            'fine_status' => 'none',
            'notes' => $validated['notes'] ?? null,
        ]);

        $copy->update(['status' => 'dipinjam']);
        $copy->book?->syncCopiesCount();

        // Check if there was a reservation by this user for this book, mark fulfilled
        Reservation::where('book_id', $copy->book_id)
            ->where('user_id', $user->id)
            ->where('status', 'pending')
            ->update(['status' => 'fulfilled']);

        return back()->with('success', "Peminjaman berhasil dicatat! Kode: {$loanCode} | Batas pengembalian: {$dueDate->format('d M Y')}.");
    }

    /**
     * Catat Transaksi Pengembalian & Kalkulasi Denda.
     */
    public function returnBook(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'barcode_or_id' => 'required|string',
            'condition' => 'required|in:baik,rusak_ringan,rusak_berat,hilang',
            'pay_fine_now' => 'nullable|boolean',
            'additional_damage_fine' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string|max:500',
        ]);

        $query = $validated['barcode_or_id'];

        // Find active loan either by barcode or loan_code
        $loan = Loan::with(['bookCopy.book', 'user'])
            ->whereIn('status', ['dipinjam', 'terlambat'])
            ->where(function ($q) use ($query) {
                $q->where('loan_code', $query)
                    ->orWhereHas('bookCopy', function ($cq) use ($query) {
                        $cq->where('barcode', $query);
                    });
            })
            ->first();

        if (! $loan) {
            return back()->with('error', "Tidak ditemukan data peminjaman aktif untuk barcode/kode '{$query}'.");
        }

        $setting = LibrarySetting::current();
        $returnDate = Carbon::today();
        $daysOverdue = $loan->due_date->lessThan($returnDate) ? $loan->due_date->diffInDays($returnDate) : 0;
        $lateFine = $daysOverdue * $setting->daily_fine_rate;
        $damageFine = (int) ($validated['additional_damage_fine'] ?? 0);
        $totalFine = $lateFine + $damageFine;

        $finePaid = 0;
        $fineStatus = 'none';
        if ($totalFine > 0) {
            $isPaid = ! empty($validated['pay_fine_now']);
            $finePaid = $isPaid ? $totalFine : 0;
            $fineStatus = $isPaid ? 'paid' : 'unpaid';
        }

        $condition = $validated['condition'];
        $copyStatus = match ($condition) {
            'rusak_ringan', 'rusak_berat' => 'pemeliharaan',
            'hilang' => 'hilang',
            default => 'tersedia',
        };

        $loan->update([
            'return_date' => $returnDate->toDateString(),
            'status' => $condition === 'hilang' ? 'hilang' : 'kembali',
            'fine_amount' => $totalFine,
            'fine_paid' => $finePaid,
            'fine_status' => $fineStatus,
            'fine_reason' => $totalFine > 0 ? ($daysOverdue > 0 ? 'terlambat' : $condition) : null,
            'notes' => $validated['notes'] ?? $loan->notes,
        ]);

        $loan->bookCopy?->update([
            'condition' => $condition,
            'status' => $copyStatus,
        ]);
        $loan->bookCopy?->book?->syncCopiesCount();

        $msg = "Pengembalian buku '{$loan->bookCopy?->book?->title}' berhasil diproses.";
        if ($totalFine > 0) {
            $fineFormatted = 'Rp '.number_format($totalFine, 0, ',', '.');
            if ($finePaid > 0) {
                $msg .= " Denda keterlambatan/kondisi ({$fineFormatted}) telah diterima dan lunas.";
            } else {
                $msg .= " Tercatat denda tertunggak ({$fineFormatted}) yang belum dibayar oleh peminjam.";
            }
        }

        return back()->with('success', $msg);
    }

    /**
     * Perpanjangan Mandiri (1x Online oleh Siswa/Guru sebelum Jatuh Tempo).
     */
    public function renew(int $id): RedirectResponse
    {
        $loan = Loan::with('bookCopy')->findOrFail($id);

        $renewalCheck = $loan->canBeRenewed();
        if (! $renewalCheck['allowed']) {
            return back()->with('error', 'Perpanjangan ditolak: '.$renewalCheck['reason']);
        }

        $setting = LibrarySetting::current();
        $newDueDate = $loan->due_date->copy()->addDays($setting->loan_duration_days);

        $loan->update([
            'due_date' => $newDueDate->toDateString(),
            'renewed_count' => $loan->renewed_count + 1,
            'notes' => ($loan->notes ? $loan->notes.' | ' : '').'Diperpanjang mandiri 1x pada '.Carbon::today()->format('d/m/Y'),
        ]);

        return back()->with('success', "Masa pinjam berhasil diperpanjang 1 kali (+{$setting->loan_duration_days} hari). Jatuh tempo baru: {$newDueDate->format('d M Y')}.");
    }

    /**
     * Terima Pembayaran Denda Tertunggak di Meja Sirkulasi.
     */
    public function payFine(int $id): RedirectResponse
    {
        $loan = Loan::findOrFail($id);
        if ($loan->fine_status === 'paid') {
            return back()->with('info', 'Denda pada transaksi ini sudah lunas sebelumnya.');
        }

        $loan->update([
            'fine_paid' => $loan->fine_amount,
            'fine_status' => 'paid',
        ]);

        $amountFormatted = 'Rp '.number_format($loan->fine_amount, 0, ',', '.');

        return back()->with('success', "Pembayaran denda sebesar {$amountFormatted} berhasil diterima dan status telah lunas.");
    }

    /**
     * Dashboard Khusus Anggota (Siswa / Guru): Pinjaman Saya, Riwayat & Reservasi.
     */
    public function myLoans(Request $request): Response|RedirectResponse
    {
        $user = Auth::user();
        if (! $user) {
            return redirect()->route('login');
        }

        $activeLoans = Loan::with(['bookCopy.book.category'])
            ->where('user_id', $user->id)
            ->whereIn('status', ['dipinjam', 'terlambat'])
            ->latest('borrow_date')
            ->get();

        $historyLoans = Loan::with(['bookCopy.book.category'])
            ->where('user_id', $user->id)
            ->where('status', 'kembali')
            ->latest('return_date')
            ->paginate(10)
            ->withQueryString();

        $reservations = Reservation::with(['book.category'])
            ->where('user_id', $user->id)
            ->where('status', 'pending')
            ->latest()
            ->get();

        $stats = [
            'active_count' => $activeLoans->count(),
            'overdue_count' => $activeLoans->where('status', 'terlambat')->count(),
            'unpaid_fines' => $user->unpaidFinesTotal(),
            'max_limit' => $user->max_loan_limit,
            'remaining_quota' => max(0, $user->max_loan_limit - $activeLoans->count()),
        ];

        return Inertia::render('loans/my_loans', [
            'activeLoans' => $activeLoans,
            'historyLoans' => $historyLoans,
            'reservations' => $reservations,
            'stats' => $stats,
        ]);
    }
}
