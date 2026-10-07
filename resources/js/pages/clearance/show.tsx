import React from 'react';
import { Head, Link } from '@inertiajs/react';
import BarcodeBadge from '@/components/BarcodeBadge';
import { IconPrinter, IconArrowRight, IconBookOpen } from '@/components/icons';

interface ClearanceShowProps {
    letter: {
        id: number;
        letter_number: string;
        issued_at: string;
        valid_until: string;
        notes: string | null;
        status: string;
        user: {
            id: number;
            name: string;
            identity_number: string;
            class_name: string;
            address: string | null;
            phone: string | null;
        };
        approver?: {
            name: string;
            identity_number: string;
        };
    };
    setting: {
        library_name: string;
        institution_name: string;
        head_librarian_name: string;
        head_librarian_nip: string;
    };
}

export default function ClearanceShow({ letter, setting }: ClearanceShowProps) {
    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="min-h-screen bg-[#ede8dc] py-8 px-4 flex flex-col items-center print:bg-white print:p-0">
            <Head title={`Cetak SKBP - ${letter.user.name} (${letter.letter_number})`} />

            {/* Print Action Toolbar (Hidden when printing) */}
            <div className="w-full max-w-3xl flex items-center justify-between mb-6 no-print bg-white p-3.5 rounded-xs border border-[#ded7c4] shadow-xs">
                <Link
                    href="/bebas-pustaka"
                    className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#454137] hover:text-[#164e3b]"
                >
                    ← Kembali ke Modul Bebas Pustaka
                </Link>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={handlePrint}
                        className="inline-flex items-center gap-2 px-5 py-2 bg-[#164e3b] hover:bg-[#0f392b] text-white text-[13px] font-bold rounded-xs shadow-xs transition-colors"
                    >
                        <IconPrinter size={16} />
                        <span>Cetak Surat (Print / PDF)</span>
                    </button>
                </div>
            </div>

            {/* Official Document Sheet (A4 Simulation: 210mm x 297mm) */}
            <div className="w-full max-w-3xl bg-white p-10 sm:p-14 border border-[#cfc7b4] shadow-md print:border-none print:shadow-none print:p-8 text-[#111110] font-serif leading-normal relative">
                {/* School Letterhead / Kop Surat Resmi */}
                <div className="text-center pb-4 border-b-4 border-double border-[#191816]">
                    <div className="text-[12px] font-sans uppercase tracking-widest text-[#3d3a33] font-semibold">
                        PEMERINTAH PROVINSI DAERAH KHUSUS IBUKOTA
                    </div>
                    <div className="text-[13px] font-sans uppercase tracking-wider text-[#3d3a33] font-bold">
                        DINAS PENDIDIKAN DAN KEBUDAYAAN
                    </div>
                    <div className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-[#191816] mt-0.5">
                        {setting.institution_name}
                    </div>
                    <div className="text-sm font-semibold tracking-wide text-[#164e3b] mt-0.5 font-sans">
                        UNIT PELAKSANA TEKNIS PERPUSTAKAAN "{setting.library_name.toUpperCase()}"
                    </div>
                    <div className="text-[11px] font-sans text-[#5c574c] mt-1">
                        Jalan Pendidikan No. 45, Kota Pelajar • Telepon: (021) 789-0123 • Surel: perpustakaan@cendekia.sch.id
                    </div>
                </div>

                {/* Document Title & Number */}
                <div className="text-center my-6">
                    <h2 className="text-lg sm:text-xl font-bold uppercase tracking-wide underline underline-offset-4 text-[#191816]">
                        SURAT KETERANGAN BEBAS PUSTAKA
                    </h2>
                    <div className="text-[13px] font-mono text-[#38342c] mt-1 font-medium">
                        Nomor: {letter.letter_number}
                    </div>
                </div>

                {/* Opening Statement */}
                <div className="text-[14px] text-justify space-y-4 leading-relaxed mb-6">
                    <p>
                        Yang bertanda tangan di bawah ini, Kepala Perpustakaan {setting.institution_name}, dengan ini menerangkan dengan sesungguhnya bahwa:
                    </p>

                    {/* Student Identity Ledger */}
                    <div className="my-4 pl-6 space-y-2 text-[14px] font-sans">
                        <div className="grid grid-cols-12 gap-2">
                            <span className="col-span-4 text-[#5e584a]">Nama Siswa</span>
                            <span className="col-span-1">:</span>
                            <strong className="col-span-7 text-[#191816] font-serif font-bold text-[15px]">{letter.user.name}</strong>
                        </div>
                        <div className="grid grid-cols-12 gap-2">
                            <span className="col-span-4 text-[#5e584a]">Nomor Induk Siswa (NIS)</span>
                            <span className="col-span-1">:</span>
                            <span className="col-span-7 font-mono font-semibold text-[#191816]">{letter.user.identity_number}</span>
                        </div>
                        <div className="grid grid-cols-12 gap-2">
                            <span className="col-span-4 text-[#5e584a]">Kelas / Rombel Terakhir</span>
                            <span className="col-span-1">:</span>
                            <span className="col-span-7 text-[#191816]">{letter.user.class_name}</span>
                        </div>
                        <div className="grid grid-cols-12 gap-2">
                            <span className="col-span-4 text-[#5e584a]">Keperluan Penerbitan</span>
                            <span className="col-span-1">:</span>
                            <span className="col-span-7 text-[#191816] italic font-serif">{letter.notes || 'Syarat Kelulusan / Mutasi Siswa'}</span>
                        </div>
                    </div>

                    <p>
                        Berdasarkan catatan pada pangkalan data Sistem Informasi Manajemen & Otomasi Perpustakaan sampai dengan tanggal surat ini diterbitkan, yang bersangkutan dinyatakan:
                    </p>

                    {/* Affirmation Box */}
                    <div className="my-5 p-4 bg-[#f8f6f0] border-2 border-[#164e3b] text-center rounded-2xs">
                        <div className="text-base sm:text-lg font-bold text-[#164e3b] uppercase tracking-wide">
                            TELAH BEBAS DARI SEGALA PINJAMAN BUKU DAN TUNGGAKAN DENDA PERPUSTAKAAN
                        </div>
                        <div className="text-[12px] font-sans text-[#5c574c] mt-1">
                            (Jumlah Pinjaman Aktif: 0 Buku • Saldo Denda Tertunggak: Rp 0 / Lunas)
                        </div>
                    </div>

                    <p>
                        Demikian Surat Keterangan Bebas Pustaka ini dibuat dengan sebenar-benarnya untuk dapat dipergunakan sebagaimana mestinya sebagai salah satu kelengkapan administrasi kelulusan / mutasi.
                    </p>
                </div>

                {/* Bottom Signature & Verification Seal Block */}
                <div className="mt-12 pt-6 grid grid-cols-2 gap-8 text-[13px] font-sans">
                    {/* Left: Barcode / QR Code Verification */}
                    <div className="space-y-2 flex flex-col justify-end">
                        <div className="text-[11px] text-[#706a5e] uppercase tracking-wider font-mono">
                            Verifikasi Keaslian Dokumen:
                        </div>
                        <BarcodeBadge
                            code={letter.letter_number}
                            label="SKBP RESMI DIGITAL"
                            compact={false}
                        />
                        <div className="text-[10px] text-[#8a816e] font-mono">
                            ID: {letter.letter_number} • Berlaku s.d. {letter.valid_until}
                        </div>
                    </div>

                    {/* Right: Librarian Official Signature */}
                    <div className="text-center space-y-1">
                        <div className="text-[#3d3a33]">
                            Diterbitkan di: Kota Pelajar
                        </div>
                        <div className="text-[#3d3a33]">
                            Pada tanggal: <strong>{letter.issued_at}</strong>
                        </div>
                        <div className="font-semibold text-[#191816] pt-1">
                            Kepala Perpustakaan,
                        </div>

                        {/* Signature Stamp Simulation */}
                        <div className="py-6 flex items-center justify-center relative">
                            <div className="w-24 h-16 border-2 border-dashed border-[#164e3b]/30 rounded-xs flex items-center justify-center text-[11px] font-mono text-[#164e3b] uppercase tracking-widest rotate-[-6deg]">
                                [ CAP RESMI ]
                            </div>
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
