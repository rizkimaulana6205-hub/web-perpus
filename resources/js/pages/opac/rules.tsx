import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/components/layout/AppLayout';
import {
    IconClock,
    IconBookOpen,
    IconShield,
    IconCheckCircle,
    IconAlertCircle,
    IconArrowRight,
} from '@/components/icons';

interface Settings {
    library_name: string;
    institution_name: string;
    head_librarian_name: string;
    head_librarian_nip: string;
    opening_hours: string;
    loan_duration_days: number;
    daily_fine_rate: number;
    max_loan_siswa: number;
    max_loan_guru: number;
    rules_text?: string;
}

interface RulesProps {
    settings: Settings;
}

export default function OpacRules({ settings }: RulesProps) {
    const ddcClasses = [
        { code: '000', name: 'Karya Umum, Komputer & Informasi', rack: 'Rak TI T-01 s/d T-03 (Lt. 2)' },
        { code: '100', name: 'Filsafat, Etika & Psikologi', rack: 'Rak Filsafat P-01 (Lt. 1)' },
        { code: '200', name: 'Agama & Teologi', rack: 'Rak Religi R-01 s/d R-02 (Lt. 1)' },
        { code: '300', name: 'Ilmu Sosial, Hukum & Ekonomi', rack: 'Rak Sosial E-01 s/d E-04 (Lt. 1)' },
        { code: '400', name: 'Bahasa & Linguistik Baku', rack: 'Rak Bahasa B-01 s/d B-02 (Lt. 1)' },
        { code: '500', name: 'Sains Murni, Matematika & Fisika', rack: 'Rak Sains S-01 s/d S-06 (Lt. 2)' },
        { code: '600', name: 'Teknologi & Ilmu Terapan', rack: 'Rak Teknik K-01 s/d K-03 (Lt. 2)' },
        { code: '700', name: 'Kesenian, Arsitektur & Olahraga', rack: 'Rak Seni A-01 s/d A-02 (Lt. 1)' },
        { code: '800', name: 'Kesusastraan, Puisi & Novel', rack: 'Rak Sastra F-01 s/d F-06 (Lt. 1)' },
        { code: '900', name: 'Sejarah Nasional, Biografi & Geografi', rack: 'Rak Sejarah H-01 s/d H-03 (Lt. 2)' },
    ];

    return (
        <AppLayout
            title="Tata Tertib & Panduan Perpustakaan"
            subtitle={`Ketentuan operasional, tata krama ruang baca, kebijakan sirkulasi, dan panduan lokasi rak fisik pada ${settings.library_name}.`}
        >
            <Head title="Tata Tertib & Jam Buka - Perpustakaan Cendekia" />

            {/* Hours Banner */}
            <div className="bg-white border border-[#ded7c4] rounded-xs p-6 mb-8 shadow-xs">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-sm bg-[#164e3b]/10 text-[#164e3b] flex items-center justify-center shrink-0 border border-[#164e3b]/20">
                            <IconClock size={24} />
                        </div>
                        <div>
                            <div className="text-[11px] font-mono uppercase tracking-wider text-[#787161]">
                                Jam Layanan Perpustakaan
                            </div>
                            <h2 className="text-xl font-serif font-bold text-[#191816] mt-0.5">
                                {settings.opening_hours}
                            </h2>
                            <p className="text-[13px] text-[#6d6657] mt-1">
                                Layanan sirkulasi tutup 15 menit sebelum jam operasional harian berakhir untuk rekapitulasi buku.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link
                            href="/presensi/kiosk"
                            className="px-4 py-2.5 bg-[#164e3b] hover:bg-[#0f392b] text-white text-[13px] font-medium rounded-xs shadow-xs transition-colors flex items-center gap-1.5"
                        >
                            <span>Layar Presensi Kiosk</span>
                            <IconArrowRight size={14} />
                        </Link>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left: Rules & Circulation Policies */}
                <div className="lg:col-span-7 space-y-6">
                    {/* Rules of conduct */}
                    <div className="bg-white border border-[#ded7c4] rounded-xs p-6 shadow-2xs">
                        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#ece6d5]">
                            <IconShield size={20} className="text-[#164e3b]" />
                            <h3 className="font-serif font-bold text-lg text-[#191816]">
                                Tata Tertib & Ketertiban Ruang Baca
                            </h3>
                        </div>

                        <ul className="space-y-3.5 text-[13px] text-[#423e35]">
                            <li className="flex items-start gap-2.5">
                                <span className="w-5 h-5 rounded-full bg-[#164e3b]/10 text-[#164e3b] font-mono font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                                    1
                                </span>
                                <div>
                                    <strong>Presensi Wajib di Pintu Masuk:</strong> Setiap pengunjung (siswa, guru, maupun tamu) wajib melakukan pemindaian barcode kartu pelajar / NIS pada tablet kiosk buku tamu digital.
                                </div>
                            </li>
                            <li className="flex items-start gap-2.5">
                                <span className="w-5 h-5 rounded-full bg-[#164e3b]/10 text-[#164e3b] font-mono font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                                    2
                                </span>
                                <div>
                                    <strong>Ketenangan & Kenyamanan:</strong> Menjaga suasana hening demi kenyamanan bersama. Ponsel wajib dialihkan ke mode senyap (silent mode).
                                </div>
                            </li>
                            <li className="flex items-start gap-2.5">
                                <span className="w-5 h-5 rounded-full bg-[#164e3b]/10 text-[#164e3b] font-mono font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                                    3
                                </span>
                                <div>
                                    <strong>Penitipan Barang:</strong> Tas ransel, jaket tebal, makanan, dan minuman kemasan terbuka wajib disimpan pada loker penitipan di sebelah meja sirkulasi.
                                </div>
                            </li>
                            <li className="flex items-start gap-2.5">
                                <span className="w-5 h-5 rounded-full bg-[#164e3b]/10 text-[#164e3b] font-mono font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                                    4
                                </span>
                                <div>
                                    <strong>Pengembalian Buku Setelah Baca:</strong> Buku yang selesai dibaca di tempat diletakkan pada troli pengembalian sementara, agar ditata kembali oleh petugas sesuai urutan DDC yang tepat.
                                </div>
                            </li>
                        </ul>
                    </div>

                    {/* Circulation Rules Card */}
                    <div className="bg-white border border-[#ded7c4] rounded-xs p-6 shadow-2xs">
                        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#ece6d5]">
                            <IconBookOpen size={20} className="text-[#164e3b]" />
                            <h3 className="font-serif font-bold text-lg text-[#191816]">
                                Kebijakan Sirkulasi & Denda
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[13px]">
                            <div className="p-3.5 bg-[#faf8f5] border border-[#e4decb] rounded-xs">
                                <div className="text-[11px] font-mono uppercase text-[#736c5e]">Durasi Peminjaman</div>
                                <div className="text-xl font-serif font-bold text-[#191816] mt-1">
                                    {settings.loan_duration_days} Hari Kalender
                                </div>
                                <div className="text-[12px] text-[#6d6657] mt-0.5">
                                    Dapat diperpanjang mandiri 1 kali secara daring sebelum tanggal jatuh tempo.
                                </div>
                            </div>

                            <div className="p-3.5 bg-[#faf8f5] border border-[#e4decb] rounded-xs">
                                <div className="text-[11px] font-mono uppercase text-[#736c5e]">Tarif Denda Terlambat</div>
                                <div className="text-xl font-serif font-bold text-[#991b1b] mt-1">
                                    Rp {Number(settings.daily_fine_rate).toLocaleString('id-ID')} / hari
                                </div>
                                <div className="text-[12px] text-[#6d6657] mt-0.5">
                                    Per eksemplar buku, otomatis terkalkulasi saat pengembalian di meja sirkulasi.
                                </div>
                            </div>

                            <div className="p-3.5 bg-[#faf8f5] border border-[#e4decb] rounded-xs">
                                <div className="text-[11px] font-mono uppercase text-[#736c5e]">Batas Kuota Siswa</div>
                                <div className="text-xl font-serif font-bold text-[#164e3b] mt-1">
                                    Maks {settings.max_loan_siswa} Eksemplar
                                </div>
                                <div className="text-[12px] text-[#6d6657] mt-0.5">
                                    Wajib bebas tanggungan denda untuk dapat meminjam kembali.
                                </div>
                            </div>

                            <div className="p-3.5 bg-[#faf8f5] border border-[#e4decb] rounded-xs">
                                <div className="text-[11px] font-mono uppercase text-[#736c5e]">Batas Kuota Guru</div>
                                <div className="text-xl font-serif font-bold text-[#164e3b] mt-1">
                                    Maks {settings.max_loan_guru} Eksemplar
                                </div>
                                <div className="text-[12px] text-[#6d6657] mt-0.5">
                                    Khusus untuk persiapan materi ajar dan penelitian kurikulum.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: DDC Map & Physical Shelving System */}
                <div className="lg:col-span-5 space-y-6">
                    <div className="bg-white border border-[#ded7c4] rounded-xs p-6 shadow-2xs">
                        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#ece6d5]">
                            <h3 className="font-serif font-bold text-lg text-[#191816]">
                                Panduan Klasifikasi DDC & Lokasi Rak
                            </h3>
                            <span className="text-[11px] font-mono text-[#164e3b] bg-[#e8f5ed] px-2 py-0.5 rounded-2xs border border-[#b2ddc4]">
                                Standar DDC-23
                            </span>
                        </div>

                        <p className="text-[12px] text-[#6d6657] mb-4 leading-relaxed">
                            Koleksi perpustakaan ditata menggunakan Dewey Decimal Classification (DDC). Nomor panggil pada punggung buku memandu lokasi rak fisiknya:
                        </p>

                        <div className="divide-y divide-[#ebe4d3] border border-[#ded7c4] rounded-xs overflow-hidden text-[12px]">
                            {ddcClasses.map((item) => (
                                <div key={item.code} className="p-2.5 hover:bg-[#faf8f5] flex items-start gap-2.5">
                                    <span className="px-1.5 py-0.5 rounded-2xs bg-[#f4eee1] text-[#164e3b] font-mono font-bold shrink-0 border border-[#dcd4c2]">
                                        {item.code}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-semibold text-[#191816] truncate">{item.name}</div>
                                        <div className="text-[11px] text-[#787161] font-mono">📍 {item.rack}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* School Head Endorsement */}
                    <div className="bg-[#fbf9f4] border border-[#dcd4c2] p-5 rounded-xs text-[12px] text-[#5e584a] font-serif leading-relaxed">
                        <div className="italic mb-3">
                            "Membaca adalah jembatan emas peradaban. Mari bersama-sama merawat dan memanfaatkan fasilitas perpustakaan ini dengan penuh tanggung jawab dan integritas akademik."
                        </div>
                        <div className="font-sans font-semibold text-[#191816]">
                            {settings.head_librarian_name}
                        </div>
                        <div className="font-mono text-[11px] text-[#7a7364]">
                            NIP: {settings.head_librarian_nip} • Kepala Perpustakaan
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
