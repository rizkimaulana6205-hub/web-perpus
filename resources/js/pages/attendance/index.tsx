import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/components/layout/AppLayout';
import {
    IconUsers,
    IconClock,
    IconSearch,
    IconFilter,
    IconUserCheck,
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

interface IndexProps {
    logs: {
        data: AttendanceLog[];
        current_page: number;
        last_page: number;
        total: number;
        prev_page_url: string | null;
        next_page_url: string | null;
    };
    filters: {
        date?: string;
        type?: string;
        q?: string;
    };
    summary: {
        total_visits: number;
        today_visits: number;
        this_month: number;
    };
}

export default function AttendanceIndex({
    logs = { data: [], current_page: 1, last_page: 1, total: 0, prev_page_url: null, next_page_url: null },
    filters = {},
    summary = { total_visits: 0, today_visits: 0, this_month: 0 },
}: IndexProps) {
    const safeFilters = (filters && typeof filters === 'object' && !Array.isArray(filters)) ? filters : {};

    const [searchQ, setSearchQ] = useState(typeof safeFilters.q === 'string' ? safeFilters.q : '');
    const [selectedDate, setSelectedDate] = useState(typeof safeFilters.date === 'string' ? safeFilters.date : '');
    const [selectedType, setSelectedType] = useState(typeof safeFilters.type === 'string' ? safeFilters.type : '');

    const handleFilter = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/presensi/rekap', {
            q: searchQ || undefined,
            date: selectedDate || undefined,
            type: selectedType || undefined,
        }, { preserveState: true });
    };

    return (
        <AppLayout
            title="Rekapitulasi Buku Tamu & Presensi Digital"
            subtitle="Rekaman jejak kunjungan harian siswa, dewan guru, dan tamu umum ke ruang perpustakaan."
            actions={
                <Link
                    href="/presensi/kiosk"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-[13px] font-medium rounded-xs bg-[#164e3b] text-white hover:bg-[#0f392b] shadow-xs transition-colors"
                >
                    <IconUserCheck size={16} />
                    <span>Buka Layar Kiosk Masuk</span>
                </Link>
            }
        >
            <Head title="Rekap Presensi Pengunjung - Perpustakaan Cendekia" />

            {/* Quick Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="p-4 bg-white border border-[#ded7c4] rounded-xs shadow-2xs">
                    <div className="text-[11px] font-mono uppercase text-[#787161]">Total Kunjungan Kumulatif</div>
                    <div className="text-2xl font-serif font-bold text-[#191816] mt-0.5">{summary.total_visits} Kunjungan</div>
                    <div className="text-[11px] text-[#8a816e] mt-0.5">Seluruh waktu tercatat</div>
                </div>
                <div className="p-4 bg-white border border-[#ded7c4] rounded-xs shadow-2xs">
                    <div className="text-[11px] font-mono uppercase text-[#787161]">Kunjungan Hari Ini</div>
                    <div className="text-2xl font-serif font-bold text-[#164e3b] mt-0.5">{summary.today_visits} Orang</div>
                    <div className="text-[11px] text-[#8a816e] mt-0.5">Presensi aktif hari ini</div>
                </div>
                <div className="p-4 bg-white border border-[#ded7c4] rounded-xs shadow-2xs">
                    <div className="text-[11px] font-mono uppercase text-[#787161]">Kunjungan Bulan Berjalan</div>
                    <div className="text-2xl font-serif font-bold text-[#191816] mt-0.5">{summary.this_month} Orang</div>
                    <div className="text-[11px] text-[#8a816e] mt-0.5">Bulan ini</div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white border border-[#ded7c4] rounded-xs p-4 mb-6 shadow-xs">
                <form onSubmit={handleFilter} className="flex flex-col sm:flex-row items-center gap-3">
                    <div className="relative flex-1 w-full">
                        <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8a816e]" size={16} />
                        <input
                            type="text"
                            value={searchQ}
                            onChange={(e) => setSearchQ(e.target.value)}
                            placeholder="Cari nama pengunjung, NIS, atau kelas..."
                            className="w-full pl-9 pr-3 py-2 bg-[#faf8f5] border border-[#d6cebc] rounded-xs text-[13px] focus:outline-hidden focus:border-[#164e3b]"
                        />
                    </div>

                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="px-3 py-2 bg-[#faf8f5] border border-[#d6cebc] rounded-xs text-[13px] text-[#332f26] shrink-0"
                    />

                    <select
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                        className="px-3 py-2 bg-[#faf8f5] border border-[#d6cebc] rounded-xs text-[13px] text-[#332f26] shrink-0"
                    >
                        <option value="">Semua Tipe Pengunjung</option>
                        <option value="siswa">Siswa</option>
                        <option value="guru">Guru</option>
                        <option value="tamu">Tamu Umum</option>
                    </select>

                    <button
                        type="submit"
                        className="px-4 py-2 bg-[#164e3b] hover:bg-[#0f392b] text-white text-[13px] font-medium rounded-xs shadow-xs transition-colors shrink-0"
                    >
                        Filter Data
                    </button>
                </form>
            </div>

            {/* Logs Table */}
            <div className="bg-white border border-[#ded7c4] rounded-xs overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-[13px]">
                        <thead className="bg-[#f5efe2] text-[#4d483e] font-semibold border-b border-[#ded7c4]">
                            <tr>
                                <th className="py-2.5 px-4">Waktu Check-in</th>
                                <th className="py-2.5 px-4">Identitas (NIS/NIP)</th>
                                <th className="py-2.5 px-4">Nama Pengunjung</th>
                                <th className="py-2.5 px-4">Kategori</th>
                                <th className="py-2.5 px-4">Kelas / Instansi</th>
                                <th className="py-2.5 px-4">Tujuan Kunjungan</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#ebe4d3]">
                            {logs.data.length > 0 ? (
                                logs.data.map((log) => (
                                    <tr key={log.id} className="hover:bg-[#faf8f5]">
                                        <td className="py-3 px-4 font-mono text-[#5e5748]">
                                            {new Date(log.checkin_at).toLocaleDateString('id-ID', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric',
                                            })}{' '}
                                            {new Date(log.checkin_at).toLocaleTimeString('id-ID', {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </td>
                                        <td className="py-3 px-4 font-mono font-semibold text-[#191816]">
                                            {log.identity_number}
                                        </td>
                                        <td className="py-3 px-4 font-semibold text-[#191816]">
                                            {log.visitor_name}
                                        </td>
                                        <td className="py-3 px-4">
                                            <span
                                                className={`px-2 py-0.5 rounded-2xs text-[11px] font-semibold uppercase font-mono ${
                                                    log.visitor_type === 'guru'
                                                        ? 'bg-[#dbeafe] text-[#1e40af] border border-[#bfdbfe]'
                                                        : log.visitor_type === 'siswa'
                                                        ? 'bg-[#e8f5ed] text-[#134e31] border border-[#b2ddc4]'
                                                        : 'bg-[#fef3c7] text-[#92400e] border border-[#fcd34d]'
                                                }`}
                                            >
                                                {log.visitor_type}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-[#5e5748]">
                                            {log.class_name || 'Umum'}
                                        </td>
                                        <td className="py-3 px-4 text-[#423d32]">
                                            {log.purpose}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="text-center py-8 text-[#787161]">
                                        Tidak ada catatan presensi yang sesuai kriteria.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {logs.last_page > 1 && (
                    <div className="flex items-center justify-between p-4 border-t border-[#ded7c4] text-[13px]">
                        <div className="text-[#6d6657]">
                            Halaman {logs.current_page} dari {logs.last_page} ({logs.total} total data)
                        </div>
                        <div className="flex items-center gap-2">
                            {logs.prev_page_url && (
                                <Link
                                    href={logs.prev_page_url}
                                    className="px-3 py-1.5 rounded-xs border border-[#d6cebc] bg-white text-[#454137] hover:bg-[#f5efe2]"
                                >
                                    ← Sebelumnya
                                </Link>
                            )}
                            {logs.next_page_url && (
                                <Link
                                    href={logs.next_page_url}
                                    className="px-3 py-1.5 rounded-xs border border-[#d6cebc] bg-white text-[#454137] hover:bg-[#f5efe2]"
                                >
                                    Selanjutnya →
                                </Link>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
