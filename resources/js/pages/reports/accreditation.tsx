import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { IconPrinter, IconBookOpen, IconCheckCircle } from '@/components/icons';

interface AccreditationProps {
    booksByCategory: Array<{
        code: string;
        name: string;
        titles_count: number;
        copies_count: number;
    }>;
    metrics: {
        total_titles: number;
        total_copies: number;
        total_members: number;
        total_loans: number;
        total_attendance: number;
        total_fines_collected: number;
    };
    setting: {
        library_name: string;
        institution_name: string;
        head_librarian_name: string;
        head_librarian_nip: string;
    };
}

export default function AccreditationReport({
    booksByCategory,
    metrics,
    setting,
}: AccreditationProps) {
    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="min-h-screen bg-[#ede8dc] py-8 px-4 flex flex-col items-center print:bg-white print:p-0">
            <Head title="Laporan Portofolio Akreditasi Perpustakaan Sekolah" />

            {/* Action Bar (Hidden on print) */}
            <div className="w-full max-w-4xl flex items-center justify-between mb-6 no-print bg-white p-3.5 rounded-xs border border-[#ded7c4] shadow-xs">
                <Link
                    href="/laporan"
                    className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#454137] hover:text-[#164e3b]"
                >
                    ← Kembali ke Dashboard Laporan
                </Link>

                <button
                    type="button"
                    onClick={handlePrint}
                    className="inline-flex items-center gap-2 px-5 py-2 bg-[#164e3b] hover:bg-[#0f392b] text-white text-[13px] font-bold rounded-xs shadow-xs transition-colors"
                >
                    <IconPrinter size={16} />
                    <span>Cetak Dokumen Akreditasi (A4 / PDF)</span>
                </button>
            </div>

            {/* Official Report Document */}
            <div className="w-full max-w-4xl bg-white p-10 sm:p-14 border border-[#cfc7b4] shadow-md print:border-none print:shadow-none print:p-6 text-[#111110] font-serif leading-normal">
                {/* Official Letterhead */}
                <div className="text-center pb-4 border-b-4 border-double border-[#191816]">
                    <div className="text-[12px] font-sans uppercase tracking-widest text-[#3d3a33] font-semibold">
                        KEMENTERIAN PENDIDIKAN, KEBUDAYAAN, RISET, DAN TEKNOLOGI
                    </div>
                    <div className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-[#191816] mt-0.5">
                        {setting.institution_name}
                    </div>
                    <div className="text-sm font-semibold tracking-wide text-[#164e3b] mt-0.5 font-sans">
                        PORTOFOLIO INSTRUMEN AKREDITASI PERPUSTAKAAN SEKOLAH (STANDAR SNP 009:2020)
                    </div>
                    <div className="text-[11px] font-sans text-[#5c574c] mt-1">
                        Disusun untuk Penilaian Akreditasi Perpustakaan Nasional Republik Indonesia
                    </div>
                </div>

                {/* Document Title */}
                <div className="text-center my-6">
                    <h2 className="text-lg sm:text-xl font-bold uppercase tracking-wide text-[#191816]">
                        LAPORAN EVALUASI DIRI & DATA STATISTIK PUSTAKA
                    </h2>
                    <div className="text-[12px] font-sans text-[#5c574c] mt-0.5 font-medium">
                        Periode Evaluasi Tahun Anggaran {new Date().getFullYear()} • Kategori: Perpustakaan Sekolah Menengah Atas
                    </div>
                </div>

                {/* Section 1: Profil & Metrik Kunci */}
                <div className="space-y-4 mb-8 text-[13px] font-sans">
                    <h3 className="font-serif font-bold text-base text-[#191816] border-b border-[#ded7c4] pb-1">
                        I. Data Umum & Ringkasan Indikator Kinerja Pustaka
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        <div className="p-3 bg-[#faf8f5] border border-[#e4decb] rounded-2xs">
                            <div className="text-[11px] text-[#787161]">Nama Institusi / Sekolah</div>
                            <strong className="text-[13px] text-[#191816] block mt-0.5">{setting.institution_name}</strong>
                        </div>
                        <div className="p-3 bg-[#faf8f5] border border-[#e4decb] rounded-2xs">
                            <div className="text-[11px] text-[#787161]">Nama Unit Perpustakaan</div>
                            <strong className="text-[13px] text-[#191816] block mt-0.5">{setting.library_name}</strong>
                        </div>
                        <div className="p-3 bg-[#faf8f5] border border-[#e4decb] rounded-2xs">
                            <div className="text-[11px] text-[#787161]">Kepala Perpustakaan</div>
                            <strong className="text-[13px] text-[#191816] block mt-0.5">{setting.head_librarian_name}</strong>
                        </div>
                        <div className="p-3 bg-[#faf8f5] border border-[#e4decb] rounded-2xs">
                            <div className="text-[11px] text-[#787161]">Kekayaan Koleksi (Judul)</div>
                            <strong className="text-[15px] font-mono text-[#164e3b] block mt-0.5">{metrics.total_titles.toLocaleString('id-ID')} Judul</strong>
                        </div>
                        <div className="p-3 bg-[#faf8f5] border border-[#e4decb] rounded-2xs">
                            <div className="text-[11px] text-[#787161]">Total Volume Fisik (Eksemplar)</div>
                            <strong className="text-[15px] font-mono text-[#164e3b] block mt-0.5">{metrics.total_copies.toLocaleString('id-ID')} Eksemplar</strong>
                        </div>
                        <div className="p-3 bg-[#faf8f5] border border-[#e4decb] rounded-2xs">
                            <div className="text-[11px] text-[#787161]">Jumlah Anggota Terdaftar</div>
                            <strong className="text-[15px] font-mono text-[#164e3b] block mt-0.5">{metrics.total_members.toLocaleString('id-ID')} Orang</strong>
                        </div>
                    </div>
                </div>

                {/* Section 2: Komposisi Koleksi Berdasarkan DDC */}
                <div className="space-y-4 mb-8 text-[13px] font-sans">
                    <h3 className="font-serif font-bold text-base text-[#191816] border-b border-[#ded7c4] pb-1">
                        II. Rekapitulasi Koleksi Berdasarkan Bagan Klasifikasi DDC
                    </h3>
                    <div className="border border-[#ded7c4] rounded-2xs overflow-hidden">
                        <table className="w-full text-left text-[12px]">
                            <thead className="bg-[#f5efe2] font-semibold text-[#4d483e] border-b border-[#ded7c4]">
                                <tr>
                                    <th className="py-2 px-3">Kelas DDC</th>
                                    <th className="py-2 px-3">Nama Bidang Ilmu</th>
                                    <th className="py-2 px-3 text-right">Jumlah Judul</th>
                                    <th className="py-2 px-3 text-right">Jumlah Eksemplar</th>
                                    <th className="py-2 px-3 text-right">Rasio Eksemplar/Judul</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#ebe4d3]">
                                {booksByCategory.map((cat) => {
                                    const ratio = cat.titles_count > 0 ? (cat.copies_count / cat.titles_count).toFixed(1) : '0';
                                    return (
                                        <tr key={cat.code}>
                                            <td className="py-2 px-3 font-mono font-bold text-[#164e3b]">{cat.code}</td>
                                            <td className="py-2 px-3 text-[#191816] font-medium">{cat.name}</td>
                                            <td className="py-2 px-3 text-right font-mono">{cat.titles_count}</td>
                                            <td className="py-2 px-3 text-right font-mono font-bold">{cat.copies_count}</td>
                                            <td className="py-2 px-3 text-right font-mono text-[#6d6657]">{ratio}x</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                            <tfoot className="bg-[#f5efe2] font-bold text-[#191816] border-t border-[#ded7c4]">
                                <tr>
                                    <td colSpan={2} className="py-2.5 px-3">Total Akumulasi Koleksi</td>
                                    <td className="py-2.5 px-3 text-right font-mono">{metrics.total_titles}</td>
                                    <td className="py-2.5 px-3 text-right font-mono">{metrics.total_copies}</td>
                                    <td className="py-2.5 px-3 text-right font-mono">
                                        {(metrics.total_copies / Math.max(1, metrics.total_titles)).toFixed(1)}x
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>

                {/* Section 3: Indikator Layanan Pemustaka */}
                <div className="space-y-4 mb-8 text-[13px] font-sans">
                    <h3 className="font-serif font-bold text-base text-[#191816] border-b border-[#ded7c4] pb-1">
                        III. Layanan Pemustaka & Pemanfaatan Fasilitas Sirkulasi
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                        <div className="p-3 bg-[#faf8f5] border border-[#e4decb] rounded-2xs">
                            <div className="text-[11px] text-[#787161]">Frekuensi Sirkulasi</div>
                            <div className="text-xl font-mono font-bold text-[#191816] mt-1">{metrics.total_loans}</div>
                            <div className="text-[10px] text-[#8a816e]">Buku dipinjam</div>
                        </div>
                        <div className="p-3 bg-[#faf8f5] border border-[#e4decb] rounded-2xs">
                            <div className="text-[11px] text-[#787161]">Kunjungan Pemustaka</div>
                            <div className="text-xl font-mono font-bold text-[#191816] mt-1">{metrics.total_attendance}</div>
                            <div className="text-[10px] text-[#8a816e]">Presensi tercatat</div>
                        </div>
                        <div className="p-3 bg-[#faf8f5] border border-[#e4decb] rounded-2xs">
                            <div className="text-[11px] text-[#787161]">Penerimaan Kas Denda</div>
                            <div className="text-xl font-mono font-bold text-[#191816] mt-1">
                                Rp {metrics.total_fines_collected.toLocaleString('id-ID')}
                            </div>
                            <div className="text-[10px] text-[#8a816e]">Transparansi kas</div>
                        </div>
                        <div className="p-3 bg-[#faf8f5] border border-[#e4decb] rounded-2xs">
                            <div className="text-[11px] text-[#787161]">Otomasi Barcode</div>
                            <div className="text-xl font-mono font-bold text-[#164e3b] mt-1">100%</div>
                            <div className="text-[10px] text-[#8a816e]">Terkomputerisasi</div>
                        </div>
                    </div>
                </div>

                {/* Validation and Signature Block */}
                <div className="mt-12 pt-6 grid grid-cols-2 gap-8 text-[13px] font-sans">
                    <div className="space-y-1">
                        <div className="text-[11px] text-[#787161] font-mono uppercase tracking-wider">
                            Pemeriksa / Asesor Akreditasi:
                        </div>
                        <div className="h-16 flex items-end">
                            <span className="text-[#a8a192] italic font-serif">(Tanda Tangan / Tanggal)</span>
                        </div>
                        <div className="font-semibold text-[#191816]">_____________________________</div>
                        <div className="text-[11px] text-[#6d6657]">Tim Asesor Akreditasi Perpustakaan</div>
                    </div>

                    <div className="text-right space-y-1">
                        <div className="text-[#3d3a33]">Kota Pelajar, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                        <div className="font-semibold text-[#191816]">Kepala Perpustakaan Sekolah,</div>
                        <div className="h-16 flex items-center justify-end">
                            <span className="text-[11px] font-mono text-[#164e3b] uppercase border border-[#164e3b]/30 px-2 py-0.5 rounded-2xs">
                                [ TTD & CAP RESMI ]
                            </span>
                        </div>
                        <div className="font-serif font-bold text-base text-[#191816] underline underline-offset-2">
                            {setting.head_librarian_name}
                        </div>
                        <div className="text-[11px] font-mono text-[#5c574c]">
                            NIP. {setting.head_librarian_nip}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
