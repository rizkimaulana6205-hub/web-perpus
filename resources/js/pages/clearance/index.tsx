import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/components/layout/AppLayout';
import Modal from '@/components/Modal';
import {
    IconFileText,
    IconSearch,
    IconCheckCircle,
    IconAlertCircle,
    IconPrinter,
    IconShield,
    IconCheck,
} from '@/components/icons';

interface User {
    id: number;
    name: string;
    identity_number: string;
    class_name: string;
}

interface ClearanceLetter {
    id: number;
    letter_number: string;
    issued_at: string;
    valid_until: string;
    notes: string | null;
    status: string;
    user: User;
    approver?: {
        name: string;
    };
}

interface IndexProps {
    letters: {
        data: ClearanceLetter[];
        current_page: number;
        last_page: number;
        total: number;
    };
    students: User[];
    setting: {
        library_name: string;
        institution_name: string;
    };
    myClearance?: {
        is_clear: boolean;
        active_loans_count: number;
        unpaid_fines: number;
        active_loans: Array<{ title: string; due_date: string }>;
        existing_letter: { id: number; letter_number: string; issued_at: string } | null;
    } | null;
}

export default function ClearanceIndex({
    letters = { data: [], current_page: 1, last_page: 1, total: 0 },
    students = [],
    setting,
    myClearance = null,
}: IndexProps) {
    const [selectedStudentId, setSelectedStudentId] = useState('');
    const [isChecking, setIsChecking] = useState(false);
    const [checkResult, setCheckResult] = useState<{
        success: boolean;
        is_clear: boolean;
        user: User;
        active_loans_count: number;
        unpaid_fines: number;
        active_loans: Array<{ title: string; due_date: string }>;
        existing_letter: { id: number; letter_number: string; issued_at: string } | null;
    } | null>(null);
    const [notes, setNotes] = useState('Syarat kelulusan dan pengambilan ijazah / mutasi siswa.');

    const handleCheckStudent = async (studentId: string) => {
        setSelectedStudentId(studentId);
        if (!studentId) {
            setCheckResult(null);
            return;
        }

        setIsChecking(true);
        try {
            const res = await fetch(`/bebas-pustaka/cek-kelayakan?user_id=${studentId}`);
            const data = await res.json();
            if (data.success) {
                setCheckResult(data);
            } else {
                alert(data.message || 'Gagal memeriksa kelayakan.');
                setCheckResult(null);
            }
        } catch {
            alert('Kesalahan saat memverifikasi status siswa.');
        } finally {
            setIsChecking(false);
        }
    };

    const handleIssueLetter = () => {
        if (!selectedStudentId || !checkResult?.is_clear) return;

        router.post('/bebas-pustaka/terbitkan', {
            user_id: selectedStudentId,
            notes,
        }, {
            onSuccess: () => {
                setSelectedStudentId('');
                setCheckResult(null);
            },
        });
    };

    return (
        <AppLayout
            title="Surat Keterangan Bebas Pustaka Digital"
            subtitle="Penerbitan surat keterangan bebas pinjaman buku dan tunggakan denda secara otomatis untuk syarat kelulusan atau mutasi siswa."
        >
            <Head title="Surat Bebas Pustaka - Perpustakaan Cendekia" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
                {myClearance ? (
                    <div className="lg:col-span-12 bg-white border border-[#ded7c4] rounded-xs p-6 sm:p-8 shadow-xs space-y-6">
                        <div className="pb-4 border-b border-[#ece6d5]">
                            <h3 className="text-xl font-serif font-bold text-[#191816]">
                                Status Bebas Pustaka Anda
                            </h3>
                            <p className="text-[13px] text-[#6d6657] mt-1">
                                Verifikasi otomatis kelayakan bebas pinjaman buku dan denda sebagai syarat kelulusan atau mutasi siswa.
                            </p>
                        </div>

                        <div className={`p-6 rounded-xs border ${
                            myClearance.is_clear
                                ? 'bg-[#e8f5ed] border-[#a3d9b8] text-[#134e31]'
                                : 'bg-[#fee2e2] border-[#fca5a5] text-[#991b1b]'
                        }`}>
                            <div className="flex items-start gap-4">
                                {myClearance.is_clear ? (
                                    <IconCheckCircle size={32} className="text-[#198754] shrink-0 mt-0.5" />
                                ) : (
                                    <IconAlertCircle size={32} className="text-[#dc2626] shrink-0 mt-0.5" />
                                )}
                                <div className="flex-1">
                                    <h4 className="text-lg font-serif font-bold">
                                        {myClearance.is_clear
                                            ? '✓ Anda Dinyatakan Bebas dari Tanggungan Perpustakaan'
                                            : '✕ Anda Masih Memiliki Tanggungan Buku atau Denda'}
                                    </h4>
                                    <p className="text-[13px] mt-1.5 leading-relaxed">
                                        {myClearance.is_clear
                                            ? 'Anda tidak memiliki pinjaman buku aktif (0 buku) dan bebas dari tunggakan denda (Rp 0). Anda berhak mendapatkan Surat Keterangan Bebas Pustaka resmi.'
                                            : `Anda saat ini masih meminjam ${myClearance.active_loans_count} buku atau memiliki denda belum dibayar sebesar Rp ${myClearance.unpaid_fines.toLocaleString('id-ID')}. Silakan selesaikan pengembalian di Meja Sirkulasi terlebih dahulu.`}
                                    </p>

                                    {myClearance.is_clear && myClearance.existing_letter && (
                                        <div className="mt-4 pt-4 border-t border-[#a3d9b8]/50 flex flex-wrap items-center justify-between gap-3">
                                            <div className="text-xs font-mono">
                                                No. Surat Resmi: <strong>{myClearance.existing_letter.letter_number}</strong>
                                            </div>
                                            <Link
                                                href={`/bebas-pustaka/${myClearance.existing_letter.id}/cetak`}
                                                className="inline-flex items-center gap-2 px-4 py-2 bg-[#164e3b] text-white rounded-xs text-[13px] font-medium hover:bg-[#0f392b] transition-colors"
                                            >
                                                <IconPrinter size={16} />
                                                <span>Cetak Surat Bebas Pustaka Resmi (PDF / Cetak)</span>
                                            </Link>
                                        </div>
                                    )}

                                    {myClearance.is_clear && !myClearance.existing_letter && (
                                        <p className="mt-3 text-xs font-mono text-[#164e3b]">
                                            *Surat resmi Anda belum diterbitkan oleh Petugas Sirkulasi. Silakan temui petugas di perpustakaan untuk mencetak dokumen bertanda tangan resmi.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {!myClearance.is_clear && myClearance.active_loans.length > 0 && (
                            <div className="bg-[#fff9f9] border border-[#fca5a5] p-5 rounded-xs">
                                <h5 className="font-semibold text-sm text-[#991b1b] mb-2">Buku yang Masih Harus Dikembalikan:</h5>
                                <ul className="list-disc list-inside space-y-1 text-[13px] text-[#454137]">
                                    {myClearance.active_loans.map((item, idx) => (
                                        <li key={idx}>
                                            <span className="font-medium text-[#191816]">{item.title}</span> (Batas Pengembalian: {item.due_date})
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                ) : (
                    <>
                        {/* Left: Clearance Eligibility Checker Workbench */}
                        <div className="lg:col-span-6 bg-white border border-[#ded7c4] rounded-xs p-6 shadow-xs space-y-5">
                            <div className="pb-3 border-b border-[#ece6d5]">
                                <h3 className="text-base font-serif font-bold text-[#191816]">
                                    Pemeriksaan Kelayakan & Penerbitan Surat
                                </h3>
                                <p className="text-[12px] text-[#6d6657] mt-0.5">
                                    Pilih siswa untuk verifikasi otomatis status pinjaman aktif dan denda.
                                </p>
                            </div>

                            <div>
                                <label className="block text-[13px] font-semibold text-[#191816] mb-1.5">
                                    Pilih Siswa / Masukkan NIS:
                                </label>
                                <select
                                    value={selectedStudentId}
                                    onChange={(e) => handleCheckStudent(e.target.value)}
                                    className="w-full px-3 py-2.5 bg-[#faf8f5] border border-[#d6cebc] rounded-xs text-[13px] focus:outline-hidden focus:border-[#164e3b]"
                                >
                                    <option value="">-- Pilih Siswa dari Daftar --</option>
                                    {students.map((s) => (
                                        <option key={s.id} value={s.id}>
                                            {s.name} ({s.identity_number} - {s.class_name})
                                        </option>
                                    ))}
                                </select>
                            </div>

                    {isChecking && (
                        <div className="p-4 text-center text-[#787161] text-[13px]">
                            Memeriksa data tanggungan buku dan denda di database...
                        </div>
                    )}

                    {checkResult && (
                        <div className="space-y-4 pt-3 border-t border-[#ece6d5]">
                            {/* Result Banner */}
                            <div
                                className={`p-4 rounded-xs text-[13px] flex items-start gap-3 ${
                                    checkResult.is_clear
                                        ? 'bg-[#e8f5ed] border border-[#a3d9b8] text-[#134e31]'
                                        : 'bg-[#fee2e2] border border-[#fca5a5] text-[#991b1b]'
                                }`}
                            >
                                {checkResult.is_clear ? (
                                    <IconCheckCircle size={22} className="text-[#198754] shrink-0" />
                                ) : (
                                    <IconAlertCircle size={22} className="text-[#dc2626] shrink-0" />
                                )}
                                <div>
                                    <div className="font-bold text-[14px]">
                                        {checkResult.is_clear
                                            ? '✓ LOLOS VERIFIKASI: SISWA BEBAS PUSTAKA'
                                            : '✕ DITOLAK: MASIH MEMILIKI TANGGUNGAN'}
                                    </div>
                                    <p className="mt-1 text-[12px] leading-relaxed">
                                        {checkResult.is_clear
                                            ? `Siswa ${checkResult.user.name} tercatat tidak memiliki pinjaman buku aktif (0 buku) dan bebas dari tunggakan denda (Rp 0). Surat keterangan dapat diterbitkan.`
                                            : `Siswa ${checkResult.user.name} masih memiliki ${checkResult.active_loans_count} buku pinjaman yang belum kembali atau denda tertunggak Rp ${checkResult.unpaid_fines.toLocaleString('id-ID')}.`}
                                    </p>
                                </div>
                            </div>

                            {/* Blocking details if not clear */}
                            {!checkResult.is_clear && checkResult.active_loans.length > 0 && (
                                <div className="bg-[#fff9f9] border border-[#fca5a5] p-3 rounded-xs text-[12px]">
                                    <div className="font-semibold text-[#991b1b] mb-1">
                                        Buku yang Belum Dikembalikan:
                                    </div>
                                    <ul className="list-disc list-inside space-y-1 text-[#454137]">
                                        {checkResult.active_loans.map((item, idx) => (
                                            <li key={idx}>
                                                <strong>{item.title}</strong> (Jatuh tempo: {item.due_date})
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Existing Letter Notice */}
                            {checkResult.existing_letter && (
                                <div className="p-3 bg-[#f5efe2] border border-[#ded7c4] rounded-xs text-[12px] text-[#4d483e] flex items-center justify-between">
                                    <div>
                                        Siswa ini telah memiliki SKBP aktif:{' '}
                                        <strong className="font-mono">{checkResult.existing_letter.letter_number}</strong>
                                    </div>
                                    <Link
                                        href={`/bebas-pustaka/${checkResult.existing_letter.id}/cetak`}
                                        className="text-[#164e3b] font-bold hover:underline"
                                    >
                                        Cetak Ulang →
                                    </Link>
                                </div>
                            )}

                            {/* Notes Input & Issue Button */}
                            {checkResult.is_clear && (
                                <div className="space-y-3 pt-2">
                                    <div>
                                        <label className="block text-[12px] font-semibold text-[#191816] mb-1">
                                            Keperluan Penerbitan Surat:
                                        </label>
                                        <input
                                            type="text"
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                            placeholder="Contoh: Syarat pendaftaran perguruan tinggi / kelulusan"
                                            className="w-full px-3 py-2 bg-[#faf8f5] border border-[#d6cebc] rounded-xs text-[13px]"
                                        />
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleIssueLetter}
                                        className="w-full py-3 px-4 bg-[#164e3b] hover:bg-[#0f392b] text-white font-bold text-[14px] rounded-xs shadow-xs transition-colors flex items-center justify-center gap-2"
                                    >
                                        <IconFileText size={18} />
                                        <span>Terbitkan Surat Bebas Pustaka Resmi</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Right: Informational Guide & Legal Standard */}
                <div className="lg:col-span-6 space-y-6">
                    <div className="bg-[#faf8f5] border border-[#ded7c4] rounded-xs p-6 shadow-2xs">
                        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[#ece6d5]">
                            <IconShield size={20} className="text-[#164e3b]" />
                            <h3 className="font-serif font-bold text-base text-[#191816]">
                                Standar Keabsahan Surat Keterangan Bebas Pustaka (SKBP)
                            </h3>
                        </div>
                        <p className="text-[13px] text-[#524d42] leading-relaxed mb-4">
                            Surat Bebas Pustaka Digital diterbitkan secara sah oleh sistem otomasi perpustakaan dengan kode identifikasi nomor surat tunggal dan barcode verifikasi, digunakan untuk:
                        </p>

                        <div className="space-y-2.5 text-[12px] text-[#4d483e]">
                            <div className="p-3 bg-white border border-[#e4decb] rounded-xs">
                                <strong>1. Persyaratan Pengambilan Ijazah & Kelulusan:</strong> Memastikan seluruh inventaris buku pegangan dan paket kurikulum sekolah telah diterima lengkap kembali.
                            </div>
                            <div className="p-3 bg-white border border-[#e4decb] rounded-xs">
                                <strong>2. Syarat Mutasi / Pindah Sekolah:</strong> Dokumen bukti bahwa siswa tidak memiliki tanggungan aset pustaka sekolah asal.
                            </div>
                            <div className="p-3 bg-white border border-[#e4decb] rounded-xs">
                                <strong>3. Verifikasi Digital Otomatis:</strong> Setiap lembar surat dilengkapi barcode nomor surat dan tanda tangan kepala perpustakaan yang dapat diverifikasi keasliannya.
                            </div>
                        </div>
                    </div>
                </div>
            </>
        )}
    </div>

    {/* Previously Issued Clearance Letters Table (Staff & Super Admin Only) */}
    {!myClearance && (
        <div className="bg-white border border-[#ded7c4] rounded-xs p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between text-[13px]">
                <h3 className="font-serif font-bold text-lg text-[#191816]">
                    Arsip Surat Bebas Pustaka yang Telah Diterbitkan
                </h3>
                <div className="text-[#787161]">
                    Total: <strong>{letters.total}</strong> dokumen resmi
                </div>
            </div>

            <div className="overflow-x-auto border border-[#ded7c4] rounded-xs">
                    <table className="w-full text-left text-[13px]">
                        <thead className="bg-[#f5efe2] text-[#4d483e] font-semibold border-b border-[#ded7c4]">
                            <tr>
                                <th className="py-2.5 px-4">Nomor Surat Resmi</th>
                                <th className="py-2.5 px-4">Nama Siswa</th>
                                <th className="py-2.5 px-4">NIS & Kelas</th>
                                <th className="py-2.5 px-4">Tanggal Terbit</th>
                                <th className="py-2.5 px-4">Masa Berlaku</th>
                                <th className="py-2.5 px-4">Status</th>
                                <th className="py-2.5 px-4 text-right">Cetak Surat</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#ebe4d3]">
                            {letters.data.length > 0 ? (
                                letters.data.map((l) => (
                                    <tr key={l.id} className="hover:bg-[#faf8f5]">
                                        <td className="py-3 px-4 font-mono font-bold text-[#164e3b]">
                                            {l.letter_number}
                                        </td>
                                        <td className="py-3 px-4 font-semibold text-[#191816]">
                                            {l.user?.name}
                                        </td>
                                        <td className="py-3 px-4 font-mono text-[#5e5748]">
                                            {l.user?.identity_number} • {l.user?.class_name}
                                        </td>
                                        <td className="py-3 px-4 font-mono text-[#5e5748]">
                                            {l.issued_at}
                                        </td>
                                        <td className="py-3 px-4 font-mono text-[#5e5748]">
                                            s.d. {l.valid_until}
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className="px-2 py-0.5 rounded-2xs text-[11px] font-bold bg-[#e8f5ed] text-[#134e31] border border-[#a3d9b8]">
                                                Sah & Berlaku
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <Link
                                                href={`/bebas-pustaka/${l.id}/cetak`}
                                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xs bg-[#f4eee1] text-[#3d382f] hover:bg-[#eae3d2] border border-[#ded7c4] text-[12px] font-medium transition-colors"
                                            >
                                                <IconPrinter size={14} />
                                                <span>Cetak SKBP</span>
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="text-center py-8 text-[#787161]">
                                        Belum ada surat bebas pustaka yang diterbitkan.
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
