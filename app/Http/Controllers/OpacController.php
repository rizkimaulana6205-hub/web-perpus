<?php

namespace App\Http\Controllers;

use App\Models\Book;
use App\Models\BookSuggestion;
use App\Models\Category;
use App\Models\LibrarySetting;
use App\Models\Reservation;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class OpacController extends Controller
{
    /**
     * OPAC Online Public Access Catalog - Search & Browsing.
     */
    public function index(Request $request): Response
    {
        $query = Book::with(['category', 'copies'])
            ->withCount(['reservations as pending_reservations_count' => function ($q) {
                $q->where('status', 'pending');
            }]);

        if ($search = $request->input('q')) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('author', 'like', "%{$search}%")
                    ->orWhere('publisher', 'like', "%{$search}%")
                    ->orWhere('isbn', 'like', "%{$search}%")
                    ->orWhere('ddc_code', 'like', "%{$search}%")
                    ->orWhere('synopsis', 'like', "%{$search}%");
            });
        }

        if ($categoryId = $request->input('category_id')) {
            $query->where('category_id', $categoryId);
        }

        if ($ddc = $request->input('ddc')) {
            $query->where('ddc_code', 'like', "{$ddc}%");
        }

        if ($request->input('availability') === 'available') {
            $query->where('available_copies', '>', 0);
        }

        $sort = $request->input('sort', 'latest');
        match ($sort) {
            'title_asc' => $query->orderBy('title', 'asc'),
            'title_desc' => $query->orderBy('title', 'desc'),
            'year_desc' => $query->orderBy('publication_year', 'desc'),
            'popular' => $query->withCount('copies')->orderBy('total_copies', 'desc'),
            default => $query->latest(),
        };

        $books = $query->paginate(12)->withQueryString();

        $categories = Category::withCount('books')->orderBy('code')->get();

        $stats = [
            'total_titles' => Book::count(),
            'total_copies' => Book::sum('total_copies'),
            'available_copies' => Book::sum('available_copies'),
            'categories_count' => Category::count(),
        ];

        return Inertia::render('opac/index', [
            'books' => $books,
            'categories' => $categories,
            'filters' => [
                'q' => (string) $request->input('q', ''),
                'category_id' => (string) $request->input('category_id', ''),
                'ddc' => (string) $request->input('ddc', ''),
                'availability' => (string) $request->input('availability', ''),
                'sort' => (string) $request->input('sort', 'latest'),
            ],
            'stats' => $stats,
        ]);
    }

    /**
     * Detail Buku Komprehensif (Sinopsis, Rak, Eksemplar, Preview Daftar Isi).
     */
    public function show(int $id): Response
    {
        $book = Book::with([
            'category',
            'copies' => function ($q) {
                $q->orderBy('barcode');
            },
            'reservations' => function ($q) {
                $q->where('status', 'pending')->with('user:id,name,class_name');
            },
        ])->findOrFail($id);

        $currentUser = Auth::user();
        $userReservation = null;
        if ($currentUser) {
            $userReservation = Reservation::where('book_id', $book->id)
                ->where('user_id', $currentUser->id)
                ->where('status', 'pending')
                ->first();
        }

        $relatedBooks = Book::where('category_id', $book->category_id)
            ->where('id', '!=', $book->id)
            ->take(4)
            ->get();

        return Inertia::render('opac/show', [
            'book' => $book,
            'userReservation' => $userReservation,
            'relatedBooks' => $relatedBooks,
        ]);
    }

    /**
     * Reservasi / Booking Buku yang sedang dipinjam.
     */
    public function reserve(Request $request, int $id): RedirectResponse
    {
        $user = Auth::user();
        if (! $user) {
            return back()->with('error', 'Silakan masuk atau pilih profil Anggota untuk melakukan booking buku.');
        }

        if ($user->role === 'tamu') {
            return back()->with('error', 'Pengunjung tamu hanya memiliki akses melihat katalog. Daftar sebagai anggota untuk meminjam atau booking.');
        }

        $book = Book::findOrFail($id);

        // Check if user already reserved this book
        $existing = Reservation::where('book_id', $book->id)
            ->where('user_id', $user->id)
            ->where('status', 'pending')
            ->first();

        if ($existing) {
            return back()->with('error', "Anda sudah berada dalam antrean reservasi untuk buku ini (Antrean urutan ke-{$existing->queue_position}).");
        }

        $queuePosition = Reservation::where('book_id', $book->id)
            ->where('status', 'pending')
            ->count() + 1;

        Reservation::create([
            'book_id' => $book->id,
            'user_id' => $user->id,
            'reservation_date' => Carbon::today()->toDateString(),
            'status' => 'pending',
            'queue_position' => $queuePosition,
            'expires_at' => Carbon::today()->addDays(7)->endOfDay(),
        ]);

        return back()->with('success', "Reservasi buku berhasil dicatat! Anda terdaftar pada nomor antrean ke-{$queuePosition}. Petugas akan mengabari saat buku tersedia.");
    }

    /**
     * Submit Usulan Buku Baru oleh Siswa/Guru.
     */
    public function suggest(Request $request): RedirectResponse
    {
        $user = Auth::user();
        if (! $user || $user->role === 'tamu') {
            return back()->with('error', 'Hanya anggota terdaftar (siswa atau guru) yang dapat mengajukan usulan buku.');
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'author' => 'required|string|max:255',
            'publisher' => 'nullable|string|max:255',
            'reason' => 'required|string|max:1000',
        ]);

        BookSuggestion::create([
            'user_id' => $user->id,
            'title' => $validated['title'],
            'author' => $validated['author'],
            'publisher' => $validated['publisher'] ?? null,
            'reason' => $validated['reason'],
            'status' => 'pending',
        ]);

        return back()->with('success', 'Usulan pengadaan buku baru berhasil dikirimkan ke Kepala Perpustakaan.');
    }

    /**
     * Informasi Jam Buka & Tata Tertib Perpustakaan.
     */
    public function rules(): Response
    {
        $settings = LibrarySetting::current();

        return Inertia::render('opac/rules', [
            'settings' => $settings,
        ]);
    }
}
