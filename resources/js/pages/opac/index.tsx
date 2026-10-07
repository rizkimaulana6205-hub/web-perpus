import React, { useState } from 'react';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import AppLayout from '@/components/layout/AppLayout';
import Modal from '@/components/Modal';
import {
    IconSearch,
    IconBook,
    IconBookOpen,
    IconFilter,
    IconSparkles,
    IconCheck,
    IconAlertCircle,
    IconClock,
    IconArrowRight,
    IconBookmark,
} from '@/components/icons';

interface Category {
    id: number;
    code: string;
    name: string;
    books_count: number;
}

interface BookCopy {
    id: number;
    barcode: string;
    call_number: string;
    status: string;
    condition: string;
}

interface Book {
    id: number;
    title: string;
    author: string;
    publisher: string;
    publication_year: number;
    isbn: string;
    ddc_code: string;
    rack_location: string;
    synopsis: string | null;
    cover_image: string | null;
    total_copies: number;
    available_copies: number;
    category?: Category;
    copies?: BookCopy[];
    pending_reservations_count?: number;
}

interface PaginatedBooks {
    data: Book[];
    current_page: number;
    last_page: number;
    total: number;
    prev_page_url: string | null;
    next_page_url: string | null;
}

interface OpacIndexProps {
    books: PaginatedBooks;
    categories: Category[];
    filters: {
        q?: string;
        category_id?: string;
        ddc?: string;
        availability?: string;
        sort?: string;
    };
    stats: {
        total_titles: number;
        total_copies: number;
        available_copies: number;
        categories_count: number;
    };
}

