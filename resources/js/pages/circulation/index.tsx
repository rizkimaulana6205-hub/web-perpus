import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AppLayout from '@/components/layout/AppLayout';
import BarcodeBadge from '@/components/BarcodeBadge';
import Modal from '@/components/Modal';
import {
    IconBarcode,
    IconSearch,
    IconCheckCircle,
    IconAlertCircle,
    IconClock,
    IconRepeat,
    IconCreditCard,
    IconBook,
    IconUsers,
    IconX,
    IconCheck,
} from '@/components/icons';

interface User {
    id: number;
    name: string;
    identity_number: string;
    class_name: string;
    member_type: string;
    role: string;
    max_loan_limit: number;
}

interface BookCopy {
    id: number;
    barcode: string;
    call_number: string;
    condition: string;
    status: string;
    book: {
        id: number;
        title: string;
        author: string;
        publisher: string;
        isbn: string;
        rack_location: string;
        cover_image: string | null;
    };
}

interface Loan {
    id: number;
    loan_code: string;
    borrow_date: string;
    due_date: string;
    return_date: string | null;
    status: string;
    renewed_count: number;
    fine_amount: number;
    fine_paid: number;
    fine_status: string;
    fine_reason: string | null;
    notes: string | null;
    user: User;
    book_copy: BookCopy;
    librarian?: {
        name: string;
    };
}

interface Reservation {
    id: number;
    queue_position: number;
    reservation_date: string;
    user: User;
    book: {
        id: number;
        title: string;
        author: string;
    };
}

interface CirculationProps {
    activeLoans: {
        data: Loan[];
        current_page: number;
        last_page: number;
        total: number;
        prev_page_url: string | null;
        next_page_url: string | null;
    };
    completedLoans: {
        data: Loan[];
        current_page: number;
        last_page: number;
        total: number;
        prev_page_url: string | null;
        next_page_url: string | null;
    };
    reservations: Reservation[];
    stats: {
        total_active: number;
        total_overdue: number;
        total_returned_this_month: number;
        unpaid_fines_sum: number;
        daily_fine_rate: number;
        loan_duration_days: number;
    };
    setting: {
        loan_duration_days: number;
        daily_fine_rate: number;
        library_name: string;
    };
}

