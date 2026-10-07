import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/components/layout/AppLayout';
import {
    IconBarChart,
    IconUsers,
    IconBook,
    IconCreditCard,
    IconPrinter,
    IconClock,
    IconCheckCircle,
    IconAlertCircle,
    IconArrowRight,
} from '@/components/icons';

interface VisitByClass {
    class_name: string;
    total: number;
}

interface HourlyData {
    hour: string;
    count: number;
}

interface PopularBook {
    id: number;
    title: string;
    author: string;
    publisher: string;
    ddc_code: string;
    total_copies: number;
    available_copies: number;
    total_borrowed: number;
    category?: {
        name: string;
    };
}

interface MonthlyCirculation {
    month: string;
    borrowed: number;
    returned: number;
}

interface FineSummary {
    fine_reason: string;
    total_amount: number;
    total_paid: number;
    count: number;
}

interface ReportsProps {
    visitsByClass: VisitByClass[];
    hourlyChartData: HourlyData[];
    popularBooks: PopularBook[];
    monthlyCirculation: MonthlyCirculation[];
    finePaidSum: number;
    fineUnpaidSum: number;
    fineByReason: FineSummary[];
    fineRecentTransactions: any[];
    accreditationMetrics: {
        total_titles: number;
        total_volumes: number;
        total_categories: number;
        total_members: number;
        total_teachers: number;
        total_students: number;
        total_visits_all_time: number;
        total_circulation_all_time: number;
        punctuality_rate: number;
    };
    setting: {
        library_name: string;
        daily_fine_rate: number;
    };
}