export default function OpacIndex({
    books = { data: [], current_page: 1, last_page: 1, total: 0, prev_page_url: null, next_page_url: null },
    categories = [],
    filters = {},
    stats = { total_titles: 0, total_copies: 0, available_copies: 0, categories_count: 0 },
}: OpacIndexProps) {
    const { auth } = usePage<{ auth: { user: { role: string; name: string } | null } }>().props;
    const currentUser = auth?.user;

    const safeFilters = (filters && typeof filters === 'object' && !Array.isArray(filters)) ? filters : {};

    const [searchQuery, setSearchQuery] = useState(typeof safeFilters.q === 'string' ? safeFilters.q : '');
    const [selectedCategory, setSelectedCategory] = useState(typeof safeFilters.category_id === 'string' ? safeFilters.category_id : '');
    const [selectedAvailability, setSelectedAvailability] = useState(typeof safeFilters.availability === 'string' ? safeFilters.availability : '');
    const [selectedSort, setSelectedSort] = useState(typeof safeFilters.sort === 'string' ? safeFilters.sort : 'latest');
    const [isSuggestModalOpen, setIsSuggestModalOpen] = useState(false);

    const suggestForm = useForm({
        title: '',
        author: '',
        publisher: '',
        reason: '',
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/katalog', {
            q: searchQuery || undefined,
            category_id: selectedCategory || undefined,
            availability: selectedAvailability || undefined,
            sort: selectedSort !== 'latest' ? selectedSort : undefined,
        }, { preserveState: true });
    };

    const handleFilterChange = (key: string, value: string) => {
        const nextFilters = {
            q: searchQuery || undefined,
            category_id: selectedCategory || undefined,
            availability: selectedAvailability || undefined,
            sort: selectedSort !== 'latest' ? selectedSort : undefined,
            [key]: value || undefined,
        };
        router.get('/katalog', nextFilters, { preserveState: true });
    };

    const handleSuggestSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        suggestForm.post('/katalog/usulkan-buku', {
            onSuccess: () => {
                suggestForm.reset();
                setIsSuggestModalOpen(false);
            },
        });
    };

    return (
        <AppLayout
            title="Katalog Publik Terbuka (OPAC)"
            subtitle="Cari dan telusuri koleksi buku, modul pembelajaran, referensi ilmiah, serta periksa ketersediaan eksemplar fisik di rak perpustakaan secara waktu-nyata."
            actions={
                <div className="flex items-center gap-2">
                    <Link
                        href="/katalog/informasi-dan-tata-tertib"
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-[13px] font-medium rounded-xs border border-[#d6cebc] bg-white text-[#454137] hover:bg-[#f5efe2] transition-colors"
                    >
                        <IconClock size={16} />
                        <span>Jam Buka & Tata Tertib</span>
                    </Link>
                    {currentUser && currentUser.role !== 'tamu' && (
                        <button
                            type="button"
                            onClick={() => setIsSuggestModalOpen(true)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-[13px] font-medium rounded-xs bg-[#164e3b] text-white hover:bg-[#0f392b] shadow-xs transition-colors"
                        >
                            <IconSparkles size={16} />
                            <span>Usul Pengadaan Buku</span>
                        </button>
                    )}
                </div>
            }
        >
            <Head title="OPAC - Katalog Perpustakaan Cendekia" />

            {/* Quick Metrics Strip (Honest Library Data) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
                <div className="p-3.5 rounded-xs bg-white border border-[#ded7c4] shadow-2xs">
                    <div className="text-[11px] font-mono uppercase tracking-wider text-[#736c5e]">Total Judul Buku</div>
                    <div className="text-2xl font-serif font-bold text-[#191816] mt-0.5">{stats.total_titles.toLocaleString('id-ID')}</div>
                    <div className="text-[11px] text-[#8c8574] mt-0.5">Koleksi terdaftar aktif</div>
                </div>
                <div className="p-3.5 rounded-xs bg-white border border-[#ded7c4] shadow-2xs">
                    <div className="text-[11px] font-mono uppercase tracking-wider text-[#736c5e]">Total Eksemplar</div>
                    <div className="text-2xl font-serif font-bold text-[#191816] mt-0.5">{stats.total_copies.toLocaleString('id-ID')}</div>
                    <div className="text-[11px] text-[#8c8574] mt-0.5">Fisik buku ber-barcode</div>
                </div>
                <div className="p-3.5 rounded-xs bg-white border border-[#ded7c4] shadow-2xs">
                    <div className="text-[11px] font-mono uppercase tracking-wider text-[#736c5e]">Tersedia di Rak</div>
                    <div className="text-2xl font-serif font-bold text-[#164e3b] mt-0.5">{stats.available_copies.toLocaleString('id-ID')}</div>
                    <div className="text-[11px] text-[#8c8574] mt-0.5">Siap dipinjam langsung</div>
                </div>
                <div className="p-3.5 rounded-xs bg-white border border-[#ded7c4] shadow-2xs">
                    <div className="text-[11px] font-mono uppercase tracking-wider text-[#736c5e]">Kelas DDC</div>
                    <div className="text-2xl font-serif font-bold text-[#191816] mt-0.5">{stats.categories_count}</div>
                    <div className="text-[11px] text-[#8c8574] mt-0.5">Klasifikasi perbidang ilmu</div>
                </div>
            </div>

            {/* Smart Search & Filter Header (Tactile Card Ledger Aesthetic) */}
            <div className="bg-white border border-[#d6cebc] rounded-xs p-5 mb-8 shadow-xs">
                <form onSubmit={handleSearch} className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-2.5">
                        <div className="relative flex-1">
                            <IconSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8c8574]" size={18} />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Cari berdasarkan judul, penulis, penerbit, nomor ISBN, atau kata kunci..."
                                className="w-full pl-10 pr-4 py-2.5 bg-[#faf8f5] border border-[#d6cebc] rounded-xs text-[14px] text-[#191816] placeholder-[#948d7d] focus:outline-hidden focus:border-[#164e3b] focus:bg-white transition-all"
                            />
                        </div>
                        <button
                            type="submit"
                            className="px-6 py-2.5 bg-[#164e3b] hover:bg-[#0f392b] text-white font-medium text-[14px] rounded-xs transition-colors shrink-0 shadow-xs flex items-center justify-center gap-2"
                        >
                            <IconSearch size={16} />
                            <span>Cari Koleksi</span>
                        </button>
                    </div>

                    {/* Filter Pills and Dropdowns */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#ece6d5] text-[13px]">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[#736c5e] font-medium flex items-center gap-1 mr-1">
                                <IconFilter size={15} />
                                <span>Filter:</span>
                            </span>

                            {/* DDC Category select */}
                            <select
                                value={selectedCategory}
                                onChange={(e) => {
                                    setSelectedCategory(e.target.value);
                                    handleFilterChange('category_id', e.target.value);
                                }}
                                className="bg-[#f5efe2] border border-[#d6cebc] rounded-xs px-2.5 py-1.5 text-[13px] text-[#332f26] focus:outline-hidden focus:border-[#164e3b]"
                            >
                                <option value="">Semua Kategori DDC</option>
                                {categories.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.code} - {c.name} ({c.books_count})
                                    </option>
                                ))}
                            </select>

                            {/* Availability toggle */}
                            <button
                                type="button"
                                onClick={() => {
                                    const next = selectedAvailability === 'available' ? '' : 'available';
                                    setSelectedAvailability(next);
                                    handleFilterChange('availability', next);
                                }}
                                className={`px-3 py-1.5 rounded-xs border text-[12px] font-medium transition-colors ${
                                    selectedAvailability === 'available'
                                        ? 'bg-[#164e3b] text-white border-[#164e3b]'
                                        : 'bg-[#faf8f5] text-[#524d42] border-[#d6cebc] hover:bg-[#f0e9db]'
                                }`}
                            >
                                {selectedAvailability === 'available' ? '✓ Hanya Tersedia di Rak' : 'Semua Status Ketersediaan'}
                            </button>
                        </div>

                        {/* Sort */}
                        <div className="flex items-center gap-2">
                            <span className="text-[#736c5e]">Urutkan:</span>
                            <select
                                value={selectedSort}
                                onChange={(e) => {
                                    setSelectedSort(e.target.value);
                                    handleFilterChange('sort', e.target.value);
                                }}
                                className="bg-[#f5efe2] border border-[#d6cebc] rounded-xs px-2.5 py-1.5 text-[13px] text-[#332f26] focus:outline-hidden focus:border-[#164e3b]"
                            >
                                <option value="latest">Terbaru Ditambahkan</option>
                                <option value="title_asc">Judul (A - Z)</option>
                                <option value="title_desc">Judul (Z - A)</option>
                                <option value="year_desc">Tahun Terbit (Terbaru)</option>
                                <option value="popular">Koleksi Terpopuler</option>
                            </select>
                        </div>
                    </div>
                </form>
            </div>

            {/* Book Catalog Grid */}
            <div className="space-y-6">
                <div className="flex items-center justify-between text-[13px] text-[#736c5e] px-1">
                    <div>
                        Menampilkan <strong className="text-[#191816]">{books.data.length}</strong> dari{' '}
                        <strong className="text-[#191816]">{books.total}</strong> judul buku terindeks
                    </div>
                    {safeFilters.q && (
                        <div>
                            Hasil pencarian: <span className="text-[#164e3b] font-medium italic">"{safeFilters.q}"</span>
                        </div>
                    )}
                </div>

                {books.data.length === 0 ? (
                    <div className="p-12 text-center bg-white border border-[#ded7c4] rounded-xs">
                        <IconBookOpen size={40} className="mx-auto text-[#a8a190] mb-3" />
                        <h3 className="text-lg font-serif font-bold text-[#191816]">Buku Tidak Ditemukan</h3>
                        <p className="text-[13px] text-[#6d6657] mt-1 max-w-md mx-auto">
                            Tidak ada koleksi yang cocok dengan filter atau kata kunci pencarian Anda. Coba gunakan kata kunci umum atau reset filter.
                        </p>
                        <button
                            type="button"
                            onClick={() => router.get('/katalog')}
                            className="mt-4 px-4 py-2 bg-[#f4eee1] hover:bg-[#eae3d2] text-[#454137] text-[13px] font-medium rounded-xs border border-[#ded7c4] transition-colors"
                        >
                            Reset Semua Filter
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {books.data.map((book) => {
                            const isAvailable = book.available_copies > 0;
                            return (
                                <article
                                    key={book.id}
                                    className="flex flex-col bg-white border border-[#dcd4c2] hover:border-[#b5ac96] rounded-xs p-4.5 transition-all shadow-2xs hover:shadow-xs group"
                                >
                                    <div className="flex gap-4">
                                        {/* Book Cover / Vignette */}
                                        <div className="w-24 h-32 shrink-0 bg-[#f4eee1] border border-[#ded7c4] rounded-2xs overflow-hidden relative shadow-2xs">
                                            {book.cover_image ? (
                                                <img
                                                    src={book.cover_image}
                                                    alt={`Cover ${book.title}`}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                    loading="lazy"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center text-[#8a8270]">
                                                    <IconBook size={24} />
                                                    <span className="text-[9px] mt-1 uppercase font-mono">Tanpa Cover</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Book Primary Metadata */}
                                        <div className="flex-1 min-w-0">
                                            {/* DDC Classification Badge */}
                                            <div className="flex items-center gap-1.5 flex-wrap mb-1">
                                                <span className="inline-flex items-center px-1.5 py-0.5 rounded-2xs bg-[#f4eee1] text-[#544e42] text-[11px] font-mono font-semibold border border-[#ded7c4]">
                                                    DDC {book.ddc_code}
                                                </span>
                                                <span className="text-[11px] text-[#7d7564] truncate">
                                                    {book.category?.name}
                                                </span>
                                            </div>

                                            <h2 className="text-[15px] font-serif font-bold text-[#191816] leading-snug line-clamp-2 group-hover:text-[#164e3b] transition-colors">
                                                <Link href={`/katalog/buku/${book.id}`}>
                                                    {book.title}
                                                </Link>
                                            </h2>

                                            <div className="text-[12px] text-[#6d6657] mt-1 truncate">
                                                Penulis: <span className="text-[#191816] font-medium">{book.author}</span>
                                            </div>
                                            <div className="text-[11px] text-[#8a816e] truncate">
                                                {book.publisher} ({book.publication_year})
                                            </div>

                                            {/* Shelf location */}
                                            <div className="mt-2 text-[11px] text-[#4d483e] bg-[#fbf9f4] border border-[#e5ded0] px-2 py-1 rounded-2xs inline-block">
                                                📍 <span className="font-semibold">{book.rack_location}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Synopsis snippet */}
                                    {book.synopsis && (
                                        <p className="text-[12px] text-[#635d50] mt-3 line-clamp-2 leading-relaxed border-t border-[#f0ebd9] pt-2">
                                            {book.synopsis}
                                        </p>
                                    )}

                                    {/* Footer Strip: Availability & Action Button */}
                                    <div className="mt-auto pt-3 border-t border-[#f0ebd9] flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-1.5">
                                            <span
                                                className={`w-2 h-2 rounded-full ${
                                                    isAvailable ? 'bg-[#198754]' : 'bg-[#dc2626]'
                                                }`}
                                            />
                                            <span
                                                className={`text-[12px] font-medium ${
                                                    isAvailable ? 'text-[#134e31]' : 'text-[#991b1b]'
                                                }`}
                                            >
                                                {isAvailable
                                                    ? `${book.available_copies} dari ${book.total_copies} Tersedia`
                                                    : 'Sedang Dipinjam'}
                                            </span>
                                        </div>

                                        <Link
                                            href={`/katalog/buku/${book.id}`}
                                            className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#164e3b] hover:text-[#0f392b] group/btn transition-colors"
                                        >
                                            <span>Detail Buku</span>
                                            <IconArrowRight size={13} className="group-hover/btn:translate-x-0.5 transition-transform" />
                                        </Link>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}

                {/* Pagination */}
                {books.last_page > 1 && (
                    <div className="flex items-center justify-between border-t border-[#ded7c4] pt-5 text-[13px]">
                        <div className="text-[#6d6657]">
                            Halaman {books.current_page} dari {books.last_page}
                        </div>
                        <div className="flex items-center gap-2">
                            {books.prev_page_url ? (
                                <Link
                                    href={books.prev_page_url}
                                    className="px-3 py-1.5 rounded-xs border border-[#d6cebc] bg-white text-[#454137] hover:bg-[#f5efe2] font-medium"
                                >
                                    ← Sebelumnya
                                </Link>
                            ) : (
                                <span className="px-3 py-1.5 rounded-xs border border-[#e5decb] bg-[#f5efe2] text-[#999283] cursor-not-allowed">
                                    ← Sebelumnya
                                </span>
                            )}

                            {books.next_page_url ? (
                                <Link
                                    href={books.next_page_url}
                                    className="px-3 py-1.5 rounded-xs border border-[#d6cebc] bg-white text-[#454137] hover:bg-[#f5efe2] font-medium"
                                >
                                    Selanjutnya →
                                </Link>
                            ) : (
                                <span className="px-3 py-1.5 rounded-xs border border-[#e5decb] bg-[#f5efe2] text-[#999283] cursor-not-allowed">
                                    Selanjutnya →
                                </span>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Modal Usul Pengadaan Buku Baru (Untuk Siswa/Guru) */}
            <Modal
                isOpen={isSuggestModalOpen}
                onClose={() => setIsSuggestModalOpen(false)}
                title="Usulan Pengadaan Buku Baru"
                description="Ajukan judul buku atau literatur yang belum tersedia di perpustakaan agar dapat dievaluasi oleh Kepala Perpustakaan."
            >
                <form onSubmit={handleSuggestSubmit} className="space-y-4">
                    <div>
                        <label className="block text-[13px] font-semibold text-[#191816] mb-1">
                            Judul Buku yang Diusulkan *
                        </label>
                        <input
                            type="text"
                            required
                            value={suggestForm.data.title}
                            onChange={(e) => suggestForm.setData('title', e.target.value)}
                            placeholder="Contoh: Atomic Habits atau Fisika Kuantum Modern"
                            className="w-full px-3 py-2 bg-[#faf8f5] border border-[#d6cebc] rounded-xs text-[13px] focus:outline-hidden focus:border-[#164e3b]"
                        />
                        {suggestForm.errors.title && (
                            <div className="text-[12px] text-[#dc2626] mt-1">{suggestForm.errors.title}</div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-[13px] font-semibold text-[#191816] mb-1">
                                Penulis / Pengarang *
                            </label>
                            <input
                                type="text"
                                required
                                value={suggestForm.data.author}
                                onChange={(e) => suggestForm.setData('author', e.target.value)}
                                placeholder="Nama penulis"
                                className="w-full px-3 py-2 bg-[#faf8f5] border border-[#d6cebc] rounded-xs text-[13px] focus:outline-hidden focus:border-[#164e3b]"
                            />
                        </div>
                        <div>
                            <label className="block text-[13px] font-semibold text-[#191816] mb-1">
                                Penerbit (Opsional)
                            </label>
                            <input
                                type="text"
                                value={suggestForm.data.publisher}
                                onChange={(e) => suggestForm.setData('publisher', e.target.value)}
                                placeholder="Gramedia, Erlangga, dll."
                                className="w-full px-3 py-2 bg-[#faf8f5] border border-[#d6cebc] rounded-xs text-[13px] focus:outline-hidden focus:border-[#164e3b]"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[13px] font-semibold text-[#191816] mb-1">
                            Alasan & Manfaat Usulan *
                        </label>
                        <textarea
                            required
                            rows={3}
                            value={suggestForm.data.reason}
                            onChange={(e) => suggestForm.setData('reason', e.target.value)}
                            placeholder="Jelaskan mengapa buku ini penting untuk menunjang pembelajaran, tugas kelas, atau pengayaan literasi sekolah..."
                            className="w-full px-3 py-2 bg-[#faf8f5] border border-[#d6cebc] rounded-xs text-[13px] focus:outline-hidden focus:border-[#164e3b]"
                        />
                        {suggestForm.errors.reason && (
                            <div className="text-[12px] text-[#dc2626] mt-1">{suggestForm.errors.reason}</div>
                        )}
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#ebe4d3]">
                        <button
                            type="button"
                            onClick={() => setIsSuggestModalOpen(false)}
                            className="px-4 py-2 text-[13px] font-medium text-[#5c5649] hover:bg-[#f0e9db] rounded-xs border border-[#d6cebc] transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={suggestForm.processing}
                            className="px-5 py-2 text-[13px] font-medium text-white bg-[#164e3b] hover:bg-[#0f392b] rounded-xs shadow-xs transition-colors disabled:opacity-50"
                        >
                            {suggestForm.processing ? 'Mengirim...' : 'Kirim Usulan'}
                        </button>
                    </div>
                </form>
            </Modal>
        </AppLayout>
    );
}