export default function CirculationIndex({
    activeLoans = { data: [], current_page: 1, last_page: 1, total: 0, prev_page_url: null, next_page_url: null },
    completedLoans = { data: [], current_page: 1, last_page: 1, total: 0, prev_page_url: null, next_page_url: null },
    reservations = [],
    stats = {
        total_active: 0,
        total_overdue: 0,
        total_returned_this_month: 0,
        unpaid_fines_sum: 0,
        daily_fine_rate: 1000,
        loan_duration_days: 7,
    },
    setting = {
        loan_duration_days: 7,
        daily_fine_rate: 1000,
        library_name: 'Perpustakaan Cendekia',
    },
}: CirculationProps) {
    const { auth } = usePage<{ auth: { user: User | null } }>().props;
    const currentUser = auth?.user;

    const [activeTab, setActiveTab] = useState<'scan' | 'active' | 'completed' | 'reservasi'>('scan');
    const [scanMode, setScanMode] = useState<'pinjam' | 'kembali'>('pinjam');

    // Fast Scan States for Peminjaman
    const [memberCodeInput, setMemberCodeInput] = useState('');
    const [scannedMember, setScannedMember] = useState<{
        user: User & { active_loans_count: number; unpaid_fines: number; active_loans: any[] };
        eligibility: { allowed: boolean; reason: string | null };
    } | null>(null);
    const [isLookingUpMember, setIsLookingUpMember] = useState(false);

    const [bookBarcodeInput, setBookBarcodeInput] = useState('');
    const [scannedBook, setScannedBook] = useState<BookCopy | null>(null);
    const [isLookingUpBook, setIsLookingUpBook] = useState(false);
    const [loanNotes, setLoanNotes] = useState('');

    // Fast Scan States for Pengembalian
    const [returnQueryInput, setReturnQueryInput] = useState('');
    const [returnLookupData, setReturnLookupData] = useState<{
        copy: BookCopy;
        active_loan: any;
    } | null>(null);
    const [returnCondition, setReturnCondition] = useState('baik');
    const [payFineNow, setPayFineNow] = useState(true);
    const [additionalDamageFine, setAdditionalDamageFine] = useState(0);

    // Member Card Fast Lookup
    const handleLookupMember = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!memberCodeInput.trim()) return;

        setIsLookingUpMember(true);
        try {
            const res = await fetch(`/sirkulasi/lookup-member?code=${encodeURIComponent(memberCodeInput.trim())}`);
            const data = await res.json();
            if (data.success) {
                setScannedMember(data);
            } else {
                alert(data.message || 'Anggota tidak ditemukan.');
                setScannedMember(null);
            }
        } catch {
            alert('Gagal menghubungi server validasi.');
        } finally {
            setIsLookingUpMember(false);
        }
    };

    // Book Barcode Fast Lookup
    const handleLookupBook = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!bookBarcodeInput.trim()) return;

        setIsLookingUpBook(true);
        try {
            const res = await fetch(`/sirkulasi/lookup-book?barcode=${encodeURIComponent(bookBarcodeInput.trim())}`);
            const data = await res.json();
            if (data.success) {
                if (data.copy.status !== 'tersedia') {
                    alert(`Buku ini tidak tersedia untuk dipinjam (Status: ${data.copy.status}).`);
                    setScannedBook(null);
                } else {
                    setScannedBook(data.copy);
                }
            } else {
                alert(data.message || 'Barcode buku tidak ditemukan.');
                setScannedBook(null);
            }
        } catch {
            alert('Gagal mencari data buku.');
        } finally {
            setIsLookingUpBook(false);
        }
    };

    // Return Barcode Lookup
    const handleLookupReturn = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!returnQueryInput.trim()) return;

        try {
            const res = await fetch(`/sirkulasi/lookup-book?barcode=${encodeURIComponent(returnQueryInput.trim())}`);
            const data = await res.json();
            if (data.success) {
                if (!data.active_loan) {
                    alert('Buku ini saat ini berstatus Tersedia di rak (tidak sedang dalam transaksi pinjam aktif).');
                    setReturnLookupData(null);
                } else {
                    setReturnLookupData(data);
                }
            } else {
                alert(data.message || 'Data tidak ditemukan.');
            }
        } catch {
            alert('Terjadi kesalahan saat memverifikasi pengembalian.');
        }
    };

    // Submit Borrow Transaction
    const handleBorrowSubmit = () => {
        if (!scannedMember || !scannedBook) return;
        if (!scannedMember.eligibility.allowed) {
            alert('Anggota tidak memenuhi syarat: ' + scannedMember.eligibility.reason);
            return;
        }

        router.post('/sirkulasi/pinjam', {
            user_id: scannedMember.user.id,
            book_copy_barcode: scannedBook.barcode,
            notes: loanNotes,
        }, {
            onSuccess: () => {
                setScannedMember(null);
                setScannedBook(null);
                setMemberCodeInput('');
                setBookBarcodeInput('');
                setLoanNotes('');
            },
        });
    };

    // Submit Return Transaction
    const handleReturnSubmit = () => {
        if (!returnLookupData) return;

        router.post('/sirkulasi/kembali', {
            barcode_or_id: returnLookupData.copy.barcode,
            condition: returnCondition,
            pay_fine_now: payFineNow,
            additional_damage_fine: additionalDamageFine,
        }, {
            onSuccess: () => {
                setReturnLookupData(null);
                setReturnQueryInput('');
                setAdditionalDamageFine(0);
            },
        });
    };

    // Renew Loan (Perpanjangan Mandiri)
    const handleRenewLoan = (loan: Loan) => {
        if (confirm(`Perpanjang masa pinjam untuk buku "${loan.book_copy.book.title}" selama +${setting.loan_duration_days} hari?`)) {
            router.post(`/sirkulasi/${loan.id}/perpanjang`, {}, {
                preserveScroll: true,
            });
        }
    };

    // Direct Fine Settlement
    const handlePayFine = (loan: Loan) => {
        if (confirm(`Terima pembayaran denda sebesar Rp ${loan.fine_amount.toLocaleString('id-ID')} untuk transaksi ${loan.loan_code}?`)) {
            router.post(`/sirkulasi/${loan.id}/bayar-denda`, {}, {
                preserveScroll: true,
            });
        }
    };

    return (
        <AppLayout
            title="Meja Sirkulasi & Barcode Scanner"
            subtitle="Pencatatan peminjaman cepat, validasi otomatis kartu anggota, pengembalian buku, kalkulasi denda keterlambatan, dan perpanjangan mandiri."
        >
            <Head title="Sirkulasi & Barcode - Perpustakaan Cendekia" />

            {/* Top Operational Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
                <div className="p-4 bg-white border border-[#ded7c4] rounded-xs shadow-2xs">
                    <div className="text-[11px] font-mono text-[#787161] uppercase tracking-wider">Pinjaman Aktif</div>
                    <div className="text-2xl font-serif font-bold text-[#191816] mt-0.5">{stats.total_active} Buku</div>
                    <div className="text-[11px] text-[#8a816e] mt-0.5">Sedang di tangan siswa/guru</div>
                </div>
                <div className="p-4 bg-white border border-[#ded7c4] rounded-xs shadow-2xs">
                    <div className="text-[11px] font-mono text-[#787161] uppercase tracking-wider">Terlambat (Overdue)</div>
                    <div className="text-2xl font-serif font-bold text-[#991b1b] mt-0.5">{stats.total_overdue} Buku</div>
                    <div className="text-[11px] text-[#8a816e] mt-0.5">Melewati batas jatuh tempo</div>
                </div>
                <div className="p-4 bg-white border border-[#ded7c4] rounded-xs shadow-2xs">
                    <div className="text-[11px] font-mono text-[#787161] uppercase tracking-wider">Kembali Bulan Ini</div>
                    <div className="text-2xl font-serif font-bold text-[#164e3b] mt-0.5">{stats.total_returned_this_month} Buku</div>
                    <div className="text-[11px] text-[#8a816e] mt-0.5">Sirkulasi sukses diselesaikan</div>
                </div>
                <div className="p-4 bg-white border border-[#ded7c4] rounded-xs shadow-2xs">
                    <div className="text-[11px] font-mono text-[#787161] uppercase tracking-wider">Denda Tertunggak</div>
                    <div className="text-2xl font-serif font-bold text-[#b45309] mt-0.5">
                        Rp {stats.unpaid_fines_sum.toLocaleString('id-ID')}
                    </div>
                    <div className="text-[11px] text-[#8a816e] mt-0.5">Tarif: Rp {setting.daily_fine_rate.toLocaleString('id-ID')}/hari</div>
                </div>
            </div>

            {/* Navigation Tab Bar */}
            <div className="flex border-b border-[#ded7c4] bg-[#f8f4ea] rounded-t-xs text-[13px] font-medium overflow-x-auto">
                <button
                    type="button"
                    onClick={() => setActiveTab('scan')}
                    className={`px-5 py-3 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
                        activeTab === 'scan'
                            ? 'border-[#164e3b] text-[#164e3b] bg-white font-bold'
                            : 'border-transparent text-[#666051] hover:text-[#191816]'
                    }`}
                >
                    <IconBarcode size={16} />
                    <span>Meja Sirkulasi Scanner (Peminjaman & Pengembalian)</span>
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab('active')}
                    className={`px-5 py-3 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
                        activeTab === 'active'
                            ? 'border-[#164e3b] text-[#164e3b] bg-white font-bold'
                            : 'border-transparent text-[#666051] hover:text-[#191816]'
                    }`}
                >
                    <IconRepeat size={16} />
                    <span>Daftar Transaksi Aktif ({activeLoans.total})</span>
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab('completed')}
                    className={`px-5 py-3 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
                        activeTab === 'completed'
                            ? 'border-[#164e3b] text-[#164e3b] bg-white font-bold'
                            : 'border-transparent text-[#666051] hover:text-[#191816]'
                    }`}
                >
                    <IconCheckCircle size={16} />
                    <span>Riwayat Pengembalian & Denda ({completedLoans.total})</span>
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
                    <IconClock size={16} />
                    <span>Antrean Booking ({reservations.length})</span>
                </button>
            </div>

            {/* TAB 1: MEJA SCANNER SIRKULASI WORKBENCH */}
            {activeTab === 'scan' && (
                <div className="bg-white border-x border-b border-[#ded7c4] rounded-b-xs p-6 shadow-xs">
                    {/* Mode Selector Toggle */}
                    <div className="flex items-center gap-2 p-1.5 bg-[#f4eee1] border border-[#dcd4c2] rounded-xs max-w-md mx-auto mb-8 text-[13px]">
                        <button
                            type="button"
                            onClick={() => setScanMode('pinjam')}
                            className={`flex-1 py-2 font-medium rounded-xs transition-all flex items-center justify-center gap-2 ${
                                scanMode === 'pinjam'
                                    ? 'bg-[#164e3b] text-white shadow-xs font-semibold'
                                    : 'text-[#5c5649] hover:bg-white/60'
                            }`}
                        >
                            <IconBarcode size={16} />
                            <span>1. Transaksi Peminjaman Baru</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setScanMode('kembali')}
                            className={`flex-1 py-2 font-medium rounded-xs transition-all flex items-center justify-center gap-2 ${
                                scanMode === 'kembali'
                                    ? 'bg-[#164e3b] text-white shadow-xs font-semibold'
                                    : 'text-[#5c5649] hover:bg-white/60'
                            }`}
                        >
                            <IconCheckCircle size={16} />
                            <span>2. Pengembalian & Hitung Denda</span>
                        </button>
                    </div>

                    {/* SUBMODE A: PEMINJAMAN CEPAT */}
                    {scanMode === 'pinjam' && (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                            {/* STEP 1: SCAN KARTU PELAJAR */}
                            <div className="lg:col-span-6 bg-[#faf8f5] border border-[#ded7c4] rounded-xs p-5 space-y-4">
                                <div className="flex items-center justify-between pb-3 border-b border-[#ebe4d3]">
                                    <div className="flex items-center gap-2">
                                        <span className="w-6 h-6 rounded-full bg-[#164e3b] text-white text-[12px] font-mono font-bold flex items-center justify-center">
                                            1
                                        </span>
                                        <h3 className="font-serif font-bold text-base text-[#191816]">
                                            Pindai Kartu Anggota (NIS / NIP)
                                        </h3>
                                    </div>
                                    <span className="text-[11px] font-mono text-[#787161]">Validasi Sistem</span>
                                </div>

                                <form onSubmit={handleLookupMember} className="flex gap-2">
                                    <div className="relative flex-1">
                                        <IconBarcode className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8a816e]" size={16} />
                                        <input
                                            type="text"
                                            value={memberCodeInput}
                                            onChange={(e) => setMemberCodeInput(e.target.value)}
                                            placeholder="Pindai barcode kartu / ketik NIS (misal: NIS-2024-001)"
                                            className="w-full pl-9 pr-3 py-2 bg-white border border-[#d6cebc] rounded-xs text-[13px] font-mono focus:outline-hidden focus:border-[#164e3b]"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isLookingUpMember}
                                        className="px-4 py-2 bg-[#164e3b] hover:bg-[#0f392b] text-white text-[13px] font-medium rounded-xs shadow-xs transition-colors shrink-0"
                                    >
                                        {isLookingUpMember ? 'Memvalidasi...' : 'Verifikasi'}
                                    </button>
                                </form>

                                {/* Sample Quick Test Pills */}
                                <div className="flex items-center gap-1.5 flex-wrap text-[11px] text-[#736c5e]">
                                    <span>Tes Cepat:</span>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setMemberCodeInput('NIS-2024-001');
                                        }}
                                        className="underline hover:text-[#164e3b] font-mono"
                                    >
                                        NIS-2024-001 (Rizky - Lolos)
                                    </button>
                                    <span>•</span>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setMemberCodeInput('NIS-2024-002');
                                        }}
                                        className="underline hover:text-[#991b1b] font-mono"
                                    >
                                        NIS-2024-002 (Nabila - Tertunggak Denda)
                                    </button>
                                </div>

                                {/* Scanned Member Validation Ledger */}
                                {scannedMember && (
                                    <div className="mt-4 pt-4 border-t border-[#ded7c4] space-y-3">
                                        {/* Status Eligibility Banner */}
                                        <div
                                            className={`p-3 rounded-xs text-[12px] flex items-start gap-2.5 ${
                                                scannedMember.eligibility.allowed
                                                    ? 'bg-[#e8f5ed] border border-[#a3d9b8] text-[#134e31]'
                                                    : 'bg-[#fee2e2] border border-[#fca5a5] text-[#991b1b]'
                                            }`}
                                        >
                                            {scannedMember.eligibility.allowed ? (
                                                <IconCheckCircle size={18} className="text-[#198754] shrink-0 mt-0.5" />
                                            ) : (
                                                <IconAlertCircle size={18} className="text-[#dc2626] shrink-0 mt-0.5" />
                                            )}
                                            <div>
                                                <div className="font-bold">
                                                    {scannedMember.eligibility.allowed
                                                        ? '✓ LOLOS VALIDASI: ANGGOTA BERHAK MEMINJAM'
                                                        : '✕ VALIDASI DITOLAK: TIDAK MEMENUHI SYARAT'}
                                                </div>
                                                {scannedMember.eligibility.reason && (
                                                    <div className="mt-0.5 font-sans leading-relaxed">
                                                        {scannedMember.eligibility.reason}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Member Spec */}
                                        <div className="bg-white border border-[#ded7c4] p-3.5 rounded-xs space-y-1.5 text-[12px]">
                                            <div className="flex justify-between">
                                                <span className="text-[#787161]">Nama Anggota:</span>
                                                <strong className="text-[#191816]">{scannedMember.user.name}</strong>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-[#787161]">NIS / NIP:</span>
                                                <span className="font-mono text-[#191816]">{scannedMember.user.identity_number}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-[#787161]">Kelas / Unit:</span>
                                                <span className="text-[#191816]">{scannedMember.user.class_name}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-[#787161]">Pinjaman Aktif:</span>
                                                <span className="font-semibold text-[#191816]">
                                                    {scannedMember.user.active_loans_count} dari batas maks {scannedMember.user.max_loan_limit} buku
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-[#787161]">Tunggakan Denda:</span>
                                                <span className={scannedMember.user.unpaid_fines > 0 ? 'text-[#dc2626] font-bold' : 'text-[#198754] font-semibold'}>
                                                    Rp {scannedMember.user.unpaid_fines.toLocaleString('id-ID')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* STEP 2: SCAN BARCODE BUKU & SELESAIKAN PINJAM */}
                            <div className="lg:col-span-6 bg-[#faf8f5] border border-[#ded7c4] rounded-xs p-5 space-y-4">
                                <div className="flex items-center justify-between pb-3 border-b border-[#ebe4d3]">
                                    <div className="flex items-center gap-2">
                                        <span className="w-6 h-6 rounded-full bg-[#164e3b] text-white text-[12px] font-mono font-bold flex items-center justify-center">
                                            2
                                        </span>
                                        <h3 className="font-serif font-bold text-base text-[#191816]">
                                            Pindai Barcode Buku Fisik
                                        </h3>
                                    </div>
                                    <span className="text-[11px] font-mono text-[#787161]">Eksemplar di Meja</span>
                                </div>

                                <form onSubmit={handleLookupBook} className="flex gap-2">
                                    <div className="relative flex-1">
                                        <IconBarcode className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8a816e]" size={16} />
                                        <input
                                            type="text"
                                            value={bookBarcodeInput}
                                            onChange={(e) => setBookBarcodeInput(e.target.value)}
                                            placeholder="Pindai barcode buku (misal: BK-899-00102 atau BK-515-00302)"
                                            className="w-full pl-9 pr-3 py-2 bg-white border border-[#d6cebc] rounded-xs text-[13px] font-mono focus:outline-hidden focus:border-[#164e3b]"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isLookingUpBook}
                                        className="px-4 py-2 bg-[#164e3b] hover:bg-[#0f392b] text-white text-[13px] font-medium rounded-xs shadow-xs transition-colors shrink-0"
                                    >
                                        {isLookingUpBook ? 'Mencari...' : 'Cari Buku'}
                                    </button>
                                </form>

                                {/* Sample Quick Test Pills for Book Barcode */}
                                <div className="flex items-center gap-1.5 flex-wrap text-[11px] text-[#736c5e]">
                                    <span>Tes Barcode:</span>
                                    <button
                                        type="button"
                                        onClick={() => setBookBarcodeInput('BK-899-00102')}
                                        className="underline hover:text-[#164e3b] font-mono"
                                    >
                                        BK-899-00102 (Laskar Pelangi k.2)
                                    </button>
                                    <span>•</span>
                                    <button
                                        type="button"
                                        onClick={() => setBookBarcodeInput('BK-515-00302')}
                                        className="underline hover:text-[#164e3b] font-mono"
                                    >
                                        BK-515-00302 (Kalkulus Purcell k.2)
                                    </button>
                                </div>

                                {/* Scanned Book Preview */}
                                {scannedBook && (
                                    <div className="mt-4 pt-4 border-t border-[#ded7c4] space-y-3">
                                        <div className="bg-white border border-[#ded7c4] p-4 rounded-xs flex gap-3.5">
                                            <div className="w-14 h-20 bg-[#f4eee1] border border-[#ded7c4] shrink-0 overflow-hidden rounded-2xs">
                                                {scannedBook.book.cover_image ? (
                                                    <img
                                                        src={scannedBook.book.cover_image}
                                                        alt="Cover"
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <IconBook size={24} className="m-auto text-[#8a816e]" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0 text-[12px]">
                                                <div className="font-serif font-bold text-[14px] text-[#191816] truncate">
                                                    {scannedBook.book.title}
                                                </div>
                                                <div className="text-[#6d6657] truncate mt-0.5">
                                                    {scannedBook.book.author} • {scannedBook.book.publisher}
                                                </div>
                                                <div className="mt-2 flex items-center gap-2">
                                                    <span className="font-mono text-[#164e3b] bg-[#e8f5ed] px-2 py-0.5 rounded-2xs font-semibold">
                                                        {scannedBook.barcode}
                                                    </span>
                                                    <span className="text-[#787161] font-mono">
                                                        Call: {scannedBook.call_number}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-[12px] font-semibold text-[#191816] mb-1">
                                                Catatan Peminjaman (Opsional)
                                            </label>
                                            <input
                                                type="text"
                                                value={loanNotes}
                                                onChange={(e) => setLoanNotes(e.target.value)}
                                                placeholder="Contoh: Keperluan tugas olimpiade sains / referensi makalah"
                                                className="w-full px-3 py-1.5 bg-white border border-[#d6cebc] rounded-xs text-[12px] focus:outline-hidden focus:border-[#164e3b]"
                                            />
                                        </div>

                                        {/* Action Button */}
                                        <div className="pt-2">
                                            <button
                                                type="button"
                                                onClick={handleBorrowSubmit}
                                                disabled={!scannedMember?.eligibility.allowed}
                                                className="w-full py-3 px-4 bg-[#164e3b] hover:bg-[#0f392b] text-white text-[14px] font-bold rounded-xs shadow-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                            >
                                                <IconCheck size={18} />
                                                <span>Selesaikan Transaksi Peminjaman (+{setting.loan_duration_days} Hari)</span>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* SUBMODE B: PENGEMBALIAN & KALKULASI DENDA */}
                    {scanMode === 'kembali' && (
                        <div className="max-w-2xl mx-auto bg-[#faf8f5] border border-[#ded7c4] rounded-xs p-6 space-y-6">
                            <div className="text-center pb-4 border-b border-[#ded7c4]">
                                <h3 className="text-lg font-serif font-bold text-[#191816]">
                                    Pindai Barcode Buku untuk Pengembalian
                                </h3>
                                <p className="text-[13px] text-[#6d6657] mt-1">
                                    Sistem akan otomatis mencocokkan tanggal jatuh tempo dan menghitung denda jika terlambat (Rp {setting.daily_fine_rate.toLocaleString('id-ID')}/hari).
                                </p>
                            </div>

                            <form onSubmit={handleLookupReturn} className="flex gap-2">
                                <div className="relative flex-1">
                                    <IconBarcode className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8a816e]" size={18} />
                                    <input
                                        type="text"
                                        value={returnQueryInput}
                                        onChange={(e) => setReturnQueryInput(e.target.value)}
                                        placeholder="Pindai barcode buku (misal: BK-899-00101 untuk tes buku terlambat)"
                                        className="w-full pl-10 pr-3 py-2.5 bg-white border border-[#d6cebc] rounded-xs text-[14px] font-mono focus:outline-hidden focus:border-[#164e3b]"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="px-6 py-2.5 bg-[#164e3b] hover:bg-[#0f392b] text-white text-[13px] font-medium rounded-xs shadow-xs transition-colors shrink-0"
                                >
                                    Verifikasi Buku
                                </button>
                            </form>

                            {/* Sample Barcode for Late Return */}
                            <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#736c5e]">
                                <span>Tes Pengembalian Terlambat:</span>
                                <button
                                    type="button"
                                    onClick={() => setReturnQueryInput('BK-899-00101')}
                                    className="underline hover:text-[#991b1b] font-mono font-bold"
                                >
                                    BK-899-00101 (Laskar Pelangi - Telat 5 Hari)
                                </button>
                                <span>•</span>
                                <button
                                    type="button"
                                    onClick={() => setReturnQueryInput('BK-515-00301')}
                                    className="underline hover:text-[#164e3b] font-mono"
                                >
                                    BK-515-00301 (Kalkulus Purcell - Tepat Waktu)
                                </button>
                            </div>

                            {/* Return Breakdown Ledger Card */}
                            {returnLookupData && (
                                <div className="bg-white border border-[#ded7c4] rounded-xs p-5 space-y-4">
                                    <div className="flex items-start justify-between gap-4 pb-3 border-b border-[#ece6d5]">
                                        <div>
                                            <h4 className="font-serif font-bold text-[16px] text-[#191816]">
                                                {returnLookupData.copy.book.title}
                                            </h4>
                                            <div className="text-[12px] text-[#6d6657] mt-0.5">
                                                Barcode: <strong className="font-mono">{returnLookupData.copy.barcode}</strong> • Peminjam:{' '}
                                                <strong>{returnLookupData.active_loan?.borrower_name}</strong> ({returnLookupData.active_loan?.borrower_identity})
                                            </div>
                                        </div>
                                        <BarcodeBadge code={returnLookupData.copy.barcode} compact={true} />
                                    </div>

                                    {/* Due Date & Overdue Math */}
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-[12px] bg-[#faf8f5] p-3 rounded-xs border border-[#ded7c4]">
                                        <div>
                                            <span className="text-[#787161]">Tanggal Pinjam:</span>
                                            <div className="font-semibold text-[#191816] mt-0.5">{returnLookupData.active_loan?.borrow_date}</div>
                                        </div>
                                        <div>
                                            <span className="text-[#787161]">Batas Jatuh Tempo:</span>
                                            <div className="font-semibold text-[#191816] mt-0.5">{returnLookupData.active_loan?.due_date}</div>
                                        </div>
                                        <div>
                                            <span className="text-[#787161]">Status Keterlambatan:</span>
                                            <div className="mt-0.5">
                                                {returnLookupData.active_loan?.days_overdue > 0 ? (
                                                    <span className="text-[#dc2626] font-bold">
                                                        Terlambat {returnLookupData.active_loan?.days_overdue} Hari
                                                    </span>
                                                ) : (
                                                    <span className="text-[#198754] font-bold">
                                                        ✓ Tepat Waktu
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Fine Calculation Row */}
                                    {returnLookupData.active_loan?.calculated_fine > 0 && (
                                        <div className="p-3 bg-[#fee2e2] border border-[#fca5a5] rounded-xs flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-[#991b1b] text-[13px]">
                                                <IconAlertCircle size={18} className="shrink-0" />
                                                <span>
                                                    Denda Terlambat ({returnLookupData.active_loan?.days_overdue} hari × Rp {setting.daily_fine_rate.toLocaleString('id-ID')}):
                                                </span>
                                            </div>
                                            <span className="text-base font-serif font-bold text-[#991b1b]">
                                                Rp {returnLookupData.active_loan?.calculated_fine.toLocaleString('id-ID')}
                                            </span>
                                        </div>
                                    )}

                                    {/* Condition Selection */}
                                    <div className="space-y-3 pt-2 text-[13px]">
                                        <div>
                                            <label className="block font-semibold text-[#191816] mb-1">
                                                Kondisi Buku Saat Dikembalikan
                                            </label>
                                            <select
                                                value={returnCondition}
                                                onChange={(e) => setReturnCondition(e.target.value)}
                                                className="w-full px-3 py-2 bg-[#faf8f5] border border-[#d6cebc] rounded-xs text-[13px]"
                                            >
                                                <option value="baik">Kondisi Baik & Utuh (Layak Rak)</option>
                                                <option value="rusak_ringan">Rusak Ringan (Perlu Penjilidan/Perbaikan)</option>
                                                <option value="rusak_berat">Rusak Berat (Halaman Sobek/Basah)</option>
                                                <option value="hilang">Buku Hilang (Kompensasi Penggantian)</option>
                                            </select>
                                        </div>

                                        {returnCondition !== 'baik' && (
                                            <div>
                                                <label className="block font-semibold text-[#191816] mb-1">
                                                    Biaya Ganti Rugi / Denda Kerusakan (Rp)
                                                </label>
                                                <input
                                                    type="number"
                                                    value={additionalDamageFine}
                                                    onChange={(e) => setAdditionalDamageFine(Number(e.target.value))}
                                                    placeholder="0"
                                                    className="w-full px-3 py-2 bg-[#faf8f5] border border-[#d6cebc] rounded-xs text-[13px]"
                                                />
                                            </div>
                                        )}

                                        {/* Pay fine check */}
                                        {(returnLookupData.active_loan?.calculated_fine > 0 || additionalDamageFine > 0) && (
                                            <div className="flex items-center gap-2 pt-2">
                                                <input
                                                    type="checkbox"
                                                    id="payFineNow"
                                                    checked={payFineNow}
                                                    onChange={(e) => setPayFineNow(e.target.checked)}
                                                    className="w-4 h-4 text-[#164e3b] rounded-2xs border-[#d6cebc]"
                                                />
                                                <label htmlFor="payFineNow" className="text-[13px] text-[#3d382f]">
                                                    Terima pembayaran denda tunai sekarang (Tandai lunas di meja sirkulasi)
                                                </label>
                                            </div>
                                        )}
                                    </div>

                                    {/* Confirmation Button */}
                                    <div className="pt-3 border-t border-[#ded7c4]">
                                        <button
                                            type="button"
                                            onClick={handleReturnSubmit}
                                            className="w-full py-3 px-4 bg-[#164e3b] hover:bg-[#0f392b] text-white text-[14px] font-bold rounded-xs shadow-xs transition-colors flex items-center justify-center gap-2"
                                        >
                                            <IconCheck size={18} />
                                            <span>Konfirmasi Pengembalian Buku & Tutup Transaksi</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* TAB 2: DAFTAR TRANSAKSI AKTIF */}
            {activeTab === 'active' && (
                <div className="bg-white border-x border-b border-[#ded7c4] rounded-b-xs p-6 shadow-xs space-y-4">
                    <div className="flex items-center justify-between text-[13px] text-[#6d6657]">
                        <div>Daftar transaksi sirkulasi yang saat ini sedang dipinjam dan belum dikembalikan.</div>
                        <div>Total: <strong className="text-[#191816]">{activeLoans.total}</strong> buku</div>
                    </div>

                    <div className="overflow-x-auto border border-[#ded7c4] rounded-xs">
                        <table className="w-full text-left text-[13px]">
                            <thead className="bg-[#f5efe2] text-[#4d483e] font-semibold border-b border-[#ded7c4]">
                                <tr>
                                    <th className="py-2.5 px-4">Kode Transaksi</th>
                                    <th className="py-2.5 px-4">Peminjam</th>
                                    <th className="py-2.5 px-4">Judul Buku & Barcode</th>
                                    <th className="py-2.5 px-4">Tgl Pinjam</th>
                                    <th className="py-2.5 px-4">Jatuh Tempo</th>
                                    <th className="py-2.5 px-4">Status & Denda</th>
                                    <th className="py-2.5 px-4 text-right">Aksi Layanan</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#ebe4d3]">
                                {activeLoans.data.length > 0 ? (
                                    activeLoans.data.map((loan) => {
                                        const isOverdue = loan.status === 'terlambat';
                                        return (
                                            <tr key={loan.id} className="hover:bg-[#faf8f5] transition-colors">
                                                <td className="py-3 px-4 font-mono font-bold text-[#164e3b]">
                                                    {loan.loan_code}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="font-semibold text-[#191816]">{loan.user?.name}</div>
                                                    <div className="text-[11px] text-[#787161] font-mono">
                                                        {loan.user?.identity_number} • {loan.user?.class_name}
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4 max-w-xs">
                                                    <div className="font-medium text-[#191816] truncate">
                                                        {loan.book_copy?.book?.title}
                                                    </div>
                                                    <div className="text-[11px] text-[#787161] font-mono">
                                                        Barcode: {loan.book_copy?.barcode}
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4 text-[#5e5748] font-mono">{loan.borrow_date}</td>
                                                <td className="py-3 px-4 font-mono">
                                                    <span className={isOverdue ? 'text-[#dc2626] font-bold' : 'text-[#191816]'}>
                                                        {loan.due_date}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4">
                                                    {isOverdue ? (
                                                        <div>
                                                            <span className="px-2 py-0.5 rounded-2xs text-[11px] font-bold bg-[#fee2e2] text-[#991b1b] border border-[#fca5a5]">
                                                                Terlambat
                                                            </span>
                                                            {loan.fine_amount > 0 && (
                                                                <div className="text-[11px] text-[#991b1b] font-mono font-bold mt-1">
                                                                    Denda: Rp {loan.fine_amount.toLocaleString('id-ID')}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="px-2 py-0.5 rounded-2xs text-[11px] font-semibold bg-[#e8f5ed] text-[#134e31] border border-[#b2ddc4]">
                                                            Aktif Dipinjam
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-3 px-4 text-right">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        {/* Renewal button */}
                                                        {loan.renewed_count === 0 && !isOverdue && (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRenewLoan(loan)}
                                                                className="px-2.5 py-1 text-[11px] font-medium rounded-xs bg-[#f4eee1] text-[#3d382f] hover:bg-[#eae3d2] border border-[#ded7c4] transition-colors"
                                                            >
                                                                Perpanjang 1x
                                                            </button>
                                                        )}
                                                        {/* If overdue and fine unpaid */}
                                                        {loan.fine_status === 'unpaid' && (
                                                            <button
                                                                type="button"
                                                                onClick={() => handlePayFine(loan)}
                                                                className="px-2.5 py-1 text-[11px] font-medium rounded-xs bg-[#164e3b] text-white hover:bg-[#0f392b] shadow-xs"
                                                            >
                                                                Bayar Denda
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="text-center py-8 text-[#787161]">
                                            Tidak ada transaksi pinjaman aktif saat ini.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* TAB 3: RIWAYAT PENGEMBALIAN & DENDA */}
            {activeTab === 'completed' && (
                <div className="bg-white border-x border-b border-[#ded7c4] rounded-b-xs p-6 shadow-xs space-y-4">
                    <div className="flex items-center justify-between text-[13px] text-[#6d6657]">
                        <div>Log arsip sirkulasi buku yang telah dikembalikan ke rak atau diselesaikan.</div>
                        <div>Total: <strong className="text-[#191816]">{completedLoans.total}</strong> riwayat</div>
                    </div>

                    <div className="overflow-x-auto border border-[#ded7c4] rounded-xs">
                        <table className="w-full text-left text-[13px]">
                            <thead className="bg-[#f5efe2] text-[#4d483e] font-semibold border-b border-[#ded7c4]">
                                <tr>
                                    <th className="py-2.5 px-4">Kode Transaksi</th>
                                    <th className="py-2.5 px-4">Peminjam</th>
                                    <th className="py-2.5 px-4">Buku & Barcode</th>
                                    <th className="py-2.5 px-4">Tgl Kembali</th>
                                    <th className="py-2.5 px-4">Denda</th>
                                    <th className="py-2.5 px-4">Status Bayar</th>
                                    <th className="py-2.5 px-4">Catatan</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#ebe4d3]">
                                {completedLoans.data.map((loan) => (
                                    <tr key={loan.id} className="hover:bg-[#faf8f5]">
                                        <td className="py-3 px-4 font-mono font-semibold text-[#544e42]">{loan.loan_code}</td>
                                        <td className="py-3 px-4">
                                            <div className="font-semibold text-[#191816]">{loan.user?.name}</div>
                                            <div className="text-[11px] text-[#787161] font-mono">{loan.user?.class_name}</div>
                                        </td>
                                        <td className="py-3 px-4 max-w-xs truncate">{loan.book_copy?.book?.title}</td>
                                        <td className="py-3 px-4 font-mono text-[#5e5748]">{loan.return_date || '-'}</td>
                                        <td className="py-3 px-4 font-mono">
                                            {loan.fine_amount > 0 ? (
                                                <span className="font-bold text-[#991b1b]">
                                                    Rp {loan.fine_amount.toLocaleString('id-ID')}
                                                </span>
                                            ) : (
                                                <span className="text-[#198754]">Rp 0</span>
                                            )}
                                        </td>
                                        <td className="py-3 px-4">
                                            {loan.fine_status === 'paid' ? (
                                                <span className="px-2 py-0.5 rounded-2xs text-[11px] font-bold bg-[#e8f5ed] text-[#134e31] border border-[#a3d9b8]">
                                                    Lunas
                                                </span>
                                            ) : loan.fine_status === 'unpaid' ? (
                                                <span className="px-2 py-0.5 rounded-2xs text-[11px] font-bold bg-[#fee2e2] text-[#991b1b] border border-[#fca5a5]">
                                                    Belum Bayar
                                                </span>
                                            ) : (
                                                <span className="text-[#787161] text-[11px] font-mono">Bebas Denda</span>
                                            )}
                                        </td>
                                        <td className="py-3 px-4 text-[12px] text-[#6d6657] italic">
                                            {loan.notes || '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* TAB 4: ANTREAN RESERVASI */}
            {activeTab === 'reservasi' && (
                <div className="bg-white border-x border-b border-[#ded7c4] rounded-b-xs p-6 shadow-xs space-y-4">
                    <div className="text-[13px] text-[#6d6657]">
                        Daftar siswa/guru yang memesan buku populer yang sedang dipinjam. Saat buku dikembalikan, sistem otomatis memprioritaskan antrean ini.
                    </div>

                    <div className="overflow-x-auto border border-[#ded7c4] rounded-xs">
                        <table className="w-full text-left text-[13px]">
                            <thead className="bg-[#f5efe2] text-[#4d483e] font-semibold border-b border-[#ded7c4]">
                                <tr>
                                    <th className="py-2.5 px-4">Nomor Antrean</th>
                                    <th className="py-2.5 px-4">Judul Buku yang Dipesan</th>
                                    <th className="py-2.5 px-4">Nama Pemesan</th>
                                    <th className="py-2.5 px-4">Kelas / Rombel</th>
                                    <th className="py-2.5 px-4">Tanggal Reservasi</th>
                                    <th className="py-2.5 px-4">Status Antrean</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#ebe4d3]">
                                {reservations.length > 0 ? (
                                    reservations.map((res) => (
                                        <tr key={res.id} className="hover:bg-[#faf8f5]">
                                            <td className="py-3 px-4 font-mono font-bold text-[#164e3b]">
                                                Antrean #{res.queue_position}
                                            </td>
                                            <td className="py-3 px-4 font-semibold text-[#191816]">
                                                {res.book?.title}
                                            </td>
                                            <td className="py-3 px-4 text-[#454137]">
                                                {res.user?.name}
                                            </td>
                                            <td className="py-3 px-4 font-mono text-[#787161]">
                                                {res.user?.class_name}
                                            </td>
                                            <td className="py-3 px-4 font-mono text-[#5e5748]">
                                                {res.reservation_date}
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className="px-2 py-0.5 rounded-2xs text-[11px] font-semibold bg-[#fef3c7] text-[#92400e] border border-[#fcd34d]">
                                                    Menunggu Ketersediaan
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="text-center py-8 text-[#787161]">
                                            Tidak ada antrean reservasi aktif.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
