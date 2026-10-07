<?php

namespace App\Http\Controllers;

use App\Models\Book;
use App\Models\BookCopy;
use App\Models\Category;
use App\Models\LibrarySetting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BookManagementController extends Controller
{
    /**
     * Manajemen Katalog Buku & Eksemplar (Pustakawan / Petugas).
     */
    public function index(Request $request): Response
    {
        $query = Book::with(['category', 'copies']);

        if ($search = $request->input('q')) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('author', 'like', "%{$search}%")
                    ->orWhere('isbn', 'like', "%{$search}%")
                    ->orWhere('ddc_code', 'like', "%{$search}%");
            });
        }

        if ($categoryId = $request->input('category_id')) {
            $query->where('category_id', $categoryId);
        }

        $books = $query->latest()->paginate(15)->withQueryString();
        $categories = Category::orderBy('code')->get();

        return Inertia::render('books/index', [
            'books' => $books,
            'categories' => $categories,
            'filters' => [
                'q' => (string) $request->input('q', ''),
                'category_id' => (string) $request->input('category_id', ''),
            ],
        ]);
    }

    /**
     * Simpan Buku Baru beserta Generator Barcode Eksemplar Otomatis.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'author' => 'required|string|max:255',
            'publisher' => 'required|string|max:255',
            'publication_year' => 'required|integer|min:1900|max:'.(date('Y') + 1),
            'isbn' => 'required|string|unique:books,isbn',
            'ddc_code' => 'required|string|max:20',
            'category_id' => 'required|exists:categories,id',
            'rack_location' => 'required|string|max:100',
            'synopsis' => 'nullable|string',
            'cover_image' => 'nullable|url',
            'table_of_contents' => 'nullable|string',
            'initial_copies_count' => 'required|integer|min:1|max:20',
        ]);

        $initialCopies = (int) $validated['initial_copies_count'];

        $book = Book::create([
            'title' => $validated['title'],
            'author' => $validated['author'],
            'publisher' => $validated['publisher'],
            'publication_year' => $validated['publication_year'],
            'isbn' => $validated['isbn'],
            'ddc_code' => $validated['ddc_code'],
            'category_id' => $validated['category_id'],
            'rack_location' => $validated['rack_location'],
            'synopsis' => $validated['synopsis'] ?? null,
            'cover_image' => $validated['cover_image'] ?? 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=600',
            'table_of_contents' => $validated['table_of_contents'] ?? null,
            'total_copies' => $initialCopies,
            'available_copies' => $initialCopies,
        ]);

        // Generate call number: e.g. "515 PUR k"
        $authorSurname = strtoupper(substr(explode(' ', $validated['author'])[0] ?? 'BK', 0, 3));
        $titleInitial = strtolower(substr($validated['title'], 0, 1));
        $callPrefix = "{$validated['ddc_code']} {$authorSurname} {$titleInitial}";

        for ($i = 1; $i <= $initialCopies; $i++) {
            $uniqueNumber = str_pad((string) (BookCopy::count() + 1), 5, '0', STR_PAD_LEFT);
            $barcode = 'BK-'.substr(str_replace('.', '', $validated['ddc_code']), 0, 3).'-'.$uniqueNumber;

            BookCopy::create([
                'book_id' => $book->id,
                'barcode' => $barcode,
                'call_number' => "{$callPrefix} k.{$i}",
                'condition' => 'baik',
                'status' => 'tersedia',
            ]);
        }

        $book->syncCopiesCount();

        return back()->with('success', "Katalog buku '{$book->title}' dan {$initialCopies} eksemplar fisik barcode berhasil didaftarkan.");
    }

    /**
     * Update Data Buku.
     */
    public function update(Request $request, int $id): RedirectResponse
    {
        $book = Book::findOrFail($id);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'author' => 'required|string|max:255',
            'publisher' => 'required|string|max:255',
            'publication_year' => 'required|integer|min:1900|max:'.(date('Y') + 1),
            'isbn' => 'required|string|unique:books,isbn,'.$book->id,
            'ddc_code' => 'required|string|max:20',
            'category_id' => 'required|exists:categories,id',
            'rack_location' => 'required|string|max:100',
            'synopsis' => 'nullable|string',
            'cover_image' => 'nullable|url',
            'table_of_contents' => 'nullable|string',
        ]);

        $book->update($validated);

        return back()->with('success', "Data katalog buku '{$book->title}' berhasil diperbarui.");
    }

    /**
     * Hapus Buku.
     */
    public function destroy(int $id): RedirectResponse
    {
        $book = Book::findOrFail($id);
        $title = $book->title;
        $book->delete();

        return back()->with('success', "Katalog buku '{$title}' dan seluruh eksemplarnya telah dihapus.");
    }

    /**
     * Generator Lembar Cetak Label Punggung & Barcode Buku.
     */
    public function printBarcodes(Request $request): Response
    {
        $bookId = $request->input('book_id');

        $query = BookCopy::with('book.category');
        if ($bookId) {
            $query->where('book_id', $bookId);
        } else {
            $query->latest()->take(24);
        }

        $copies = $query->get();
        $setting = LibrarySetting::current();

        return Inertia::render('books/barcodes', [
            'copies' => $copies,
            'setting' => $setting,
        ]);
    }
}
