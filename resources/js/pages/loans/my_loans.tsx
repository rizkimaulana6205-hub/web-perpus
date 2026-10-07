import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AppLayout from '@/components/layout/AppLayout';
import BarcodeBadge from '@/components/BarcodeBadge';
import {
    IconBook,
    IconBookOpen,
    IconClock,
    IconAlertCircle,
    IconCheckCircle,
    IconRepeat,
    IconCalendar,
    IconArrowRight,
    IconFileText,
} from '@/components/icons';

interface BookCopy {
    id: number;
    barcode: string;
    call_number: string;
    book?: {
        id: number;
        title: string;
        author: string;
        publisher: string;
        rack_location: string;
        cover_image: string | null;
        category?: {
            name: string;
        };
    };
}

interface Loan {
    id: number;
    loan_code: string;
    borrow_date: string;
    due_date: string;
    return_date: string | null;
    status: 'dipinjam' | 'terlambat' | 'kembali';
    renewed_count: number;
    fine_amount: number;
    fine_paid: number;
    fine_status: string;
    notes: string | null;
    book_copy?: BookCopy;
}

interface Reservation {
    id: number;
    queue_position: number;
    reservation_date: string;
    status: string;
    book?: {
        id: number;
        title: string;
        author: string;
        category?: {
            name: string;
        };
    };
}

interface MyLoansProps {
    activeLoans?: Loan[];
    historyLoans?: {
        data: Loan[];
        current_page: number;
        last_page: number;
        total: number;
        prev_page_url: string | null;
        next_page_url: string | null;
    };
    reservations?: Reservation[];
    stats?: {
        active_count: number;
        overdue_count: number;
        unpaid_fines: number;
        max_limit: number;
        remaining_quota: number;
    };
}