export default function ReportsIndex({
    visitsByClass,
    hourlyChartData,
    popularBooks,
    monthlyCirculation,
    finePaidSum,
    fineUnpaidSum,
    fineByReason,
    fineRecentTransactions,
    accreditationMetrics,
    setting,
}: ReportsProps) {
    const maxVisitsClass = Math.max(...visitsByClass.map((v) => v.total), 1);
    const maxHourly = Math.max(...hourlyChartData.map((h) => h.count), 1);
    const maxMonthly = Math.max(...monthlyCirculation.map((m) => Math.max(m.borrowed, m.returned)), 1);

    return (
        <AppLayout
            title="Laporan & Statistik Perpustakaan"
            subtitle="Analisis tren sirkulasi buku, demografi kunjungan kelas, jam tersibuk, buku paling diminati, dan transparansi kas denda."
            actions={
                <Link
                    href="/laporan/akreditasi"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#164e3b] hover:bg-[#0f392b] text-white text-[13px] font-bold rounded-xs shadow-xs transition-colors"
                >
                    <IconPrinter size={16} />
                    <span>Format Laporan Akreditasi Sekolah</span>
                </Link>
            }
        >
            <Head title="Laporan & Statistik - Perpustakaan Cendekia" />

            {/* High-Level Accreditation Metrics Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
                <div className="p-4 bg-white border border-[#ded7c4] rounded-xs shadow-2xs">
                    <div className="text-[11px] font-mono uppercase text-[#787161]">Total Sirkulasi Pinjaman</div>
                    <div className="text-2xl font-serif font-bold text-[#191816] mt-0.5">
                        {accreditationMetrics.total_circulation_all_time} Buku
                    </div>
                    <div className="text-[11px] text-[#8a816e] mt-0.5">Transaksi tercatat</div>
                </div>
                <div className="p-4 bg-white border border-[#ded7c4] rounded-xs shadow-2xs">
                    <div className="text-[11px] font-mono uppercase text-[#787161]">Kunjungan Pemustaka</div>
                    <div className="text-2xl font-serif font-bold text-[#191816] mt-0.5">
                        {accreditationMetrics.total_visits_all_time} Presensi
                    </div>
                    <div className="text-[11px] text-[#8a816e] mt-0.5">Buku tamu digital</div>
                </div>
                <div className="p-4 bg-white border border-[#ded7c4] rounded-xs shadow-2xs">
                    <div className="text-[11px] font-mono uppercase text-[#787161]">Kepatuhan Waktu Pinjam</div>
                    <div className="text-2xl font-serif font-bold text-[#164e3b] mt-0.5">
                        {accreditationMetrics.punctuality_rate}%
                    </div>
                    <div className="text-[11px] text-[#8a816e] mt-0.5">Tepat waktu tanpa denda</div>
                </div>
                <div className="p-4 bg-white border border-[#ded7c4] rounded-xs shadow-2xs">
                    <div className="text-[11px] font-mono uppercase text-[#787161]">Kas Denda Terkumpul</div>
                    <div className="text-2xl font-serif font-bold text-[#b45309] mt-0.5">
                        Rp {finePaidSum.toLocaleString('id-ID')}
                    </div>
                    <div className="text-[11px] text-[#8a816e] mt-0.5">Penerimaan resmi perpustakaan</div>
                </div>
            </div>

            {/* Charts Section: 2 Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
                {/* Chart 1: Frekuensi Kunjungan Siswa per Kelas */}
                <div className="lg:col-span-6 bg-white border border-[#ded7c4] rounded-xs p-6 shadow-xs">
                    <div className="flex items-center justify-between pb-3 border-b border-[#ece6d5] mb-5">
                        <div>
                            <h3 className="font-serif font-bold text-base text-[#191816]">
                                Frekuensi Kunjungan Siswa per Kelas
                            </h3>
                            <p className="text-[12px] text-[#6d6657] mt-0.5">
                                Tingkat keaktifan membaca dan presensi harian menurut rombongan belajar.
                            </p>
                        </div>
                        <IconUsers size={20} className="text-[#164e3b]" />
                    </div>

                    <div className="space-y-3.5">
                        {visitsByClass.map((vc) => {
                            const pct = Math.round((vc.total / maxVisitsClass) * 100);
                            return (
                                <div key={vc.class_name} className="space-y-1">
                                    <div className="flex justify-between text-[12px]">
                                        <span className="font-semibold text-[#191816]">{vc.class_name}</span>
                                        <span className="font-mono text-[#5c574c] font-bold">{vc.total} kunjungan</span>
                                    </div>
                                    <div className="w-full h-3 bg-[#f5efe2] rounded-2xs overflow-hidden border border-[#ded7c4]">
                                        <div
                                            className="h-full bg-[#164e3b] rounded-2xs transition-all duration-500"
                                            style={{ width: `${pct}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Chart 2: Jam Tersibuk Kunjungan (07:00 - 16:00) */}
                <div className="lg:col-span-6 bg-white border border-[#ded7c4] rounded-xs p-6 shadow-xs">
                    <div className="flex items-center justify-between pb-3 border-b border-[#ece6d5] mb-5">
                        <div>
                            <h3 className="font-serif font-bold text-base text-[#191816]">
                                Pola Jam Tersibuk Perpustakaan
                            </h3>
                            <p className="text-[12px] text-[#6d6657] mt-0.5">
                                Distribusi waktu check-in siswa untuk evaluasi pengaturan jam piket pustakawan.
                            </p>
                        </div>
                        <IconClock size={20} className="text-[#164e3b]" />
                    </div>

                    <div className="flex items-end gap-2 h-44 pt-6 px-2 border-b border-[#ded7c4]">
                        {hourlyChartData.map((item) => {
                            const barHeight = Math.max(8, Math.round((item.count / maxHourly) * 100));
                            return (
                                <div key={item.hour} className="flex-1 flex flex-col items-center gap-1 group relative">
                                    {/* Tooltip on hover */}
                                    <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity bg-[#191816] text-white text-[10px] py-0.5 px-1.5 rounded-2xs font-mono whitespace-nowrap pointer-events-none z-10">
                                        {item.count} kunjungan
                                    </div>
                                    <div
                                        className="w-full bg-[#3d7a64] group-hover:bg-[#164e3b] rounded-t-2xs transition-all duration-300"
                                        style={{ height: `${barHeight}%` }}
                                    />
                                    <span className="text-[9px] font-mono text-[#787161] rotate-[-45deg] origin-top-left mt-2">
                                        {item.hour.slice(0, 2)}:00
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                    <div className="mt-8 text-[11px] text-center text-[#787161] font-mono">
                        Puncak keramaian umumnya terjadi pada jam istirahat pertama (09:00 - 10:00) dan istirahat kedua (12:00 - 13:00).
                    </div>
                </div>
            </div>

            {/* Monthly Circulation Volume Bar Chart */}
            <div className="bg-white border border-[#ded7c4] rounded-xs p-6 mb-8 shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-[#ece6d5] mb-5">
                    <div>
                        <h3 className="font-serif font-bold text-base text-[#191816]">
                            Total Sirkulasi Buku Keluar-Masuk per Bulan
                        </h3>
                        <p className="text-[12px] text-[#6d6657] mt-0.5">
                            Perbandingan volume buku dipinjam (buku keluar) dan buku dikembalikan (buku masuk) dalam 6 bulan terakhir.
                        </p>
                    </div>
                    <div className="flex items-center gap-4 text-[12px]">
                        <span className="flex items-center gap-1.5 font-medium text-[#164e3b]">
                            <span className="w-3 h-3 bg-[#164e3b] rounded-2xs inline-block"></span>
                            Buku Dipinjam
                        </span>
                        <span className="flex items-center gap-1.5 font-medium text-[#b45309]">
                            <span className="w-3 h-3 bg-[#b45309] rounded-2xs inline-block"></span>
                            Buku Dikembalikan
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-6 gap-4 text-center">
                    {monthlyCirculation.map((m) => (
                        <div key={m.month} className="p-3 bg-[#faf8f5] border border-[#ded7c4] rounded-xs space-y-2">
                            <div className="text-[12px] font-mono font-bold text-[#191816]">{m.month}</div>
                            <div className="flex justify-center items-end gap-2 h-20">
                                <div
                                    className="w-5 bg-[#164e3b] rounded-t-2xs"
                                    style={{ height: `${Math.max(15, (m.borrowed / maxMonthly) * 100)}%` }}
                                    title={`Dipinjam: ${m.borrowed}`}
                                />
                                <div
                                    className="w-5 bg-[#b45309] rounded-t-2xs"
                                    style={{ height: `${Math.max(15, (m.returned / maxMonthly) * 100)}%` }}
                                    title={`Kembali: ${m.returned}`}
                                />
                            </div>
                            <div className="text-[11px] text-[#6d6657] font-mono">
                                <span className="text-[#164e3b] font-bold">{m.borrowed}</span> /{' '}
                                <span className="text-[#b45309] font-bold">{m.returned}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Popular Books Leaderboard */}
            <div className="bg-white border border-[#ded7c4] rounded-xs p-6 mb-8 shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-[#ece6d5] mb-4">
                    <div>
                        <h3 className="font-serif font-bold text-base text-[#191816]">
                            Koleksi Buku Paling Banyak Dipinjam (Buku Terpopuler)
                        </h3>
                        <p className="text-[12px] text-[#6d6657] mt-0.5">
                            Data rujukan utama untuk evaluasi anggaran pengadaan dan penambahan eksemplar buku berikutnya.
                        </p>
                    </div>
                    <span className="text-[11px] font-mono text-[#164e3b] bg-[#e8f5ed] px-2 py-0.5 rounded-2xs border border-[#a3d9b8]">
                        Top 10 Koleksi
                    </span>
                </div>

                <div className="overflow-x-auto border border-[#ded7c4] rounded-xs">
                    <table className="w-full text-left text-[13px]">
                        <thead className="bg-[#f5efe2] text-[#4d483e] font-semibold border-b border-[#ded7c4]">
                            <tr>
                                <th className="py-2.5 px-4">Peringkat</th>
                                <th className="py-2.5 px-4">Judul Buku & Penulis</th>
                                <th className="py-2.5 px-4">Klasifikasi DDC</th>
                                <th className="py-2.5 px-4">Total Eksemplar</th>
                                <th className="py-2.5 px-4">Ketersediaan Rak</th>
                                <th className="py-2.5 px-4 text-right">Frekuensi Sirkulasi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#ebe4d3]">
                            {popularBooks.map((book, index) => (
                                <tr key={book.id} className="hover:bg-[#faf8f5]">
                                    <td className="py-3 px-4 font-mono font-bold text-[#164e3b]">
                                        #{index + 1}
                                    </td>
                                    <td className="py-3 px-4">
                                        <Link
                                            href={`/katalog/buku/${book.id}`}
                                            className="font-bold text-[#191816] hover:text-[#164e3b] hover:underline"
                                        >
                                            {book.title}
                                        </Link>
                                        <div className="text-[11px] text-[#787161]">
                                            {book.author} • {book.publisher}
                                        </div>
                                    </td>
                                    <td className="py-3 px-4">
                                        <span className="px-1.5 py-0.5 rounded-2xs bg-[#f4eee1] text-[#524d42] font-mono text-[11px] border border-[#ded7c4]">
                                            DDC {book.ddc_code}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 font-mono text-[#5e5748]">
                                        {book.total_copies} Buku
                                    </td>
                                    <td className="py-3 px-4 font-mono">
                                        <span className={book.available_copies > 0 ? 'text-[#198754] font-semibold' : 'text-[#dc2626] font-semibold'}>
                                            {book.available_copies} Tersedia
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-right font-mono font-bold text-[#164e3b]">
                                        {book.total_borrowed} kali dipinjam
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Financial Ledger: Kas Denda Keterlambatan / Kerusakan */}
            <div className="bg-white border border-[#ded7c4] rounded-xs p-6 shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-[#ece6d5] mb-5">
                    <div>
                        <h3 className="font-serif font-bold text-base text-[#191816]">
                            Laporan Finansial Kas Denda & Ganti Rugi
                        </h3>
                        <p className="text-[12px] text-[#6d6657] mt-0.5">
                            Rekapitulasi transparan kas denda buku telat, rusak, atau hilang untuk pemeliharaan koleksi.
                        </p>
                    </div>
                    <IconCreditCard size={20} className="text-[#b45309]" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    <div className="p-4 bg-[#e8f5ed] border border-[#a3d9b8] rounded-xs">
                        <div className="text-[11px] font-mono uppercase text-[#134e31]">Kas Denda Terkumpul (Lunas)</div>
                        <div className="text-2xl font-serif font-bold text-[#134e31] mt-1">
                            Rp {finePaidSum.toLocaleString('id-ID')}
                        </div>
                        <div className="text-[11px] text-[#2e6b4c] mt-0.5">Tercatat di kas sirkulasi</div>
                    </div>
                    <div className="p-4 bg-[#fee2e2] border border-[#fca5a5] rounded-xs">
                        <div className="text-[11px] font-mono uppercase text-[#991b1b]">Denda Tertunggak (Belum Bayar)</div>
                        <div className="text-2xl font-serif font-bold text-[#991b1b] mt-1">
                            Rp {fineUnpaidSum.toLocaleString('id-ID')}
                        </div>
                        <div className="text-[11px] text-[#b91c1c] mt-0.5">Masih ditagihkan ke peminjam</div>
                    </div>
                    <div className="p-4 bg-[#faf8f5] border border-[#ded7c4] rounded-xs">
                        <div className="text-[11px] font-mono uppercase text-[#787161]">Ketentuan Tarif</div>
                        <div className="text-2xl font-serif font-bold text-[#191816] mt-1">
                            Rp {setting.daily_fine_rate.toLocaleString('id-ID')} / hari
                        </div>
                        <div className="text-[11px] text-[#8a816e] mt-0.5">Denda harian per eksemplar</div>
                    </div>
                </div>

                {/* Fine Breakdown by Reason */}
                <div className="overflow-x-auto border border-[#ded7c4] rounded-xs">
                    <table className="w-full text-left text-[13px]">
                        <thead className="bg-[#f5efe2] text-[#4d483e] font-semibold border-b border-[#ded7c4]">
                            <tr>
                                <th className="py-2.5 px-4">Kategori Pelanggaran</th>
                                <th className="py-2.5 px-4">Jumlah Kejadian</th>
                                <th className="py-2.5 px-4">Total Nominal Tagihan</th>
                                <th className="py-2.5 px-4">Kas Telah Dibayar</th>
                                <th className="py-2.5 px-4 text-right">Status Pelunasan</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#ebe4d3]">
                            {fineByReason.length > 0 ? (
                                fineByReason.map((f, i) => (
                                    <tr key={i} className="hover:bg-[#faf8f5]">
                                        <td className="py-3 px-4 font-semibold text-[#191816] capitalize">
                                            Denda {f.fine_reason}
                                        </td>
                                        <td className="py-3 px-4 font-mono text-[#5e5748]">
                                            {f.count} Transaksi
                                        </td>
                                        <td className="py-3 px-4 font-mono font-bold text-[#191816]">
                                            Rp {Number(f.total_amount).toLocaleString('id-ID')}
                                        </td>
                                        <td className="py-3 px-4 font-mono text-[#198754] font-semibold">
                                            Rp {Number(f.total_paid).toLocaleString('id-ID')}
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            {f.total_amount === f.total_paid ? (
                                                <span className="px-2 py-0.5 rounded-2xs text-[11px] font-bold bg-[#e8f5ed] text-[#134e31] border border-[#a3d9b8]">
                                                    100% Lunas
                                                </span>
                                            ) : (
                                                <span className="px-2 py-0.5 rounded-2xs text-[11px] font-bold bg-[#fef3c7] text-[#92400e] border border-[#fcd34d]">
                                                    Ada Tertunggak
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="text-center py-6 text-[#787161]">
                                        Tidak ada catatan denda yang terhimpun.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}
