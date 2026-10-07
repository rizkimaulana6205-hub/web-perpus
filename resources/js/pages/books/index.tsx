import React, { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AppLayout from '@/components/layout/AppLayout';
import Modal from '@/components/Modal';
import BarcodeBadge from '@/components/BarcodeBadge';
import {
    IconBook,
    IconSearch,
    IconPlus,
    IconPrinter,
    IconBarcode,
    IconX,
} from '@/components/icons';

interface Category {
    id: number;
    code: string;
    name: string;
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
    category_id: number;
    rack_location: string;
    synopsis: string | null;
    cover_image: string | null;
    table_of_contents: string | null;
    total_copies: number;
    available_copies: number;
    category?: Category;
    copies?: BookCopy[];
}

interface IndexProps {
    books: {
        data: Book[];
        current_page: number;
        last_page: number;
        total: number;
        prev_page_url: string | null;
        next_page_url: string | null;
    };
    categories: Category[];
    filters: {
        q?: string;
        category_id?: string;
    };
}

export default function BookIndex({
    books = { data: [], current_page: 1, last_page: 1, total: 0, prev_page_url: null, next_page_url: null },
    categories = [],
    filters = {},
}: IndexProps) {
    const safeFilters = (filters && typeof filters === 'object' && !Array.isArray(filters)) ? filters : {};

    const [searchQ, setSearchQ] = useState(typeof safeFilters.q === 'string' ? safeFilters.q : '');
    const [selectedCategory, setSelectedCategory] = useState(typeof safeFilters.category_id === 'string' ? safeFilters.category_id : '');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingBook, setEditingBook] = useState<Book | null>(null);

    const addForm = useForm({
        title: '',
        author: '',
        publisher: '',
        publication_year: new Date().getFullYear(),
        isbn: '',
        ddc_code: '500',
        category_id: categories[0]?.id || 1,
        rack_location: 'Rak Sains S-01 (Lt. 2)',
        synopsis: '',
        cover_image: '',
        table_of_contents: '',
        initial_copies_count: 2,
    });

    const editForm = useForm({
        title: '',
        author: '',
        publisher: '',
        publication_year: new Date().getFullYear(),
        isbn: '',
        ddc_code: '',
        category_id: 1,
        rack_location: '',
        synopsis: '',
        cover_image: '',
        table_of_contents: '',
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/kelola-buku', {
            q: searchQ || undefined,
            category_id: selectedCategory || undefined,
        }, { preserveState: true });
    };

    const handleAddSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        addForm.post('/kelola-buku', {
            onSuccess: () => {
                addForm.reset();
                setIsAddModalOpen(false);
            },
        });
    };

    const openEditModal = (book: Book) => {
        setEditingBook(book);
        editForm.setData({
            title: book.title,
            author: book.author,
            publisher: book.publisher,
            publication_year: book.publication_year,
            isbn: book.isbn,
            ddc_code: book.ddc_code,
            category_id: book.category_id,
            rack_location: book.rack_location,
            synopsis: book.synopsis || '',
            cover_image: book.cover_image || '',
            table_of_contents: book.table_of_contents || '',
        });
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingBook) return;

        editForm.put(`/kelola-buku/${editingBook.id}`, {
            onSuccess: () => {
                setEditingBook(null);
            },
        });
    };

    const handleDelete = (book: Book) => {
        if (confirm(`Yakin ingin menghapus buku "${book.title}" beserta seluruh eksemplarnya?`)) {
            router.delete(`/kelola-buku/${book.id}`);
        }
    };

    return (
        <AppLayout
            title="Manajemen Katalog Buku & Barcode"
            subtitle="Input dan pembaruan metadata katalog, pelabelan nomor panggil DDC, dan pencetakan stiker barcode eksemplar."
            actions={
                <div className="flex items-center gap-2">
                    <Link
                        href="/kelola-buku/cetak-barcode-label"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 text-[13px] font-medium rounded-xs border border-[#d6cebc] bg-white text-[#454137] hover:bg-[#f5efe2] transition-colors"
                    >
                        <IconPrinter size={16} />
                        <span>Cetak Lembar Barcode & Label Punggung</span>
                    </Link>
                    <button
                        type="button"
                        onClick={() => setIsAddModalOpen(true)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 text-[13px] font-bold rounded-xs bg-[#164e3b] text-white hover:bg-[#0f392b] shadow-xs transition-colors"
                    >
                        <IconPlus size={16} />
                        <span>Tambah Buku & Eksemplar</span>
                    </button>
                </div>
            }
        >
            <Head title="Kelola Katalog Buku - Perpustakaan Cendekia" />

            {/* Filter Bar */}
            <div className="bg-white border border-[#ded7c4] rounded-xs p-4 mb-6 shadow-xs">
                <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-center gap-3">
                    <div className="relative flex-1 w-full">
                        <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8a816e]" size={16} />
                        <input
                            type="text"
                            value={searchQ}
                            onChange={(e) => setSearchQ(e.target.value)}
                            placeholder="Cari judul buku, penulis, ISBN, atau DDC..."
                            className="w-full pl-9 pr-3 py-2 bg-[#faf8f5] border border-[#d6cebc] rounded-xs text-[13px] focus:outline-hidden focus:border-[#164e3b]"
                        />
                    </div>

                    <select
                        value={selectedCategory}
                        onChange={(e) => {
                            setSelectedCategory(e.target.value);
                            router.get('/kelola-buku', {
                                q: searchQ || undefined,
                                category_id: e.target.value || undefined,
                            }, { preserveState: true });
                        }}
                        className="px-3 py-2 bg-[#faf8f5] border border-[#d6cebc] rounded-xs text-[13px] text-[#332f26] shrink-0"
                    >
                        <option value="">Semua Kategori DDC</option>
                        {categories.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.code} - {c.name}
                            </option>
                        ))}
                    </select>

                    <button
                        type="submit"
                        className="px-5 py-2 bg-[#164e3b] hover:bg-[#0f392b] text-white text-[13px] font-medium rounded-xs shadow-xs transition-colors shrink-0"
                    >
                        Cari Buku
                    </button>
                </form>
            </div>

            {/* Catalog Table */}
            <div className="bg-white border border-[#ded7c4] rounded-xs overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-[13px]">
                        <thead className="bg-[#f5efe2] text-[#4d483e] font-semibold border-b border-[#ded7c4]">
                            <tr>
                                <th className="py-2.5 px-4">Klasifikasi</th>
                                <th className="py-2.5 px-4">Judul Buku & Penulis</th>
                                <th className="py-2.5 px-4">Penerbit & Tahun</th>
                                <th className="py-2.5 px-4">ISBN</th>
                                <th className="py-2.5 px-4">Lokasi Rak</th>
                                <th className="py-2.5 px-4">Eksemplar</th>
                                <th className="py-2.5 px-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#ebe4d3]">
                            {books.data.map((book) => (
                                <tr key={book.id} className="hover:bg-[#faf8f5] transition-colors">
                                    <td className="py-3 px-4 font-mono font-bold text-[#164e3b]">
                                        DDC {book.ddc_code}
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="font-semibold text-[#191816]">
                                            <Link href={`/katalog/buku/${book.id}`} className="hover:underline">
                                                {book.title}
                                            </Link>
                                        </div>
                                        <div className="text-[11px] text-[#787161]">
                                            Penulis: {book.author}
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 text-[#5e5748]">
                                        {book.publisher} ({book.publication_year})
                                    </td>
                                    <td className="py-3 px-4 font-mono text-[#5e5748]">
                                        {book.isbn}
                                    </td>
                                    <td className="py-3 px-4">
                                        <span className="text-[11px] font-medium bg-[#f5efe2] border border-[#ded7c4] px-2 py-0.5 rounded-2xs">
                                            {book.rack_location}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 font-mono">
                                        <strong className={book.available_copies > 0 ? 'text-[#164e3b]' : 'text-[#991b1b]'}>
                                            {book.available_copies}
                                        </strong>{' '}
                                        / {book.total_copies}
                                    </td>
                                    <td className="py-3 px-4 text-right">
                                        <div className="flex items-center justify-end gap-1.5">
                                            <Link
                                                href={`/kelola-buku/cetak-barcode-label?book_id=${book.id}`}
                                                className="px-2 py-1 text-[11px] font-medium rounded-xs bg-[#f4f9f6] text-[#164e3b] border border-[#164e3b]/30 hover:bg-[#e6f3ec]"
                                                title="Cetak Barcode Eksemplar"
                                            >
                                                <IconPrinter size={13} className="inline mr-1" />
                                                Barcode
                                            </Link>
                                            <button
                                                type="button"
                                                onClick={() => openEditModal(book)}
                                                className="px-2 py-1 text-[11px] font-medium rounded-xs bg-[#f5efe2] text-[#423e35] border border-[#ded7c4] hover:bg-[#eae3d2]"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleDelete(book)}
                                                className="px-2 py-1 text-[11px] font-medium rounded-xs bg-[#fee2e2] text-[#991b1b] border border-[#fca5a5] hover:bg-[#fecaca]"
                                            >
                                                Hapus
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {books.last_page > 1 && (
                    <div className="flex items-center justify-between p-4 border-t border-[#ded7c4] text-[13px]">
                        <div className="text-[#6d6657]">
                            Halaman {books.current_page} dari {books.last_page} ({books.total} judul)
                        </div>
                        <div className="flex items-center gap-2">
                            {books.prev_page_url && (
                                <Link
                                    href={books.prev_page_url}
                                    className="px-3 py-1.5 rounded-xs border border-[#d6cebc] bg-white text-[#454137] hover:bg-[#f5efe2]"
                                >
                                    ← Sebelumnya
                                </Link>
                            )}
                            {books.next_page_url && (
                                <Link
                                    href={books.next_page_url}
                                    className="px-3 py-1.5 rounded-xs border border-[#d6cebc] bg-white text-[#454137] hover:bg-[#f5efe2]"
                                >
                                    Selanjutnya →
                                </Link>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Modal Tambah Buku Baru */}
            <Modal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title="Input Katalog Buku & Generate Barcode Eksemplar"
                description="Masukkan data bibliografi buku. Sistem akan otomatis membuat eksemplar fisik dengan nomor barcode dan nomor panggil."
                maxWidth="xl"
            >
                <form onSubmit={handleAddSubmit} className="space-y-4">
                    <div>
                        <label className="block text-[12px] font-semibold text-[#191816] mb-1">Judul Lengkap Buku *</label>
                        <input
                            type="text"
                            required
                            value={addForm.data.title}
                            onChange={(e) => addForm.setData('title', e.target.value)}
                            placeholder="Contoh: Fisika Kuantum untuk Pemula"
                            className="w-full px-3 py-2 bg-[#faf8f5] border border-[#d6cebc] rounded-xs text-[13px]"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-[12px] font-semibold text-[#191816] mb-1">Pengarang / Penulis *</label>
                            <input
                                type="text"
                                required
                                value={addForm.data.author}
                                onChange={(e) => addForm.setData('author', e.target.value)}
                                className="w-full px-3 py-2 bg-[#faf8f5] border border-[#d6cebc] rounded-xs text-[13px]"
                            />
                        </div>
                        <div>
                            <label className="block text-[12px] font-semibold text-[#191816] mb-1">Penerbit *</label>
                            <input
                                type="text"
                                required
                                value={addForm.data.publisher}
                                onChange={(e) => addForm.setData('publisher', e.target.value)}
                                className="w-full px-3 py-2 bg-[#faf8f5] border border-[#d6cebc] rounded-xs text-[13px]"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                            <label className="block text-[12px] font-semibold text-[#191816] mb-1">Tahun Terbit *</label>
                            <input
                                type="number"
                                required
                                value={addForm.data.publication_year}
                                onChange={(e) => addForm.setData('publication_year', Number(e.target.value))}
                                className="w-full px-3 py-2 bg-[#faf8f5] border border-[#d6cebc] rounded-xs text-[13px]"
                            />
                        </div>
                        <div>
                            <label className="block text-[12px] font-semibold text-[#191816] mb-1">Nomor ISBN *</label>
                            <input
                                type="text"
                                required
                                value={addForm.data.isbn}
                                onChange={(e) => addForm.setData('isbn', e.target.value)}
                                placeholder="978-xxx-xxx"
                                className="w-full px-3 py-2 bg-[#faf8f5] border border-[#d6cebc] rounded-xs text-[13px] font-mono"
                            />
                        </div>
                        <div>
                            <label className="block text-[12px] font-semibold text-[#191816] mb-1">Kode DDC *</label>
                            <input
                                type="text"
                                required
                                value={addForm.data.ddc_code}
                                onChange={(e) => addForm.setData('ddc_code', e.target.value)}
                                placeholder="515 atau 899.221"
                                className="w-full px-3 py-2 bg-[#faf8f5] border border-[#d6cebc] rounded-xs text-[13px] font-mono"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                            <label className="block text-[12px] font-semibold text-[#191816] mb-1">Kategori Utama *</label>
                            <select
                                value={addForm.data.category_id}
                                onChange={(e) => addForm.setData('category_id', Number(e.target.value))}
                                className="w-full px-3 py-2 bg-[#faf8f5] border border-[#d6cebc] rounded-xs text-[13px]"
                            >
                                {categories.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.code} - {c.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-[12px] font-semibold text-[#191816] mb-1">Lokasi Rak Fisik *</label>
                            <input
                                type="text"
                                required
                                value={addForm.data.rack_location}
                                onChange={(e) => addForm.setData('rack_location', e.target.value)}
                                placeholder="Rak Sains S-03 (Lt. 2)"
                                className="w-full px-3 py-2 bg-[#faf8f5] border border-[#d6cebc] rounded-xs text-[13px]"
                            />
                        </div>
                        <div>
                            <label className="block text-[12px] font-semibold text-[#191816] mb-1">Jumlah Eksemplar Fisik *</label>
                            <input
                                type="number"
                                min={1}
                                max={20}
                                required
                                value={addForm.data.initial_copies_count}
                                onChange={(e) => addForm.setData('initial_copies_count', Number(e.target.value))}
                                className="w-full px-3 py-2 bg-[#faf8f5] border border-[#d6cebc] rounded-xs text-[13px] font-mono"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[12px] font-semibold text-[#191816] mb-1">URL Cover Buku (Opsional)</label>
                        <input
                            type="url"
                            value={addForm.data.cover_image}
                            onChange={(e) => addForm.setData('cover_image', e.target.value)}
                            placeholder="https://images.unsplash.com/..."
                            className="w-full px-3 py-2 bg-[#faf8f5] border border-[#d6cebc] rounded-xs text-[13px]"
                        />
                    </div>

                    <div>
                        <label className="block text-[12px] font-semibold text-[#191816] mb-1">Sinopsis & Ringkasan</label>
                        <textarea
                            rows={3}
                            value={addForm.data.synopsis}
                            onChange={(e) => addForm.setData('synopsis', e.target.value)}
                            className="w-full px-3 py-2 bg-[#faf8f5] border border-[#d6cebc] rounded-xs text-[13px]"
                        />
                    </div>

                    <div>
                        <label className="block text-[12px] font-semibold text-[#191816] mb-1">Preview Daftar Isi Digital</label>
                        <textarea
                            rows={3}
                            value={addForm.data.table_of_contents}
                            onChange={(e) => addForm.setData('table_of_contents', e.target.value)}
                            placeholder="Bab 1: Pendahuluan...&#10;Bab 2: Pembahasan..."
                            className="w-full px-3 py-2 bg-[#faf8f5] border border-[#d6cebc] rounded-xs text-[12px] font-mono"
                        />
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#ebe4d3]">
                        <button
                            type="button"
                            onClick={() => setIsAddModalOpen(false)}
                            className="px-4 py-2 text-[13px] rounded-xs border border-[#d6cebc]"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={addForm.processing}
                            className="px-5 py-2 text-[13px] font-bold text-white bg-[#164e3b] hover:bg-[#0f392b] rounded-xs shadow-xs"
                        >
                            Simpan & Generate Barcode
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Modal Edit Buku */}
            {editingBook && (
                <Modal
                    isOpen={true}
                    onClose={() => setEditingBook(null)}
                    title={`Edit Katalog: ${editingBook.title}`}
                    description="Perbarui informasi bibliografi buku perpustakaan."
                    maxWidth="xl"
                >
                    <form onSubmit={handleEditSubmit} className="space-y-4">
                        <div>
                            <label className="block text-[12px] font-semibold text-[#191816] mb-1">Judul Buku *</label>
                            <input
                                type="text"
                                required
                                value={editForm.data.title}
                                onChange={(e) => editForm.setData('title', e.target.value)}
                                className="w-full px-3 py-2 bg-[#faf8f5] border border-[#d6cebc] rounded-xs text-[13px]"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="block text-[12px] font-semibold text-[#191816] mb-1">Penulis *</label>
                                <input
                                    type="text"
                                    required
                                    value={editForm.data.author}
                                    onChange={(e) => editForm.setData('author', e.target.value)}
                                    className="w-full px-3 py-2 bg-[#faf8f5] border border-[#d6cebc] rounded-xs text-[13px]"
                                />
                            </div>
                            <div>
                                <label className="block text-[12px] font-semibold text-[#191816] mb-1">Penerbit *</label>
                                <input
                                    type="text"
                                    required
                                    value={editForm.data.publisher}
                                    onChange={(e) => editForm.setData('publisher', e.target.value)}
                                    className="w-full px-3 py-2 bg-[#faf8f5] border border-[#d6cebc] rounded-xs text-[13px]"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                                <label className="block text-[12px] font-semibold text-[#191816] mb-1">Tahun *</label>
                                <input
                                    type="number"
                                    required
                                    value={editForm.data.publication_year}
                                    onChange={(e) => editForm.setData('publication_year', Number(e.target.value))}
                                    className="w-full px-3 py-2 bg-[#faf8f5] border border-[#d6cebc] rounded-xs text-[13px]"
                                />
                            </div>
                            <div>
                                <label className="block text-[12px] font-semibold text-[#191816] mb-1">ISBN *</label>
                                <input
                                    type="text"
                                    required
                                    value={editForm.data.isbn}
                                    onChange={(e) => editForm.setData('isbn', e.target.value)}
                                    className="w-full px-3 py-2 bg-[#faf8f5] border border-[#d6cebc] rounded-xs text-[13px] font-mono"
                                />
                            </div>
                            <div>
                                <label className="block text-[12px] font-semibold text-[#191816] mb-1">Kode DDC *</label>
                                <input
                                    type="text"
                                    required
                                    value={editForm.data.ddc_code}
                                    onChange={(e) => editForm.setData('ddc_code', e.target.value)}
                                    className="w-full px-3 py-2 bg-[#faf8f5] border border-[#d6cebc] rounded-xs text-[13px] font-mono"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[12px] font-semibold text-[#191816] mb-1">Lokasi Rak Fisik *</label>
                            <input
                                type="text"
                                required
                                value={editForm.data.rack_location}
                                onChange={(e) => editForm.setData('rack_location', e.target.value)}
                                className="w-full px-3 py-2 bg-[#faf8f5] border border-[#d6cebc] rounded-xs text-[13px]"
                            />
                        </div>

                        <div>
                            <label className="block text-[12px] font-semibold text-[#191816] mb-1">Sinopsis</label>
                            <textarea
                                rows={3}
                                value={editForm.data.synopsis}
                                onChange={(e) => editForm.setData('synopsis', e.target.value)}
                                className="w-full px-3 py-2 bg-[#faf8f5] border border-[#d6cebc] rounded-xs text-[13px]"
                            />
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#ebe4d3]">
                            <button
                                type="button"
                                onClick={() => setEditingBook(null)}
                                className="px-4 py-2 text-[13px] rounded-xs border border-[#d6cebc]"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                disabled={editForm.processing}
                                className="px-5 py-2 text-[13px] font-bold text-white bg-[#164e3b] hover:bg-[#0f392b] rounded-xs shadow-xs"
                            >
                                Simpan Perubahan
                            </button>
                        </div>
                    </form>
                </Modal>
            )}
        </AppLayout>
    );
}
