import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AppLayout from '@/components/layout/AppLayout';
import BarcodeBadge from '@/components/BarcodeBadge';
import {
    IconBook,
    IconBookOpen,
    IconBarcode,
    IconQrCode,
    IconBookmark,
    IconPrinter,
    IconArrowRight,
    IconCheckCircle,
    IconAlertCircle,
    IconClock,
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

interface Reservation {
    id: number;
    queue_position: number;
    reservation_date: string;
    user?: {
        id: number;
        name: string;
        class_name: string;
    };
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
    table_of_contents: string | null;
    total_copies: number;
    available_copies: number;
    category?: Category;
    copies?: BookCopy[];
    reservations?: Reservation[];
}

interface OpacShowProps {
    book: Book;
    userReservation: Reservation | null;
    relatedBooks: Book[];
}

export default function OpacShow({ book, userReservation, relatedBooks }: OpacShowProps) {
    const { auth } = usePage<{ auth: { user: { role: string; name: string } | null } }>().props;
    const currentUser = auth?.user;
    const isAvailable = book.available_copies > 0;
    const [activeTab, setActiveTab] = useState<'eksemplar' | 'daftar_isi' | 'reservasi'>('eksemplar');

    const handleReserve = () => {
        if (!currentUser || currentUser.role === 'tamu') {
            router.visit('/login');
            return;
        }

        if (confirm(`Apakah Anda ingin memesan/booking buku "${book.title}"? Anda akan masuk dalam antrean reservasi.`)) {
            router.post(`/katalog/buku/${book.id}/reservasi`, {}, {
                preserveScroll: true,
            });
        }
    };

    return (
        <AppLayout
            title={book.title}
            subtitle={`Karya ${book.author} • Diterbitkan oleh ${book.publisher} (${book.publication_year})`}
            actions={
                <div className="flex items-center gap-2">
                    <Link
                        href="/katalog"
                        className="px-3.5 py-2 text-[13px] font-medium rounded-xs border border-[#d6cebc] bg-white text-[#454137] hover:bg-[#f5efe2] transition-colors"
                    >
                        ← Kembali ke Katalog
                    </Link>
                    {currentUser && (currentUser.role === 'petugas' || currentUser.role === 'super_admin') && (
                        <Link
                            href={`/kelola-buku/cetak-barcode-label?book_id=${book.id}`}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-[13px] font-medium rounded-xs border border-[#164e3b]/30 bg-[#f4f9f6] text-[#164e3b] hover:bg-[#e6f3ec] transition-colors"
                        >
                            <IconPrinter size={16} />
                            <span>Cetak Label & Barcode</span>
                        </Link>
                    )}
                </div>
            }
        >
            <Head title={`${book.title} - Detail Katalog OPAC`} />

            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-[12px] text-[#787161] mb-6 font-mono">
                <Link href="/katalog" className="hover:text-[#164e3b] hover:underline">OPAC</Link>
                <span>/</span>
                <span>DDC {book.ddc_code} ({book.category?.name})</span>
                <span>/</span>
                <span className="text-[#191816] font-semibold truncate max-w-xs">{book.title}</span>
            </div>

            {/* Primary Book Card (Archival Ledger Diptych) */}
            <div className="bg-white border border-[#dcd4c2] rounded-xs p-6 md:p-8 mb-8 shadow-xs">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                    {/* Left: Book Cover & Physical Spine Badge */}
                    <div className="md:col-span-4 flex flex-col items-center sm:items-start">
                        <div className="w-52 h-72 sm:w-60 sm:h-84 bg-[#f4eee1] border-2 border-[#ded7c4] rounded-2xs overflow-hidden shadow-md relative group">
                            {book.cover_image ? (
                                <img
                                    src={book.cover_image}
                                    alt={`Cover ${book.title}`}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center text-[#8a8270]">
                                    <IconBook size={40} />
                                    <span className="text-[11px] mt-2 font-mono uppercase tracking-wider">Tanpa Berkas Cover</span>
                                </div>
                            )}

                            {/* Floating availability stamp */}
                            <div className="absolute top-2.5 right-2.5">
                                <span
                                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-2xs text-[11px] font-semibold tracking-wide uppercase shadow-xs ${
                                        isAvailable
                                            ? 'bg-[#164e3b] text-white'
                                            : 'bg-[#991b1b] text-white'
                                    }`}
                                >
                                    {isAvailable ? '✓ Tersedia di Rak' : 'Sedang Dipinjam'}
                                </span>
                            </div>
                        </div>

                        {/* Physical Call Number Label (Spine Stamp Simulation) */}
                        <div className="mt-4 w-full bg-[#fbf9f4] border border-[#dcd4c2] p-3 rounded-xs text-center font-mono">
                            <div className="text-[10px] text-[#7d7564] uppercase tracking-widest font-semibold">
                                Nomor Panggil Fisik (Call Number)
                            </div>
                            <div className="text-[14px] font-bold text-[#191816] mt-0.5 tracking-wider">
                                {book.copies?.[0]?.call_number || `${book.ddc_code} ${book.author.slice(0, 3).toUpperCase()} ${book.title.slice(0, 1).toLowerCase()}`}
                            </div>
                            <div className="text-[11px] text-[#5e5748] mt-1 bg-white border border-[#e4decb] py-0.5 px-2 rounded-2xs inline-block">
                                📍 Lokasi: <strong>{book.rack_location}</strong>
                            </div>
                        </div>

                        {/* Booking / Reserve Action */}
                        <div className="mt-4 w-full">
                            {userReservation ? (
                                <div className="p-3 bg-[#e8f5ed] border border-[#a3d9b8] rounded-xs text-[12px] text-[#134e31]">
                                    <div className="font-semibold flex items-center gap-1.5">
                                        <IconCheckCircle size={15} className="text-[#198754]" />
                                        <span>Reservasi Anda Aktif</span>
                                    </div>
                                    <div className="mt-1">
                                        Nomor antrean ke-<strong>{userReservation.queue_position}</strong>. Tanggal pesan:{' '}
                                        {userReservation.reservation_date}.
                                    </div>
                                </div>
                            ) : !isAvailable ? (
                                <button
                                    type="button"
                                    onClick={handleReserve}
                                    className="w-full py-2.5 px-4 bg-[#b45309] hover:bg-[#92400e] text-white font-medium text-[13px] rounded-xs shadow-xs transition-colors flex items-center justify-center gap-2"
                                >
                                    <IconBookmark size={16} />
                                    <span>Booking / Antrean Buku ({book.reservations?.length || 0} Menunggu)</span>
                                </button>
                            ) : (
                                <div className="p-3 bg-[#f5efe2] border border-[#dcd4c2] rounded-xs text-[12px] text-[#5c5649]">
                                    💡 Buku tersedia di rak. Anda dapat langsung menuju ke meja sirkulasi untuk memindai peminjaman.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Rich Metadata Ledger */}
                    <div className="md:col-span-8 flex flex-col justify-between">
                        <div>
                            {/* DDC Header pill */}
                            <div className="flex items-center gap-2 mb-2">
                                <span className="px-2 py-0.5 rounded-2xs bg-[#164e3b] text-white text-[11px] font-mono font-bold">
                                    DDC {book.ddc_code}
                                </span>
                                <span className="text-[12px] text-[#6d6657] font-medium">
                                    {book.category?.name}
                                </span>
                            </div>

                            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#191816] tracking-tight leading-snug">
                                {book.title}
                            </h1>

                            {/* Spec Sheet Table */}
                            <div className="mt-6 border border-[#ded7c4] rounded-xs overflow-hidden text-[13px]">
                                <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-[#ded7c4] bg-[#faf8f5]">
                                    <div className="p-3 space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-[#787161]">Penulis / Pengarang:</span>
                                            <span className="font-semibold text-[#191816] text-right">{book.author}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-[#787161]">Penerbit:</span>
                                            <span className="font-semibold text-[#191816] text-right">{book.publisher}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-[#787161]">Tahun Terbit:</span>
                                            <span className="font-semibold text-[#191816] font-mono text-right">{book.publication_year}</span>
                                        </div>
                                    </div>
                                    <div className="p-3 space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-[#787161]">Nomor ISBN:</span>
                                            <span className="font-mono font-semibold text-[#191816] text-right">{book.isbn}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-[#787161]">Total Eksemplar:</span>
                                            <span className="font-semibold text-[#191816] text-right">{book.total_copies} Buku</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-[#787161]">Ketersediaan Rak:</span>
                                            <span className={`font-semibold text-right ${isAvailable ? 'text-[#164e3b]' : 'text-[#991b1b]'}`}>
                                                {book.available_copies} Tersedia
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Synopsis */}
                            <div className="mt-6">
                                <h3 className="font-serif font-bold text-[16px] text-[#191816] mb-2">
                                    Sinopsis & Deskripsi Koleksi
                                </h3>
                                <p className="text-[13px] text-[#4d483e] leading-relaxed whitespace-pre-line bg-[#fbf9f4] p-4 rounded-xs border border-[#ebe4d3]">
                                    {book.synopsis || 'Belum ada ringkasan sinopsis resmi yang diinputkan untuk buku ini.'}
                                </p>
                            </div>
                        </div>

                        {/* Barcode Quick Preview */}
                        {book.copies && book.copies.length > 0 && (
                            <div className="mt-6 pt-4 border-t border-[#ebe4d3] flex items-center justify-between flex-wrap gap-3">
                                <div>
                                    <span className="text-[12px] text-[#706a5e]">Contoh Barcode Fisik:</span>
                                    <div className="text-[11px] text-[#8a816e] font-mono">
                                        Dapat dipindai di Meja Sirkulasi
                                    </div>
                                </div>
                                <BarcodeBadge
                                    code={book.copies[0].barcode}
                                    label={book.copies[0].call_number}
                                    compact={true}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Detailed Tabs: Eksemplar Fisik & Barcode / Preview Daftar Isi / Antrean Reservasi */}
            <div className="bg-white border border-[#dcd4c2] rounded-xs overflow-hidden mb-12 shadow-xs">
                {/* Tab Header Strip */}
                <div className="flex border-b border-[#ded7c4] bg-[#f8f4ea] text-[13px] font-medium overflow-x-auto">
                    <button
                        type="button"
                        onClick={() => setActiveTab('eksemplar')}
                        className={`px-5 py-3 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
                            activeTab === 'eksemplar'
                                ? 'border-[#164e3b] text-[#164e3b] bg-white font-bold'
                                : 'border-transparent text-[#666051] hover:text-[#191816]'
                        }`}
                    >
                        <IconBarcode size={16} />
                        <span>Daftar Eksemplar Fisik ({book.copies?.length || 0})</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('daftar_isi')}
                        className={`px-5 py-3 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
                            activeTab === 'daftar_isi'
                                ? 'border-[#164e3b] text-[#164e3b] bg-white font-bold'
                                : 'border-transparent text-[#666051] hover:text-[#191816]'
                        }`}
                    >
                        <IconBookOpen size={16} />
                        <span>Preview Lampiran / Daftar Isi Digital</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('reservasi')}
                        className={`px-5 py-3 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
                            activeTab === 'reservasi'
                                ? 'border-[#164e3b] text-[#164e3b] bg-white font-bold'
                                : 'border-transparent text-[#666051] hover:text-[#191816]'
                        }`}
                    >
                        <IconBookmark size={16} />
                        <span>Antrean Reservasi ({book.reservations?.length || 0})</span>
                    </button>
                </div>

                {/* Tab 1: Eksemplar Fisik */}
                {activeTab === 'eksemplar' && (
                    <div className="p-6">
                        <div className="text-[13px] text-[#6d6657] mb-4">
                            Setiap eksemplar fisik buku memiliki kode barcode unik dan nomor panggil (call number) tersendiri untuk pencatatan scanner sirkulasi otomatis.
                        </div>
                        <div className="overflow-x-auto border border-[#ded7c4] rounded-xs">
                            <table className="w-full text-left text-[13px]">
                                <thead className="bg-[#f5efe2] text-[#4d483e] font-semibold border-b border-[#ded7c4]">
                                    <tr>
                                        <th className="py-2.5 px-4">No.</th>
                                        <th className="py-2.5 px-4">Kode Barcode Fisik</th>
                                        <th className="py-2.5 px-4">Nomor Panggil (Call No.)</th>
                                        <th className="py-2.5 px-4">Kondisi Fisik</th>
                                        <th className="py-2.5 px-4">Status Eksemplar</th>
                                        <th className="py-2.5 px-4 text-right">Label Barcode</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#ebe4d3]">
                                    {book.copies && book.copies.length > 0 ? (
                                        book.copies.map((copy, index) => (
                                            <tr key={copy.id} className="hover:bg-[#faf8f5] transition-colors">
                                                <td className="py-3 px-4 font-mono text-[#787161]">{index + 1}</td>
                                                <td className="py-3 px-4 font-mono font-bold text-[#191816]">
                                                    {copy.barcode}
                                                </td>
                                                <td className="py-3 px-4 font-mono text-[#454137]">
                                                    {copy.call_number}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className="capitalize text-[#454137]">
                                                        {copy.condition.replace('_', ' ')}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span
                                                        className={`inline-flex items-center px-2 py-0.5 rounded-2xs text-[11px] font-semibold capitalize ${
                                                            copy.status === 'tersedia'
                                                                ? 'bg-[#e8f5ed] text-[#134e31] border border-[#b2ddc4]'
                                                                : copy.status === 'dipinjam'
                                                                ? 'bg-[#fee2e2] text-[#991b1b] border border-[#fca5a5]'
                                                                : 'bg-[#fef3c7] text-[#92400e] border border-[#fcd34d]'
                                                        }`}
                                                    >
                                                        {copy.status}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-right">
                                                    <BarcodeBadge code={copy.barcode} compact={true} />
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={6} className="text-center py-6 text-[#787161]">
                                                Belum ada eksemplar terdaftar.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Tab 2: Preview Lampiran / Daftar Isi Digital */}
                {activeTab === 'daftar_isi' && (
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h4 className="font-serif font-bold text-[#191816] text-[15px]">
                                    Transkrip Daftar Isi & Lampiran Digital
                                </h4>
                                <p className="text-[12px] text-[#6d6657]">
                                    Pratinjau struktur bab dan topik pembahasan buku sebelum mengambil fisik di rak perpustakaan.
                                </p>
                            </div>
                            <span className="text-[11px] font-mono text-[#164e3b] bg-[#e8f5ed] px-2 py-1 rounded-2xs border border-[#a3d9b8]">
                                E-Daftar Isi Siap
                            </span>
                        </div>

                        {book.table_of_contents ? (
                            <div className="bg-[#faf8f5] border border-[#dcd4c2] p-5 rounded-xs font-mono text-[13px] leading-relaxed text-[#38352e] whitespace-pre-line shadow-inner">
                                {book.table_of_contents}
                            </div>
                        ) : (
                            <div className="p-8 text-center text-[#8a816e] bg-[#faf8f5] rounded-xs border border-[#e5decb]">
                                <IconBookOpen size={32} className="mx-auto mb-2 opacity-50" />
                                Pratinjau daftar isi digital belum ditambahkan untuk judul ini. Silakan periksa langsung salinan fisik di {book.rack_location}.
                            </div>
                        )}
                    </div>
                )}

                {/* Tab 3: Antrean Reservasi */}
                {activeTab === 'reservasi' && (
                    <div className="p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                            <div>
                                <h4 className="font-serif font-bold text-[#191816] text-[15px]">
                                    Antrean Pemesanan Buku
                                </h4>
                                <p className="text-[12px] text-[#6d6657]">
                                    Daftar anggota yang telah melakukan booking untuk buku ini saat sedang dipinjam peminjam lain.
                                </p>
                            </div>
                            {!isAvailable && !userReservation && (
                                <button
                                    type="button"
                                    onClick={handleReserve}
                                    className="px-4 py-2 bg-[#164e3b] hover:bg-[#0f392b] text-white text-[13px] font-medium rounded-xs shadow-xs transition-colors shrink-0"
                                >
                                    + Ambil Nomor Antrean
                                </button>
                            )}
                        </div>

                        {book.reservations && book.reservations.length > 0 ? (
                            <div className="border border-[#ded7c4] rounded-xs overflow-hidden">
                                <table className="w-full text-left text-[13px]">
                                    <thead className="bg-[#f5efe2] text-[#4d483e] font-semibold border-b border-[#ded7c4]">
                                        <tr>
                                            <th className="py-2.5 px-4">Urutan Antrean</th>
                                            <th className="py-2.5 px-4">Nama Pemesan</th>
                                            <th className="py-2.5 px-4">Kelas / Rombel</th>
                                            <th className="py-2.5 px-4">Tanggal Booking</th>
                                            <th className="py-2.5 px-4">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#ebe4d3]">
                                        {book.reservations.map((res) => (
                                            <tr key={res.id} className="hover:bg-[#faf8f5]">
                                                <td className="py-3 px-4 font-mono font-bold text-[#164e3b]">
                                                    Antrean #{res.queue_position}
                                                </td>
                                                <td className="py-3 px-4 font-semibold text-[#191816]">
                                                    {res.user?.name || 'Anggota'}
                                                </td>
                                                <td className="py-3 px-4 text-[#5e5748]">
                                                    {res.user?.class_name || 'Siswa'}
                                                </td>
                                                <td className="py-3 px-4 text-[#787161] font-mono">
                                                    {res.reservation_date}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className="px-2 py-0.5 rounded-2xs text-[11px] font-semibold bg-[#fef3c7] text-[#92400e] border border-[#fcd34d]">
                                                        Menunggu Pengembalian
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="p-8 text-center text-[#8a816e] bg-[#faf8f5] rounded-xs border border-[#e5decb]">
                                Saat ini tidak ada antrean reservasi untuk buku ini.
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Related Books in Same DDC Category */}
            {relatedBooks && relatedBooks.length > 0 && (
                <div className="mt-12">
                    <h3 className="font-serif font-bold text-xl text-[#191816] mb-4">
                        Koleksi Terkait dalam Kelas DDC {book.ddc_code}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {relatedBooks.map((rb) => (
                            <Link
                                key={rb.id}
                                href={`/katalog/buku/${rb.id}`}
                                className="bg-white border border-[#ded7c4] hover:border-[#164e3b] p-3.5 rounded-xs shadow-2xs hover:shadow-xs transition-all flex flex-col group"
                            >
                                <div className="text-[10px] font-mono uppercase text-[#787161] mb-1">
                                    DDC {rb.ddc_code}
                                </div>
                                <h4 className="font-serif font-bold text-[14px] text-[#191816] group-hover:text-[#164e3b] line-clamp-2 leading-snug">
                                    {rb.title}
                                </h4>
                                <div className="text-[12px] text-[#6d6657] mt-1 truncate">
                                    {rb.author}
                                </div>
                                <div className="mt-auto pt-2 text-[11px] font-medium text-[#164e3b] flex items-center justify-between">
                                    <span>{rb.available_copies} Tersedia</span>
                                    <span>Lihat →</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
