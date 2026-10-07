import React, { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AppLayout from '@/components/layout/AppLayout';
import Modal from '@/components/Modal';
import {
    IconSettings,
    IconUsers,
    IconShield,
    IconPlus,
    IconCheckCircle,
    IconAlertCircle,
    IconClock,
} from '@/components/icons';

interface StaffMember {
    id: number;
    name: string;
    email: string;
    identity_number: string;
    role: string;
    class_name: string | null;
    status: string;
}

interface Suggestion {
    id: number;
    title: string;
    author: string;
    publisher: string | null;
    reason: string;
    status: 'pending' | 'approved' | 'rejected';
    admin_note: string | null;
    created_at: string;
    user?: {
        name: string;
        class_name: string | null;
    };
}

interface SettingProps {
    setting: {
        id: number;
        loan_duration_days: number;
        daily_fine_rate: number;
        max_loan_siswa: number;
        max_loan_guru: number;
        max_renewal_count: number;
        library_name: string;
        institution_name: string;
        head_librarian_name: string;
        head_librarian_nip: string;
        opening_hours: string;
        rules_text: string | null;
    };
    staffMembers: StaffMember[];
    suggestions: Suggestion[];
}

export default function SettingIndex({ setting, staffMembers, suggestions }: SettingProps) {
    const [activeSection, setActiveSection] = useState<'policy' | 'staff' | 'suggestions'>('policy');
    const [isAddStaffModalOpen, setIsAddStaffModalOpen] = useState(false);

    // Policy Settings Form
    const policyForm = useForm({
        loan_duration_days: setting.loan_duration_days,
        daily_fine_rate: setting.daily_fine_rate,
        max_loan_siswa: setting.max_loan_siswa,
        max_loan_guru: setting.max_loan_guru,
        max_renewal_count: setting.max_renewal_count,
        library_name: setting.library_name,
        institution_name: setting.institution_name,
        head_librarian_name: setting.head_librarian_name,
        head_librarian_nip: setting.head_librarian_nip,
        opening_hours: setting.opening_hours,
        rules_text: setting.rules_text || '',
    });

    // Staff Form
    const staffForm = useForm({
        name: '',
        email: '',
        role: 'petugas' as 'super_admin' | 'petugas',
        identity_number: '',
        phone: '',
        class_name: 'Pustakawan Sirkulasi',
    });

    const handlePolicySubmit = (e: React.FormEvent) => {
        e.preventDefault();
        policyForm.put('/pengaturan', {
            preserveScroll: true,
        });
    };

    const handleStaffSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        staffForm.post('/pengaturan/staf', {
            onSuccess: () => {
                staffForm.reset();
                setIsAddStaffModalOpen(false);
            },
        });
    };

    const handleSuggestionDecision = (suggestionId: number, decision: 'approved' | 'rejected') => {
        const note = prompt(`Masukkan catatan evaluasi keputusan (${decision === 'approved' ? 'Disetujui' : 'Ditolak'}):`, decision === 'approved' ? 'Dialokasikan dalam pengadaan koleksi triwulan berikutnya.' : 'Judul serupa sudah tersedia dalam edisi lain.');
        if (note !== null) {
            router.patch(`/pengaturan/usulan/${suggestionId}`, {
                status: decision,
                admin_note: note,
            }, { preserveScroll: true });
        }
    };

    return (
        <AppLayout
            title="Kebijakan & Tata Kelola Perpustakaan"
            subtitle="Konfigurasi parameter sirkulasi, durasi peminjaman, tarif denda, evaluasi usulan buku baru, serta kelola akun petugas perpustakaan."
        >
            <Head title="Pengaturan Sistem - Perpustakaan Cendekia" />

            {/* Navigation Tab Header */}
            <div className="flex border-b border-[#ded7c4] bg-[#f8f4ea] rounded-t-xs text-[13px] font-medium overflow-x-auto mb-0">
                <button
                    type="button"
                    onClick={() => setActiveSection('policy')}
                    className={`px-5 py-3 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
                        activeSection === 'policy'
                            ? 'border-[#164e3b] text-[#164e3b] bg-white font-bold'
                            : 'border-transparent text-[#666051] hover:text-[#191816]'
                    }`}
                >
                    <IconSettings size={16} />
                    <span>Konfigurasi Durasi & Tarif Denda</span>
                </button>
                <button
                    type="button"
                    onClick={() => setActiveSection('staff')}
                    className={`px-5 py-3 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
                        activeSection === 'staff'
                            ? 'border-[#164e3b] text-[#164e3b] bg-white font-bold'
                            : 'border-transparent text-[#666051] hover:text-[#191816]'
                    }`}
                >
                    <IconShield size={16} />
                    <span>Akun Pengelola & Petugas ({staffMembers.length})</span>
                </button>
                <button
                    type="button"
                    onClick={() => setActiveSection('suggestions')}
                    className={`px-5 py-3 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
                        activeSection === 'suggestions'
                            ? 'border-[#164e3b] text-[#164e3b] bg-white font-bold'
                            : 'border-transparent text-[#666051] hover:text-[#191816]'
                    }`}
                >
                    <IconClock size={16} />
                    <span>Evaluasi Usulan Buku Pemustaka ({suggestions.length})</span>
                </button>
            </div>

            {/* SECTION 1: POLICY & CIRCULATION PARAMETERS */}
            {activeSection === 'policy' && (
                <div className="bg-white border-x border-b border-[#ded7c4] rounded-b-xs p-6 sm:p-8 shadow-xs">
                    <form onSubmit={handlePolicySubmit} className="space-y-6 max-w-4xl">
                        {/* Circulation Rules Group */}
                        <div>
                            <h3 className="font-serif font-bold text-lg text-[#191816] pb-2 border-b border-[#ece6d5] mb-4">
                                Parameter Sirkulasi & Batas Waktu
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-[12px] font-semibold text-[#191816] mb-1">
                                        Durasi Pinjam Standar (Hari) *
                                    </label>
                                    <input
                                        type="number"
                                        min={1}
                                        max={60}
                                        required
                                        value={policyForm.data.loan_duration_days}
                                        onChange={(e) => policyForm.setData('loan_duration_days', Number(e.target.value))}
                                        className="w-full px-3 py-2 bg-[#faf8f5] border border-[#d6cebc] rounded-xs text-[13px] font-mono"
                                    />
                                    <div className="text-[11px] text-[#787161] mt-0.5">Hari kalender sebelum jatuh tempo</div>
                                </div>

                                <div>
                                    <label className="block text-[12px] font-semibold text-[#191816] mb-1">
                                        Tarif Denda Keterlambatan (Rp / Hari) *
                                    </label>
                                    <input
                                        type="number"
                                        min={0}
                                        step={500}
                                        required
                                        value={policyForm.data.daily_fine_rate}
                                        onChange={(e) => policyForm.setData('daily_fine_rate', Number(e.target.value))}
                                        className="w-full px-3 py-2 bg-[#faf8f5] border border-[#d6cebc] rounded-xs text-[13px] font-mono text-[#991b1b] font-bold"
                                    />
                                    <div className="text-[11px] text-[#787161] mt-0.5">Per eksemplar buku per hari</div>
                                </div>

                                <div>
                                    <label className="block text-[12px] font-semibold text-[#191816] mb-1">
                                        Maksimal Perpanjangan Mandiri *
                                    </label>
                                    <input
                                        type="number"
                                        min={0}
                                        max={3}
                                        required
                                        value={policyForm.data.max_renewal_count}
                                        onChange={(e) => policyForm.setData('max_renewal_count', Number(e.target.value))}
                                        className="w-full px-3 py-2 bg-[#faf8f5] border border-[#d6cebc] rounded-xs text-[13px] font-mono"
                                    />
                                    <div className="text-[11px] text-[#787161] mt-0.5">Kali perpanjang online oleh siswa</div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                                <div>
                                    <label className="block text-[12px] font-semibold text-[#191816] mb-1">
                                        Batas Kuota Pinjam Siswa (Buku) *
                                    </label>
                                    <input
                                        type="number"
                                        min={1}
                                        max={10}
                                        required
                                        value={policyForm.data.max_loan_siswa}
                                        onChange={(e) => policyForm.setData('max_loan_siswa', Number(e.target.value))}
                                        className="w-full px-3 py-2 bg-[#faf8f5] border border-[#d6cebc] rounded-xs text-[13px] font-mono"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[12px] font-semibold text-[#191816] mb-1">
                                        Batas Kuota Pinjam Dewan Guru (Buku) *
                                    </label>
                                    <input
                                        type="number"
                                        min={1}
                                        max={20}
                                        required
                                        value={policyForm.data.max_loan_guru}
                                        onChange={(e) => policyForm.setData('max_loan_guru', Number(e.target.value))}
                                        className="w-full px-3 py-2 bg-[#faf8f5] border border-[#d6cebc] rounded-xs text-[13px] font-mono"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Institution Metadata Group */}
                        <div>
                            <h3 className="font-serif font-bold text-lg text-[#191816] pb-2 border-b border-[#ece6d5] mb-4">
                                Data Institusi & Pejabat Penandatangan
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[12px] font-semibold text-[#191816] mb-1">
                                        Nama Unit Perpustakaan *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={policyForm.data.library_name}
                                        onChange={(e) => policyForm.setData('library_name', e.target.value)}
                                        className="w-full px-3 py-2 bg-[#faf8f5] border border-[#d6cebc] rounded-xs text-[13px]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[12px] font-semibold text-[#191816] mb-1">
                                        Nama Sekolah / Lembaga Induk *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={policyForm.data.institution_name}
                                        onChange={(e) => policyForm.setData('institution_name', e.target.value)}
                                        className="w-full px-3 py-2 bg-[#faf8f5] border border-[#d6cebc] rounded-xs text-[13px]"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                                <div>
                                    <label className="block text-[12px] font-semibold text-[#191816] mb-1">
                                        Nama Kepala Perpustakaan *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={policyForm.data.head_librarian_name}
                                        onChange={(e) => policyForm.setData('head_librarian_name', e.target.value)}
                                        className="w-full px-3 py-2 bg-[#faf8f5] border border-[#d6cebc] rounded-xs text-[13px]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[12px] font-semibold text-[#191816] mb-1">
                                        NIP Kepala Perpustakaan *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={policyForm.data.head_librarian_nip}
                                        onChange={(e) => policyForm.setData('head_librarian_nip', e.target.value)}
                                        className="w-full px-3 py-2 bg-[#faf8f5] border border-[#d6cebc] rounded-xs text-[13px] font-mono"
                                    />
                                </div>
                            </div>

                            <div className="mt-4">
                                <label className="block text-[12px] font-semibold text-[#191816] mb-1">
                                    Jam Operasional Layanan *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={policyForm.data.opening_hours}
                                    onChange={(e) => policyForm.setData('opening_hours', e.target.value)}
                                    className="w-full px-3 py-2 bg-[#faf8f5] border border-[#d6cebc] rounded-xs text-[13px]"
                                />
                            </div>
                        </div>

                        <div className="pt-4 border-t border-[#ded7c4] flex items-center justify-end">
                            <button
                                type="submit"
                                disabled={policyForm.processing}
                                className="px-6 py-2.5 bg-[#164e3b] hover:bg-[#0f392b] text-white text-[13px] font-bold rounded-xs shadow-xs transition-colors disabled:opacity-50"
                            >
                                {policyForm.processing ? 'Menyimpan...' : 'Simpan Kebijakan Perpustakaan'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* SECTION 2: STAFF & LIBRARIAN MANAGEMENT */}
            {activeSection === 'staff' && (
                <div className="bg-white border-x border-b border-[#ded7c4] rounded-b-xs p-6 shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-serif font-bold text-base text-[#191816]">
                                Akun Staf & Petugas Pengelola Sistem
                            </h3>
                            <p className="text-[12px] text-[#6d6657]">
                                Petugas memiliki kewenangan operasional sirkulasi, manajemen katalog, dan verifikasi denda.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsAddStaffModalOpen(true)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-[13px] font-bold rounded-xs bg-[#164e3b] text-white hover:bg-[#0f392b] shadow-xs"
                        >
                            <IconPlus size={16} />
                            <span>Tambah Akun Petugas</span>
                        </button>
                    </div>

                    <div className="overflow-x-auto border border-[#ded7c4] rounded-xs">
                        <table className="w-full text-left text-[13px]">
                            <thead className="bg-[#f5efe2] text-[#4d483e] font-semibold border-b border-[#ded7c4]">
                                <tr>
                                    <th className="py-2.5 px-4">Nama Staf</th>
                                    <th className="py-2.5 px-4">NIP / Identitas</th>
                                    <th className="py-2.5 px-4">Jabatan Tugas</th>
                                    <th className="py-2.5 px-4">Hak Akses Role</th>
                                    <th className="py-2.5 px-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#ebe4d3]">
                                {staffMembers.map((staff) => (
                                    <tr key={staff.id} className="hover:bg-[#faf8f5]">
                                        <td className="py-3 px-4">
                                            <div className="font-semibold text-[#191816]">{staff.name}</div>
                                            <div className="text-[11px] text-[#787161]">{staff.email}</div>
                                        </td>
                                        <td className="py-3 px-4 font-mono font-semibold text-[#191816]">
                                            {staff.identity_number}
                                        </td>
                                        <td className="py-3 px-4 text-[#5e5748]">
                                            {staff.class_name || 'Petugas Sirkulasi'}
                                        </td>
                                        <td className="py-3 px-4">
                                            <span
                                                className={`px-2 py-0.5 rounded-2xs text-[11px] font-mono font-bold uppercase ${
                                                    staff.role === 'super_admin'
                                                        ? 'bg-[#164e3b] text-white'
                                                        : 'bg-[#f4eee1] text-[#3d382f] border border-[#ded7c4]'
                                                }`}
                                            >
                                                {staff.role}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className="px-2 py-0.5 rounded-2xs text-[11px] font-semibold bg-[#e8f5ed] text-[#134e31] border border-[#a3d9b8]">
                                                Aktif
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* SECTION 3: BOOK SUGGESTIONS EVALUATION */}
            {activeSection === 'suggestions' && (
                <div className="bg-white border-x border-b border-[#ded7c4] rounded-b-xs p-6 shadow-xs space-y-4">
                    <div>
                        <h3 className="font-serif font-bold text-base text-[#191816]">
                            Evaluasi Usulan Buku Baru oleh Siswa & Guru
                        </h3>
                        <p className="text-[12px] text-[#6d6657]">
                            Tinjau aspirasi literatur dari pemustaka untuk dimasukkan dalam pengadaan buku berikutnya.
                        </p>
                    </div>

                    <div className="overflow-x-auto border border-[#ded7c4] rounded-xs">
                        <table className="w-full text-left text-[13px]">
                            <thead className="bg-[#f5efe2] text-[#4d483e] font-semibold border-b border-[#ded7c4]">
                                <tr>
                                    <th className="py-2.5 px-4">Judul & Penulis yang Diusulkan</th>
                                    <th className="py-2.5 px-4">Pengusul</th>
                                    <th className="py-2.5 px-4">Alasan & Manfaat</th>
                                    <th className="py-2.5 px-4">Status Usulan</th>
                                    <th className="py-2.5 px-4 text-right">Keputusan Kepala</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#ebe4d3]">
                                {suggestions.map((sug) => (
                                    <tr key={sug.id} className="hover:bg-[#faf8f5]">
                                        <td className="py-3 px-4">
                                            <div className="font-bold text-[#191816]">{sug.title}</div>
                                            <div className="text-[11px] text-[#787161]">
                                                Penulis: {sug.author} {sug.publisher && `• ${sug.publisher}`}
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="font-semibold text-[#191816]">{sug.user?.name}</div>
                                            <div className="text-[11px] text-[#787161]">{sug.user?.class_name}</div>
                                        </td>
                                        <td className="py-3 px-4 max-w-sm">
                                            <p className="text-[12px] text-[#423d32] line-clamp-2">
                                                {sug.reason}
                                            </p>
                                            {sug.admin_note && (
                                                <div className="text-[11px] text-[#164e3b] italic mt-1 bg-[#f4f9f6] p-1.5 rounded-2xs border border-[#164e3b]/20">
                                                    Catatan: {sug.admin_note}
                                                </div>
                                            )}
                                        </td>
                                        <td className="py-3 px-4">
                                            <span
                                                className={`px-2 py-0.5 rounded-2xs text-[11px] font-bold uppercase font-mono ${
                                                    sug.status === 'approved'
                                                        ? 'bg-[#e8f5ed] text-[#134e31] border border-[#a3d9b8]'
                                                        : sug.status === 'rejected'
                                                        ? 'bg-[#fee2e2] text-[#991b1b] border border-[#fca5a5]'
                                                        : 'bg-[#fef3c7] text-[#92400e] border border-[#fcd34d]'
                                                }`}
                                            >
                                                {sug.status}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            {sug.status === 'pending' ? (
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleSuggestionDecision(sug.id, 'approved')}
                                                        className="px-2.5 py-1 bg-[#164e3b] hover:bg-[#0f392b] text-white text-[11px] font-semibold rounded-xs shadow-2xs"
                                                    >
                                                        Setujui
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleSuggestionDecision(sug.id, 'rejected')}
                                                        className="px-2.5 py-1 bg-[#fee2e2] text-[#991b1b] hover:bg-[#fecaca] text-[11px] font-semibold rounded-xs border border-[#fca5a5]"
                                                    >
                                                        Tolak
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="text-[11px] text-[#787161] font-mono">Diputuskan</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modal Tambah Staf Baru */}
            <Modal
                isOpen={isAddStaffModalOpen}
                onClose={() => setIsAddStaffModalOpen(false)}
                title="Tambah Akun Petugas Perpustakaan"
                description="Buat akun untuk pustakawan sirkulasi atau staf tata kelola."
            >
                <form onSubmit={handleStaffSubmit} className="space-y-4">
                    <div>
                        <label className="block text-[12px] font-semibold text-[#191816] mb-1">Nama Petugas *</label>
                        <input
                            type="text"
                            required
                            value={staffForm.data.name}
                            onChange={(e) => staffForm.setData('name', e.target.value)}
                            placeholder="Nama lengkap beserta gelar"
                            className="w-full px-3 py-2 bg-[#faf8f5] border border-[#d6cebc] rounded-xs text-[13px]"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-[12px] font-semibold text-[#191816] mb-1">Email Resmi *</label>
                            <input
                                type="email"
                                required
                                value={staffForm.data.email}
                                onChange={(e) => staffForm.setData('email', e.target.value)}
                                placeholder="petugas@perpustakaan.sch.id"
                                className="w-full px-3 py-2 bg-[#faf8f5] border border-[#d6cebc] rounded-xs text-[13px]"
                            />
                        </div>
                        <div>
                            <label className="block text-[12px] font-semibold text-[#191816] mb-1">NIP / No. Identitas *</label>
                            <input
                                type="text"
                                required
                                value={staffForm.data.identity_number}
                                onChange={(e) => staffForm.setData('identity_number', e.target.value)}
                                placeholder="1988xxxx..."
                                className="w-full px-3 py-2 bg-[#faf8f5] border border-[#d6cebc] rounded-xs text-[13px] font-mono"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-[12px] font-semibold text-[#191816] mb-1">Peran Akses (Role) *</label>
                            <select
                                value={staffForm.data.role}
                                onChange={(e) => staffForm.setData('role', e.target.value as any)}
                                className="w-full px-3 py-2 bg-[#faf8f5] border border-[#d6cebc] rounded-xs text-[13px]"
                            >
                                <option value="petugas">Pustakawan / Petugas Sirkulasi</option>
                                <option value="super_admin">Kepala Perpustakaan (Super Admin)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[12px] font-semibold text-[#191816] mb-1">Jabatan Penugasan</label>
                            <input
                                type="text"
                                value={staffForm.data.class_name}
                                onChange={(e) => staffForm.setData('class_name', e.target.value)}
                                placeholder="Staf Pengolahan & Sirkulasi"
                                className="w-full px-3 py-2 bg-[#faf8f5] border border-[#d6cebc] rounded-xs text-[13px]"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#ebe4d3]">
                        <button
                            type="button"
                            onClick={() => setIsAddStaffModalOpen(false)}
                            className="px-4 py-2 text-[13px] rounded-xs border border-[#d6cebc]"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={staffForm.processing}
                            className="px-5 py-2 text-[13px] font-bold text-white bg-[#164e3b] hover:bg-[#0f392b] rounded-xs shadow-xs"
                        >
                            Buat Akun Petugas
                        </button>
                    </div>
                </form>
            </Modal>
        </AppLayout>
    );
}
