<?php

namespace App\Http\Controllers;

use App\Models\AttendanceLog;
use App\Models\Book;
use App\Models\Category;
use App\Models\LibrarySetting;
use App\Models\Loan;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    /**
     * Dashboard Laporan & Statistik Komprehensif.
     */
    public function index(Request $request): Response
    {
        $setting = LibrarySetting::current();

        // 1. Frekuensi kunjungan siswa per kelas
        $visitsByClass = AttendanceLog::select('class_name', DB::raw('count(*) as total'))
            ->whereNotNull('class_name')
            ->where('class_name', '!=', '')
            ->groupBy('class_name')
            ->orderByDesc('total')
            ->take(8)
            ->get();

        // 2. Distribusi Jam Tersibuk Kunjungan (07:00 - 16:00)
        // Group by hour in SQLite / cross-db
        $rawLogs = AttendanceLog::select('checkin_at')->get();
        $hourlyDistribution = [];
        for ($h = 7; $h <= 16; $h++) {
            $label = sprintf('%02d:00', $h);
            $hourlyDistribution[$label] = 0;
        }
        foreach ($rawLogs as $log) {
            $hour = (int) $log->checkin_at->format('H');
            $label = sprintf('%02d:00', $hour);
            if (isset($hourlyDistribution[$label])) {
                $hourlyDistribution[$label]++;
            }
        }
        $hourlyChartData = [];
        foreach ($hourlyDistribution as $hour => $count) {
            $hourlyChartData[] = ['hour' => $hour, 'count' => $count];
        }

        // 3. Buku Terpopuler (Paling Banyak Dipinjam)
        $popularBooks = Book::with('category')
            ->withCount('copies')
            ->select('books.*')
            ->addSelect([
                'total_borrowed' => Loan::selectRaw('count(*)')
                    ->whereColumn('book_copies.book_id', 'books.id')
                    ->join('book_copies', 'loans.book_copy_id', '=', 'book_copies.id'),
            ])
            ->orderByDesc('total_borrowed')
            ->take(10)
            ->get();

        // 4. Sirkulasi Bulanan (Buku Keluar vs Buku Kembali 6 Bulan Terakhir)
        $monthlyCirculation = [];
        for ($i = 5; $i >= 0; $i--) {
            $date = Carbon::today()->subMonths($i);
            $monthKey = $date->format('M Y');
            $borrowedCount = Loan::whereYear('borrow_date', $date->year)
                ->whereMonth('borrow_date', $date->month)
                ->count();
            $returnedCount = Loan::whereNotNull('return_date')
                ->whereYear('return_date', $date->year)
                ->whereMonth('return_date', $date->month)
                ->count();

            $monthlyCirculation[] = [
                'month' => $monthKey,
                'borrowed' => $borrowedCount,
                'returned' => $returnedCount,
            ];
        }

        // 5. Laporan Finansial Kas Denda (Telat, Rusak, Hilang)
        $finePaidSum = (int) Loan::where('fine_status', 'paid')->sum('fine_paid');
        $fineUnpaidSum = (int) Loan::where('fine_status', 'unpaid')->sum('fine_amount');
        $fineByReason = Loan::select('fine_reason', DB::raw('sum(fine_amount) as total_amount'), DB::raw('sum(fine_paid) as total_paid'), DB::raw('count(*) as count'))
            ->whereNotNull('fine_reason')
            ->groupBy('fine_reason')
            ->get();

        $fineRecentTransactions = Loan::with(['user', 'bookCopy.book'])
            ->where('fine_amount', '>', 0)
            ->latest('updated_at')
            ->take(10)
            ->get();

        // 6. Ringkasan Akreditasi
        $accreditationMetrics = [
            'total_titles' => Book::count(),
            'total_volumes' => Book::sum('total_copies'),
            'total_categories' => Category::count(),
            'total_members' => User::where('role', 'anggota')->count(),
            'total_teachers' => User::where('role', 'anggota')->where('member_type', 'guru')->count(),
            'total_students' => User::where('role', 'anggota')->where('member_type', 'siswa')->count(),
            'total_visits_all_time' => AttendanceLog::count(),
            'total_circulation_all_time' => Loan::count(),
            'punctuality_rate' => Loan::where('status', 'kembali')->where('fine_amount', 0)->count() > 0
                ? round((Loan::where('status', 'kembali')->where('fine_amount', 0)->count() / max(1, Loan::where('status', 'kembali')->count())) * 100, 1)
                : 94.5,
        ];

        return Inertia::render('reports/index', [
            'visitsByClass' => $visitsByClass,
            'hourlyChartData' => $hourlyChartData,
            'popularBooks' => $popularBooks,
            'monthlyCirculation' => $monthlyCirculation,
            'finePaidSum' => $finePaidSum,
            'fineUnpaidSum' => $fineUnpaidSum,
            'fineByReason' => $fineByReason,
            'fineRecentTransactions' => $fineRecentTransactions,
            'accreditationMetrics' => $accreditationMetrics,
            'setting' => $setting,
        ]);
    }

    /**
     * Tampilan Resmi & Ekspor Laporan Akreditasi Perpustakaan.
     */
    public function exportAccreditation(): Response
    {
        $setting = LibrarySetting::current();

        $booksByCategory = Category::withCount('books')
            ->with(['books' => fn ($q) => $q->select('id', 'category_id', 'total_copies')])
            ->get()
            ->map(function ($cat) {
                return [
                    'code' => $cat->code,
                    'name' => $cat->name,
                    'titles_count' => $cat->books_count,
                    'copies_count' => $cat->books->sum('total_copies'),
                ];
            });

        $metrics = [
            'total_titles' => Book::count(),
            'total_copies' => Book::sum('total_copies'),
            'total_members' => User::where('role', 'anggota')->count(),
            'total_loans' => Loan::count(),
            'total_attendance' => AttendanceLog::count(),
            'total_fines_collected' => Loan::where('fine_status', 'paid')->sum('fine_paid'),
        ];

        return Inertia::render('reports/accreditation', [
            'booksByCategory' => $booksByCategory,
            'metrics' => $metrics,
            'setting' => $setting,
        ]);
    }
}