export default function MyLoans({
    activeLoans = [],
    historyLoans = { data: [], current_page: 1, last_page: 1, total: 0, prev_page_url: null, next_page_url: null },
    reservations = [],
    stats = { active_count: 0, overdue_count: 0, unpaid_fines: 0, max_limit: 3, remaining_quota: 3 },
}: MyLoansProps) {
    const { auth } = usePage<{ auth: { user: { name: string; member_type: string; identity_number?: string; class_name?: string } | null } }>().props;
    const currentUser = auth?.user;

    const [activeTab, setActiveTab] = useState<'aktif' | 'reservasi' | 'riwayat'>('aktif');

    const safeActiveLoans = Array.isArray(activeLoans) ? activeLoans : [];
    const safeReservations = Array.isArray(reservations) ? reservations : [];
    const safeHistoryLoans = historyLoans?.data && Array.isArray(historyLoans.data) ? historyLoans.data : [];
    const historyTotal = historyLoans?.total ?? 0;

    const handleRenew = (loanId: number, title: string) => {
        if (confirm(`Perpanjang masa pinjam untuk buku "${title}" selama 7 hari ke depan?`)) {
            router.post(`/sirkulasi/${loanId}/perpanjang`, {}, {
                preserveScroll: true,
            });
        }
    };

    const getDaysRemaining = (dueDateStr: string) => {
        if (!dueDateStr) return 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const due = new Date(dueDateStr);
        due.setHours(0, 0, 0, 0);
        const diffTime = due.getTime() - today.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    return (
        <AppLayout
            title="Daftar Pinjaman & Koleksi Saya"
            subtitle={`Halo, ${currentUser?.name || 'Anggota'} • Pantau batas waktu peminjaman, perpanjangan mandiri 1x, dan antrean reservasi buku Anda.`}
            actions={
                <div className="flex items-center gap-2">
                    <Link
                        href="/katalog"
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-[13px] font-medium rounded-xs bg-[#164e3b] text-white hover:bg-[#0f392b] transition-colors shadow-2xs"
                    >
                        <IconBookOpen size={16} />
                        <span>Cari Buku di OPAC</span>
                    </Link>
                    <Link
                        href="/bebas-pustaka"
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-[13px] font-medium rounded-xs border border-[#d6cebc] bg-white text-[#454137] hover:bg-[#f5efe2] transition-colors"
                    >
                        <IconFileText size={16} />
                        <span>Surat Bebas Pustaka</span>
                    </Link>
                </div>
            }
        >
            <Head title="Pinjaman Saya - Perpustakaan Cendekia" />

            {/* Member Identity & Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                <div className="p-4 rounded-xs bg-white border border-[#ded7c4] shadow-2xs">
                    <div className="text-[11px] font-mono uppercase tracking-wider text-[#736c5e]">Buku Sedang Dipinjam</div>
                    <div className="text-2xl font-serif font-bold text-[#191816] mt-0.5">
                        {stats?.active_count ?? 0} <span className="text-sm font-sans font-normal text-[#787161]">/ {stats?.max_limit ?? 3} Kuota</span>
                    </div>
                    <div className="text-[11px] text-[#8c8574] mt-0.5">
                        Sisa kuota: {stats?.remaining_quota ?? 3} buku
                    </div>
                </div>

                <div className="p-4 rounded-xs bg-white border border-[#ded7c4] shadow-2xs">
                    <div className="text-[11px] font-mono uppercase tracking-wider text-[#736c5e]">Status Keterlambatan</div>
                    <div className={`text-2xl font-serif font-bold mt-0.5 ${(stats?.overdue_count ?? 0) > 0 ? 'text-[#991b1b]' : 'text-[#164e3b]'}`}>
                        {(stats?.overdue_count ?? 0) > 0 ? `${stats.overdue_count} Buku Telat` : 'Semua Tepat Waktu'}
                    </div>
                    <div className="text-[11px] text-[#8c8574] mt-0.5">
                        {(stats?.overdue_count ?? 0) > 0 ? 'Segera kembalikan ke meja sirkulasi' : 'Peminjaman tertib'}
                    </div>
                </div>

                <div className="p-4 rounded-xs bg-white border border-[#ded7c4] shadow-2xs">
                    <div className="text-[11px] font-mono uppercase tracking-wider text-[#736c5e]">Tanggungan Denda</div>
                    <div className={`text-2xl font-serif font-bold mt-0.5 ${(stats?.unpaid_fines ?? 0) > 0 ? 'text-[#991b1b]' : 'text-[#191816]'}`}>
                        Rp {(stats?.unpaid_fines ?? 0).toLocaleString('id-ID')}
                    </div>
                    <div className="text-[11px] text-[#8c8574] mt-0.5">
                        {(stats?.unpaid_fines ?? 0) > 0 ? 'Bayar ke meja sirkulasi' : 'Tidak ada tunggakan'}
                    </div>
                </div>

                <div className="p-4 rounded-xs bg-white border border-[#ded7c4] shadow-2xs">
                    <div className="text-[11px] font-mono uppercase tracking-wider text-[#736c5e]">Antrean Booking</div>
                    <div className="text-2xl font-serif font-bold text-[#191816] mt-0.5">
                        {safeReservations.length} Judul
                    </div>
                    <div className="text-[11px] text-[#8c8574] mt-0.5">
                        Buku yang sedang ditunggu
                    </div>
                </div>
            </div>

            {/* Overdue Warning Notification if needed */}
            {(stats?.overdue_count ?? 0) > 0 && (
                <div className="mb-6 p-4 rounded-xs bg-[#fef2f2] border border-[#fecaca] text-[#991b1b] text-[13px] flex items-start gap-3">
                    <IconAlertCircle size={20} className="shrink-0 mt-0.5 text-[#b91c1c]" />
                    <div>
                        <strong className="font-semibold">Pemberitahuan Keterlambatan Pengembalian:</strong>
                        <p className="mt-0.5 text-[#7f1d1d]">
                            Anda memiliki buku yang telah melewati tanggal jatuh tempo. Harap segera mengembalikan buku ke Meja Sirkulasi Perpustakaan untuk menghindari akumulasi denda harian (Rp 1.000 / hari).
                        </p>
                    </div>
                </div>
            )}

            {/* Main Tabs Container */}
            <div className="bg-white border border-[#d6cebc] rounded-xs shadow-xs overflow-hidden">
                {/* Tab Navigation */}
                <div className="flex border-b border-[#ded7c4] bg-[#faf8f5] text-[13px] font-medium">
                    <button
                        type="button"
                        onClick={() => setActiveTab('aktif')}
                        className={`px-5 py-3.5 border-b-2 font-serif transition-colors flex items-center gap-2 ${
                            activeTab === 'aktif'
                                ? 'border-[#164e3b] text-[#164e3b] bg-white font-bold'
                                : 'border-transparent text-[#787161] hover:text-[#191816]'
                        }`}
                    >
                        <span>Buku yang Sedang Dipinjam</span>
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-mono bg-[#ede7d8] text-[#5c574c]">
                            {safeActiveLoans.length}
                        </span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('reservasi')}
                        className={`px-5 py-3.5 border-b-2 font-serif transition-colors flex items-center gap-2 ${
                            activeTab === 'reservasi'
                                ? 'border-[#164e3b] text-[#164e3b] bg-white font-bold'
                                : 'border-transparent text-[#787161] hover:text-[#191816]'
                        }`}
                    >
                        <span>Antrean Reservasi (Booking)</span>
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-mono bg-[#ede7d8] text-[#5c574c]">
                            {safeReservations.length}
                        </span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('riwayat')}
                        className={`px-5 py-3.5 border-b-2 font-serif transition-colors flex items-center gap-2 ${
                            activeTab === 'riwayat'
                                ? 'border-[#164e3b] text-[#164e3b] bg-white font-bold'
                                : 'border-transparent text-[#787161] hover:text-[#191816]'
                        }`}
                    >
                        <span>Riwayat Peminjaman Lalu</span>
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-mono bg-[#ede7d8] text-[#5c574c]">
                            {historyTotal}
                        </span>
                    </button>
                </div>

                {/* Tab 1: Pinjaman Aktif */}
                {activeTab === 'aktif' && (
                    <div className="p-6">
                        {safeActiveLoans.length === 0 ? (
                            <div className="py-12 text-center text-[#787161]">
                                <IconBookOpen size={40} className="mx-auto text-[#c2b9a3] mb-3" />
                                <h3 className="font-serif font-bold text-lg text-[#191816]">
                                    Tidak Ada Buku yang Sedang Dipinjam
                                </h3>
                                <p className="text-[13px] text-[#6d6657] mt-1 max-w-md mx-auto">
                                    Anda saat ini bebas dari tanggungan pinjaman. Jelajahi katalog buku untuk menemukan bacaan berikutnya.
                                </p>
                                <Link
                                    href="/katalog"
                                    className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[#164e3b] text-white text-[13px] font-medium rounded-xs hover:bg-[#0f392b] transition-colors"
                                >
                                    <span>Telusuri Katalog OPAC</span>
                                    <IconArrowRight size={14} />
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {safeActiveLoans.map((loan) => {
                                    const daysRemaining = getDaysRemaining(loan.due_date);
                                    const isOverdue = daysRemaining < 0;
                                    const isDueToday = daysRemaining === 0;
                                    const bookTitle = loan.book_copy?.book?.title || 'Koleksi Perpustakaan';
                                    const bookAuthor = loan.book_copy?.book?.author || '-';
                                    const bookPublisher = loan.book_copy?.book?.publisher || '-';
                                    const rackLoc = loan.book_copy?.book?.rack_location || 'Rak Sirkulasi';
                                    const bookBarcode = loan.book_copy?.barcode || loan.loan_code;
                                    const bookId = loan.book_copy?.book?.id;

                                    return (
                                        <div
                                            key={loan.id}
                                            className={`p-4 sm:p-5 rounded-xs border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                                                isOverdue
                                                    ? 'border-[#fca5a5] bg-[#fffbfb]'
                                                    : isDueToday
                                                    ? 'border-[#fde047] bg-[#fefce8]'
                                                    : 'border-[#ded7c4] bg-[#faf8f5] hover:border-[#b5ac96]'
                                            }`}
                                        >
                                            <div className="flex gap-4">
                                                <div className="w-12 h-16 rounded-xs bg-[#eadecc] border border-[#d6cebc] flex items-center justify-center shrink-0 text-[#8a816e]">
                                                    <IconBook size={24} />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-2xs bg-white border border-[#ded7c4] text-[#615a4d]">
                                                            {loan.loan_code}
                                                        </span>
                                                        <span className="text-[11px] font-mono text-[#8a816e]">
                                                            Rak: {rackLoc}
                                                        </span>
                                                    </div>
                                                    <h4 className="font-serif font-bold text-base text-[#191816] leading-snug">
                                                        {bookId ? (
                                                            <Link href={`/katalog/buku/${bookId}`} className="hover:text-[#164e3b] hover:underline">
                                                                {bookTitle}
                                                            </Link>
                                                        ) : (
                                                            <span>{bookTitle}</span>
                                                        )}
                                                    </h4>
                                                    <p className="text-[12px] text-[#6d6657] mt-0.5">
                                                        Penulis: {bookAuthor} • Penerbit: {bookPublisher}
                                                    </p>
                                                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] font-mono text-[#787161]">
                                                        <span>Pinjam: {new Date(loan.borrow_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                                        <span>•</span>
                                                        <span className="font-semibold text-[#191816]">
                                                            Jatuh Tempo: {new Date(loan.due_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                        </span>
                                                        <span>•</span>
                                                        <BarcodeBadge code={bookBarcode} compact={true} />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-col sm:flex-row md:flex-col items-end justify-between gap-3 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-[#e8e2d2]">
                                                {/* Countdown Status */}
                                                <div>
                                                    {isOverdue ? (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-2xs bg-[#fef2f2] border border-[#fecaca] text-[#991b1b] text-xs font-mono font-bold">
                                                            <IconAlertCircle size={14} />
                                                            Terlambat {Math.abs(daysRemaining)} Hari
                                                        </span>
                                                    ) : isDueToday ? (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-2xs bg-[#fef9c3] border border-[#fef08a] text-[#854d0e] text-xs font-mono font-bold">
                                                            <IconClock size={14} />
                                                            Jatuh Tempo Hari Ini!
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-2xs bg-[#e8f5ed] border border-[#a3d9b8] text-[#164e3b] text-xs font-mono font-medium">
                                                            <IconCheckCircle size={14} />
                                                            Sisa {daysRemaining} Hari
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Self-Renewal Action */}
                                                {loan.renewed_count === 0 && !isOverdue ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRenew(loan.id, bookTitle)}
                                                        className="px-3.5 py-1.5 bg-[#f4eee1] hover:bg-[#164e3b] hover:text-white text-[#454137] text-xs font-medium rounded-xs border border-[#d6cebc] transition-colors flex items-center gap-1.5"
                                                    >
                                                        <IconRepeat size={14} />
                                                        <span>Perpanjang Mandiri (+7 Hari)</span>
                                                    </button>
                                                ) : (
                                                    <span className="text-[11px] text-[#8c8574] font-mono">
                                                        {loan.renewed_count > 0 ? 'Sudah diperpanjang 1x' : 'Tidak dapat diperpanjang'}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* Tab 2: Antrean Reservasi */}
                {activeTab === 'reservasi' && (
                    <div className="p-6">
                        {safeReservations.length === 0 ? (
                            <div className="py-12 text-center text-[#787161]">
                                <h3 className="font-serif font-bold text-lg text-[#191816]">
                                    Belum Ada Buku dalam Antrean Booking
                                </h3>
                                <p className="text-[13px] text-[#6d6657] mt-1 max-w-md mx-auto">
                                    Saat buku favorit Anda sedang dipinjam orang lain, Anda dapat mengambil nomor antrean pemesanan (booking) melalui katalog OPAC.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {safeReservations.map((res) => {
                                    const bookTitle = res.book?.title || 'Koleksi Buku';
                                    const bookAuthor = res.book?.author || '-';
                                    const bookId = res.book?.id;

                                    return (
                                        <div
                                            key={res.id}
                                            className="p-4 rounded-xs border border-[#ded7c4] bg-[#faf8f5] flex items-center justify-between"
                                        >
                                            <div>
                                                <span className="text-[10px] font-mono px-2 py-0.5 rounded-2xs bg-[#e8f5ed] text-[#164e3b] font-bold">
                                                    Antrean #{res.queue_position}
                                                </span>
                                                <h4 className="font-serif font-bold text-base text-[#191816] mt-1">
                                                    {bookId ? (
                                                        <Link href={`/katalog/buku/${bookId}`} className="hover:underline">
                                                            {bookTitle}
                                                        </Link>
                                                    ) : (
                                                        <span>{bookTitle}</span>
                                                    )}
                                                </h4>
                                                <div className="text-[12px] text-[#6d6657]">
                                                    Karya {bookAuthor} • Tanggal Pengajuan: {new Date(res.reservation_date).toLocaleDateString('id-ID')}
                                                </div>
                                            </div>
                                            <span className="text-[12px] font-medium text-[#164e3b] bg-[#eef7f2] px-3 py-1 rounded-xs border border-[#a3d9b8]">
                                                Menunggu Ketersediaan
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* Tab 3: Riwayat Lalu */}
                {activeTab === 'riwayat' && (
                    <div className="p-6">
                        {safeHistoryLoans.length === 0 ? (
                            <div className="py-12 text-center text-[#787161]">
                                <p className="text-[13px]">Belum ada riwayat pengembalian buku sebelumnya.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-[13px]">
                                    <thead>
                                        <tr className="border-b border-[#ded7c4] text-[11px] font-mono uppercase text-[#787161] bg-[#faf8f5]">
                                            <th className="py-3 px-4">Kode Transaksi</th>
                                            <th className="py-3 px-4">Judul Buku</th>
                                            <th className="py-3 px-4">Tgl Pinjam</th>
                                            <th className="py-3 px-4">Tgl Kembali</th>
                                            <th className="py-3 px-4 text-right">Status Denda</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#eee8db]">
                                        {safeHistoryLoans.map((h) => (
                                            <tr key={h.id} className="hover:bg-[#faf8f5]">
                                                <td className="py-3 px-4 font-mono text-[12px] text-[#5c574c]">{h.loan_code}</td>
                                                <td className="py-3 px-4 font-serif font-medium text-[#191816]">{h.book_copy?.book?.title || 'Judul Koleksi'}</td>
                                                <td className="py-3 px-4 text-[#6d6657]">{new Date(h.borrow_date).toLocaleDateString('id-ID')}</td>
                                                <td className="py-3 px-4 text-[#164e3b] font-medium">{h.return_date ? new Date(h.return_date).toLocaleDateString('id-ID') : '-'}</td>
                                                <td className="py-3 px-4 text-right">
                                                    {(h.fine_amount ?? 0) > 0 ? (
                                                        <span className="font-mono text-[12px] text-[#164e3b]">Lunas (Rp {(h.fine_paid ?? 0).toLocaleString('id-ID')})</span>
                                                    ) : (
                                                        <span className="text-[11px] text-[#787161]">Tepat Waktu (Rp 0)</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
