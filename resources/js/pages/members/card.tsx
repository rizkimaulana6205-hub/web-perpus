import React from 'react';
import { Head, Link } from '@inertiajs/react';
import BarcodeBadge from '@/components/BarcodeBadge';
import { IconPrinter, IconBookOpen } from '@/components/icons';

interface MemberCardProps {
    member: {
        id: number;
        name: string;
        identity_number: string;
        member_type: string;
        class_name: string | null;
        created_at: string;
    };
    setting: {
        library_name: string;
        institution_name: string;
        head_librarian_name: string;
    };
}

export default function MemberCard({ member, setting }: MemberCardProps) {
    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="min-h-screen bg-[#ede8dc] py-8 px-4 flex flex-col items-center print:bg-white print:p-0">
            <Head title={`Cetak Kartu Anggota - ${member.name} (${member.identity_number})`} />

            {/* Print action toolbar */}
            <div className="w-full max-w-xl flex items-center justify-between mb-6 no-print bg-white p-3.5 rounded-xs border border-[#ded7c4] shadow-xs">
                <Link
                    href="/anggota"
                    className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#454137] hover:text-[#164e3b]"
                >
                    ← Kembali ke Daftar Anggota
                </Link>

                <button
                    type="button"
                    onClick={handlePrint}
                    className="inline-flex items-center gap-2 px-5 py-2 bg-[#164e3b] hover:bg-[#0f392b] text-white text-[13px] font-bold rounded-xs shadow-xs transition-colors"
                >
                    <IconPrinter size={16} />
                    <span>Cetak Kartu Anggota</span>
                </button>
            </div>

            {/* Card Preview Container */}
            <div className="space-y-6">
                {/* SISI DEPAN (FRONT SIDE: Standard CR80 format ~ 85.6mm x 54mm) */}
                <div className="w-[400px] h-[250px] bg-gradient-to-br from-[#fbf9f4] via-[#f5efe2] to-[#ede5d3] border-2 border-[#164e3b] rounded-md p-4 shadow-md text-[#191816] flex flex-col justify-between relative overflow-hidden print:shadow-none print:border-2">
                    {/* Header Strip */}
                    <div className="flex items-center gap-2.5 pb-2 border-b border-[#ded7c4]">
                        <div className="w-8 h-8 rounded-sm bg-[#164e3b] text-white flex items-center justify-center font-bold shrink-0">
                            <IconBookOpen size={16} />
                        </div>
                        <div className="min-w-0">
                            <div className="text-[12px] font-serif font-bold uppercase tracking-tight text-[#164e3b] truncate">
                                {setting.library_name}
                            </div>
                            <div className="text-[9px] font-mono text-[#5c5649] truncate uppercase">
                                {setting.institution_name}
                            </div>
                        </div>
                    </div>

                    {/* Member Details & Photo */}
                    <div className="flex items-center gap-3.5 my-auto">
                        {/* Avatar Frame */}
                        <div className="w-16 h-20 bg-white border border-[#ded7c4] rounded-2xs flex flex-col items-center justify-center text-[#8a816e] shrink-0 shadow-2xs font-mono text-[9px]">
                            <span className="font-bold text-lg text-[#164e3b]">{member.name.charAt(0)}</span>
                            <span>PAS FOTO</span>
                        </div>

                        {/* Name & Class info */}
                        <div className="flex-1 min-w-0 text-[11px] leading-tight space-y-1">
                            <div className="text-[9px] font-mono text-[#787161] uppercase tracking-wider font-semibold">
                                KARTU TANDA ANGGOTA
                            </div>
                            <div className="text-[13px] font-serif font-bold text-[#191816] truncate">
                                {member.name}
                            </div>
                            <div className="font-mono text-[#454137]">
                                NIS/NIP: <strong>{member.identity_number}</strong>
                            </div>
                            <div className="text-[#5c574c]">
                                Kelas/Jabatan: <strong>{member.class_name || 'Umum'}</strong>
                            </div>
                            <div className="pt-0.5">
                                <span className="inline-block px-1.5 py-0.5 rounded-2xs text-[9px] font-bold uppercase font-mono bg-[#164e3b] text-white">
                                    {member.member_type} AKTIF
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Barcode Strip */}
                    <div className="pt-2 border-t border-[#ded7c4] flex items-center justify-between">
                        <BarcodeBadge
                            code={member.identity_number}
                            compact={true}
                            className="bg-transparent border-none p-0"
                        />
                        <div className="text-right text-[8px] font-mono text-[#787161]">
                            BERLAKU SELAMA AKTIF<br />DI {setting.institution_name.toUpperCase()}
                        </div>
                    </div>
                </div>

                {/* SISI BELAKANG (BACK SIDE) */}
                <div className="w-[400px] h-[250px] bg-[#faf8f5] border-2 border-[#ded7c4] rounded-md p-4 shadow-md text-[#2e2a22] flex flex-col justify-between text-[10px] print:shadow-none print:border-2 page-break">
                    <div>
                        <div className="text-center font-serif font-bold text-[11px] uppercase tracking-wider text-[#164e3b] pb-1.5 border-b border-[#ded7c4]">
                            KETENTUAN PENGGUNAAN KARTU ANGGOTA
                        </div>
                        <ol className="list-decimal list-inside space-y-1 mt-2 text-[9.5px] text-[#4d473b] leading-relaxed">
                            <li>Kartu ini wajib dibawa saat berkunjung, meminjam, atau presensi mandiri.</li>
                            <li>Peminjaman buku maksimal 3 eksemplar untuk siswa selama 7 hari kalender.</li>
                            <li>Keterlambatan pengembalian buku dikenakan denda harian resmi.</li>
                            <li>Dilarang meminjamkan kartu ini kepada pihak lain tanpa izin petugas.</li>
                            <li>Bila kartu hilang, segera laporkan ke Meja Sirkulasi Perpustakaan.</li>
                        </ol>
                    </div>

                    <div className="flex items-end justify-between pt-2 border-t border-[#ded7c4] text-[9px]">
                        <div className="text-[#787161] font-mono">
                            Dicetak Otomatis Sistem<br />
                            v2.6.0-PRO
                        </div>
                        <div className="text-center">
                            <div>Mengetahui,</div>
                            <div className="font-semibold text-[#191816] mt-4 underline">
                                {setting.head_librarian_name}
                            </div>
                            <div className="text-[8px] text-[#787161]">Kepala Perpustakaan</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
