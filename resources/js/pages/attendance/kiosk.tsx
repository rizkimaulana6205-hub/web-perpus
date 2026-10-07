import React, { useState, useEffect, useRef } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    IconBarcode,
    IconClock,
    IconUserCheck,
    IconUsers,
    IconBookOpen,
    IconCheckCircle,
    IconArrowRight,
    IconShield,
} from '@/components/icons';

interface AttendanceLog {
    id: number;
    identity_number: string;
    visitor_name: string;
    visitor_type: string;
    class_name: string | null;
    purpose: string;
    checkin_at: string;
}

interface KioskProps {
    recentLogs: AttendanceLog[];
    stats: {
        today_total: number;
        today_siswa: number;
        today_guru: number;
        today_tamu: number;
    };
}

export default function AttendanceKiosk({
    recentLogs = [],
    stats = { today_total: 0, today_siswa: 0, today_guru: 0, today_tamu: 0 },
}: KioskProps) {
    const [currentTime, setCurrentTime] = useState('');
    const [currentDate, setCurrentDate] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    const form = useForm({
        identity_number: '',
        visitor_name: '',
        visitor_type: 'siswa' as 'siswa' | 'guru' | 'tamu',
        class_name: '',
        purpose: 'Membaca',
    });

    useEffect(() => {
        const updateClock = () => {
            const now = new Date();
            setCurrentTime(now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WIB');
            setCurrentDate(now.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
        };
        updateClock();
        const timer = setInterval(updateClock, 1000);
        return () => clearInterval(timer);
    }, []);

    // Focus input on mount
    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post('/presensi/checkin', {
            preserveScroll: true,
            onSuccess: () => {
                form.reset('identity_number', 'visitor_name', 'class_name');
                inputRef.current?.focus();
            },
        });
    };

    const purposes = [
        'Membaca Buku',
        'Meminjam / Mengembalikan Buku',
        'Mengerjakan Tugas & Riset',
        'Diskusi Kelompok / Kelas',
        'Konsultasi Referensi',
        'Lainnya',
    ];

    return (
        <div className="min-h-screen bg-[#faf8f5] text-[#191816] flex flex-col justify-between">
            <Head title="Kiosk Presensi Mandiri - Buku Tamu Digital" />

            {/* Top Kiosk Header */}
            <header className="border-b border-[#ded7c4] bg-[#fdfbf7] px-6 py-4 shadow-2xs">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-sm bg-[#164e3b] text-white flex items-center justify-center font-bold shadow-xs">
                            <IconBookOpen size={22} />
                        </div>
                        <div>
                            <div className="text-[17px] font-serif font-bold text-[#191816] tracking-tight">
                                Buku Tamu Presensi Digital Perpustakaan
                            </div>
                            <div className="text-[11px] font-mono text-[#787161] uppercase tracking-wider">
                                Terminal Check-in Mandiri Pintu Masuk
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="text-right hidden sm:block">
                            <div className="text-[13px] font-mono font-bold text-[#164e3b]">
                                {currentTime}
                            </div>
                            <div className="text-[11px] text-[#787161]">
                                {currentDate}
                            </div>
                        </div>

                        <Link
                            href="/katalog"
                            className="px-3.5 py-1.5 rounded-xs border border-[#ded7c4] bg-[#f5efe2] text-[#454137] text-[12px] font-medium hover:bg-[#eae3d2] transition-colors"
                        >
                            Ke Katalog OPAC →
                        </Link>
                    </div>
                </div>
            </header>

            {/* Main Interactive Check-in Workspace */}
            <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 flex-1 flex flex-col justify-center">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Left: Check-in Scanner Form */}
                    <div className="lg:col-span-7 bg-white border border-[#ded7c4] rounded-xs p-6 sm:p-8 shadow-xs">
                        <div className="mb-6 pb-4 border-b border-[#ece6d5]">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-2xs bg-[#e8f5ed] text-[#134e31] text-[11px] font-mono font-semibold uppercase tracking-wider mb-2">
                                <span className="w-2 h-2 rounded-full bg-[#198754] animate-ping"></span>
                                Scanner Siap Menerima Input
                            </span>
                            <h2 className="text-2xl font-serif font-bold text-[#191816]">
                                Silakan Pindai Barcode Kartu Pelajar Anda
                            </h2>
                            <p className="text-[13px] text-[#6d6657] mt-1">
                                Dekatkan barcode pada kartu ke arah scanner, atau ketikkan NIS / NIP pada kolom di bawah ini.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Barcode / NIS Input Field */}
                            <div>
                                <label className="block text-[13px] font-bold text-[#191816] mb-1.5 font-mono">
                                    NOMOR INDUK SISWA (NIS) / BARCODE KARTU *
                                </label>
                                <div className="relative">
                                    <IconBarcode className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#164e3b]" size={20} />
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        required
                                        value={form.data.identity_number}
                                        onChange={(e) => form.setData('identity_number', e.target.value)}
                                        placeholder="Contoh: NIS-2024-001 atau tempelkan kartu pada scanner"
                                        className="w-full pl-11 pr-4 py-3 bg-[#faf8f5] border-2 border-[#164e3b]/40 rounded-xs text-[15px] font-mono font-bold text-[#191816] focus:outline-hidden focus:border-[#164e3b] focus:bg-white shadow-inner"
                                    />
                                </div>
                                <div className="flex items-center gap-2 mt-1.5 text-[11px] text-[#736c5e]">
                                    <span>Tes Cepat:</span>
                                    <button
                                        type="button"
                                        onClick={() => form.setData('identity_number', 'NIS-2024-001')}
                                        className="underline hover:text-[#164e3b] font-mono"
                                    >
                                        NIS-2024-001 (Rizky)
                                    </button>
                                    <span>•</span>
                                    <button
                                        type="button"
                                        onClick={() => form.setData('identity_number', 'NIS-2024-002')}
                                        className="underline hover:text-[#164e3b] font-mono"
                                    >
                                        NIS-2024-002 (Nabila)
                                    </button>
                                    <span>•</span>
                                    <button
                                        type="button"
                                        onClick={() => form.setData('identity_number', 'NIP-19820510 200801 1 009')}
                                        className="underline hover:text-[#164e3b] font-mono"
                                    >
                                        NIP Guru (Bambang)
                                    </button>
                                </div>
                            </div>

                            {/* Tujuan Kunjungan (Radio Selection) */}
                            <div>
                                <label className="block text-[13px] font-bold text-[#191816] mb-2 font-mono">
                                    TUJUAN KUNJUNGAN *
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {purposes.map((p) => (
                                        <button
                                            key={p}
                                            type="button"
                                            onClick={() => form.setData('purpose', p)}
                                            className={`p-2.5 text-left text-[12px] font-medium rounded-xs border transition-all flex items-center justify-between ${
                                                form.data.purpose === p
                                                    ? 'bg-[#164e3b] text-white border-[#164e3b] shadow-2xs font-semibold'
                                                    : 'bg-[#faf8f5] text-[#454137] border-[#ded7c4] hover:bg-[#f0e9db]'
                                            }`}
                                        >
                                            <span>{p}</span>
                                            {form.data.purpose === p && <IconCheckCircle size={14} />}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Tamu Tambahan Info (Opsional jika bukan siswa terdaftar) */}
                            <details className="text-[12px] text-[#6d6657] border border-[#e5ded0] p-3 rounded-xs bg-[#faf8f5]">
                                <summary className="cursor-pointer font-semibold text-[#423d32] hover:text-[#191816]">
                                    + Pengunjung Tamu Umum / Non-Siswa? (Klik untuk melengkapi nama)
                                </summary>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 pt-3 border-t border-[#ebe4d3]">
                                    <div>
                                        <label className="block mb-1 font-semibold text-[#191816]">Nama Lengkap:</label>
                                        <input
                                            type="text"
                                            value={form.data.visitor_name}
                                            onChange={(e) => form.setData('visitor_name', e.target.value)}
                                            placeholder="Nama pengunjung"
                                            className="w-full px-2.5 py-1.5 bg-white border border-[#d6cebc] rounded-xs text-[12px]"
                                        />
                                    </div>
                                    <div>
                                        <label className="block mb-1 font-semibold text-[#191816]">Kelas / Instansi:</label>
                                        <input
                                            type="text"
                                            value={form.data.class_name}
                                            onChange={(e) => form.setData('class_name', e.target.value)}
                                            placeholder="Contoh: Pengawas / Alumni / Tamu"
                                            className="w-full px-2.5 py-1.5 bg-white border border-[#d6cebc] rounded-xs text-[12px]"
                                        />
                                    </div>
                                </div>
                            </details>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={form.processing}
                                className="w-full py-3.5 px-4 bg-[#164e3b] hover:bg-[#0f392b] text-white text-[15px] font-bold rounded-xs shadow-xs transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                <IconUserCheck size={20} />
                                <span>{form.processing ? 'Merekam Presensi...' : 'KONFIRMASI PRESENSI KUNJUNGAN'}</span>
                            </button>
                        </form>
                    </div>

                    {/* Right: Today's Metrics & Live Feed */}
                    <div className="lg:col-span-5 space-y-6">
                        {/* Daily Counter */}
                        <div className="bg-white border border-[#ded7c4] rounded-xs p-5 shadow-2xs">
                            <div className="flex items-center justify-between pb-3 border-b border-[#ece6d5] mb-4">
                                <h3 className="font-serif font-bold text-base text-[#191816]">
                                    Statistik Kunjungan Hari Ini
                                </h3>
                                <span className="text-[11px] font-mono text-[#787161]">Waktu Nyata</span>
                            </div>

                            <div className="grid grid-cols-2 gap-3 text-center">
                                <div className="p-3 bg-[#f5efe2] rounded-xs border border-[#ded7c4]">
                                    <div className="text-[11px] font-mono uppercase text-[#787161]">Total Kunjungan</div>
                                    <div className="text-3xl font-serif font-bold text-[#164e3b] mt-1">
                                        {stats.today_total}
                                    </div>
                                    <div className="text-[11px] text-[#8a816e] mt-0.5">Orang Masuk</div>
                                </div>
                                <div className="p-3 bg-[#faf8f5] rounded-xs border border-[#ded7c4]">
                                    <div className="text-[11px] font-mono uppercase text-[#787161]">Siswa Aktif</div>
                                    <div className="text-2xl font-serif font-bold text-[#191816] mt-1">
                                        {stats.today_siswa}
                                    </div>
                                    <div className="text-[11px] text-[#8a816e] mt-0.5">Pelajar Sekolah</div>
                                </div>
                                <div className="p-3 bg-[#faf8f5] rounded-xs border border-[#ded7c4]">
                                    <div className="text-[11px] font-mono uppercase text-[#787161]">Dewan Guru</div>
                                    <div className="text-2xl font-serif font-bold text-[#191816] mt-1">
                                        {stats.today_guru}
                                    </div>
                                    <div className="text-[11px] text-[#8a816e] mt-0.5">Pendidik</div>
                                </div>
                                <div className="p-3 bg-[#faf8f5] rounded-xs border border-[#ded7c4]">
                                    <div className="text-[11px] font-mono uppercase text-[#787161]">Pengunjung Umum</div>
                                    <div className="text-2xl font-serif font-bold text-[#191816] mt-1">
                                        {stats.today_tamu}
                                    </div>
                                    <div className="text-[11px] text-[#8a816e] mt-0.5">Tamu Eksternal</div>
                                </div>
                            </div>
                        </div>

                        {/* Recent Check-in Feed */}
                        <div className="bg-white border border-[#ded7c4] rounded-xs p-5 shadow-2xs">
                            <div className="flex items-center justify-between pb-3 border-b border-[#ece6d5] mb-3">
                                <h3 className="font-serif font-bold text-base text-[#191816]">
                                    Log Presensi Terkini
                                </h3>
                                <Link
                                    href="/presensi/rekap"
                                    className="text-[12px] font-semibold text-[#164e3b] hover:underline"
                                >
                                    Lihat Rekap Lengkap →
                                </Link>
                            </div>

                            <div className="divide-y divide-[#ebe4d3] max-h-80 overflow-y-auto pr-1 text-[12px]">
                                {recentLogs.length > 0 ? (
                                    recentLogs.map((log) => (
                                        <div key={log.id} className="py-2.5 flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <div className="font-semibold text-[#191816] truncate">
                                                    {log.visitor_name}
                                                </div>
                                                <div className="text-[11px] text-[#787161] truncate font-mono">
                                                    {log.class_name || 'Umum'} • Tujuan: {log.purpose}
                                                </div>
                                            </div>
                                            <span className="font-mono text-[11px] text-[#164e3b] bg-[#e8f5ed] px-2 py-0.5 rounded-2xs shrink-0 font-semibold">
                                                {new Date(log.checkin_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-6 text-[#787161]">
                                        Belum ada data presensi hari ini.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer Banner */}
            <footer className="border-t border-[#ded7c4] bg-[#f4eee1] py-4 px-6 text-center text-[12px] text-[#736c5e]">
                <span>Sistem Presensi Buku Tamu Terintegrasi Perpustakaan Sekolah • Pindai kartu Anda setiap kali memasuki ruang perpustakaan.</span>
            </footer>
        </div>
    );
}
