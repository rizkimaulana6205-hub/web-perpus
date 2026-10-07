import React, { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AppLayout from '@/components/layout/AppLayout';
import Modal from '@/components/Modal';
import BarcodeBadge from '@/components/BarcodeBadge';
import {
    IconUsers,
    IconSearch,
    IconPlus,
    IconPrinter,
    IconCheckCircle,
    IconAlertCircle,
    IconFileText,
} from '@/components/icons';

interface Member {
    id: number;
    name: string;
    email: string;
    identity_number: string;
    member_type: 'siswa' | 'guru' | 'staf' | 'umum';
    role: string;
    class_name: string | null;
    phone: string | null;
    max_loan_limit: number;
    status: string;
    loans_count: number;
}

interface IndexProps {
    members: {
        data: Member[];
        current_page: number;
        last_page: number;
        total: number;
        prev_page_url: string | null;
        next_page_url: string | null;
    };
    filters: {
        type?: string;
        q?: string;
    };
    stats: {
        total_members: number;
        total_students: number;
        total_teachers: number;
        total_staff: number;
    };
}

export default function MemberIndex({
    members = { data: [], current_page: 1, last_page: 1, total: 0, prev_page_url: null, next_page_url: null },
    filters = {},
    stats = { total_members: 0, total_students: 0, total_teachers: 0, total_staff: 0 },
}: IndexProps) {
    const safeFilters = (filters && typeof filters === 'object' && !Array.isArray(filters)) ? filters : {};

    const [searchQ, setSearchQ] = useState(typeof safeFilters.q === 'string' ? safeFilters.q : '');
    const [selectedType, setSelectedType] = useState(typeof safeFilters.type === 'string' ? safeFilters.type : '');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);

    const addForm = useForm({
        name: '',
        email: '',
        member_type: 'siswa' as 'siswa' | 'guru' | 'staf' | 'umum',
        identity_number: '',
        phone: '',
        class_name: '',
        address: '',
    });

    const importForm = useForm({
        csv_data: '',
        default_type: 'siswa' as 'siswa' | 'guru',
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/anggota', {
            q: searchQ || undefined,
            type: selectedType || undefined,
        }, { preserveState: true });
    };

    const handleAddMember = (e: React.FormEvent) => {
        e.preventDefault();
        addForm.post('/anggota', {
            onSuccess: () => {
                addForm.reset();
                setIsAddModalOpen(false);
            },
        });
    };

    const handleImportSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        importForm.post('/anggota/impor-massal', {
            onSuccess: () => {
                importForm.reset();
                setIsImportModalOpen(false);
            },
        });
    };

    const pasteSampleCsv = () => {
        importForm.setData('csv_data', `NIS,Nama Siswa,Kelas,Email
NIS-2024-010,Dimas Arya Nugroho,XII MIPA 2,dimas@siswa.sch.id
NIS-2024-011,Salma Khairunnisa,XI IPS 1,salma@siswa.sch.id
NIS-2024-012,Reza Pratama Putra,X MIPA 3,reza@siswa.sch.id
NIS-2024-013,Aisyah Maharani,XI MIPA 1,aisyah@siswa.sch.id`);
    };

    return (
        <AppLayout
            title="Direktori Keanggotaan & Kartu Pustaka"
            subtitle="Manajemen basis data siswa, dewan guru, sinkronisasi massal data Dapodik, dan pencetakan kartu anggota terstandar barcode."
            actions={
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setIsImportModalOpen(true)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 text-[13px] font-medium rounded-xs border border-[#d6cebc] bg-white text-[#454137] hover:bg-[#f5efe2] transition-colors"
                    >
                        <span>Impor Massal Dapodik (CSV)</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setIsAddModalOpen(true)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 text-[13px] font-bold rounded-xs bg-[#164e3b] text-white hover:bg-[#0f392b] shadow-xs transition-colors"
                    >
                        <IconPlus size={16} />
                        <span>Tambah Anggota</span>
                    </button>
                </div>
            }
        >
            <Head title="Keanggotaan - Perpustakaan Cendekia" />

            {/* Quick Membership Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
                <div className="p-4 bg-white border border-[#ded7c4] rounded-xs shadow-2xs">
                    <div className="text-[11px] font-mono uppercase text-[#787161]">Total Anggota Aktif</div>
                    <div className="text-2xl font-serif font-bold text-[#191816] mt-0.5">{stats.total_members} Orang</div>
                    <div className="text-[11px] text-[#8a816e] mt-0.5">Pemegang kartu perpustakaan</div>
                </div>
                <div className="p-4 bg-white border border-[#ded7c4] rounded-xs shadow-2xs">
                    <div className="text-[11px] font-mono uppercase text-[#787161]">Anggota Siswa</div>
                    <div className="text-2xl font-serif font-bold text-[#164e3b] mt-0.5">{stats.total_students} Siswa</div>
                    <div className="text-[11px] text-[#8a816e] mt-0.5">Batas pinjam: 3 buku</div>
                </div>
                <div className="p-4 bg-white border border-[#ded7c4] rounded-xs shadow-2xs">
                    <div className="text-[11px] font-mono uppercase text-[#787161]">Dewan Guru & Pengajar</div>
                    <div className="text-2xl font-serif font-bold text-[#191816] mt-0.5">{stats.total_teachers} Guru</div>
                    <div className="text-[11px] text-[#8a816e] mt-0.5">Batas pinjam: 5 buku</div>
                </div>
                <div className="p-4 bg-white border border-[#ded7c4] rounded-xs shadow-2xs">
                    <div className="text-[11px] font-mono uppercase text-[#787161]">Pengelola / Petugas</div>
                    <div className="text-2xl font-serif font-bold text-[#b45309] mt-0.5">{stats.total_staff} Staf</div>
                    <div className="text-[11px] text-[#8a816e] mt-0.5">Hak sirkulasi & katalog</div>
                </div>
            </div>

            {/* Search & Filter Bar */}
            <div className="bg-white border border-[#ded7c4] rounded-xs p-4 mb-6 shadow-xs">
                <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-center gap-3">
                    <div className="relative flex-1 w-full">
                        <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8a816e]" size={16} />
                        <input
                            type="text"
                            value={searchQ}
                            onChange={(e) => setSearchQ(e.target.value)}
                            placeholder="Cari nama anggota, nomor NIS/NIP, kelas, atau email..."
                            className="w-full pl-9 pr-3 py-2 bg-[#faf8f5] border border-[#d6cebc] rounded-xs text-[13px] focus:outline-hidden focus:border-[#164e3b]"
                        />
                    </div>

                    <select
                        value={selectedType}
                        onChange={(e) => {
                            setSelectedType(e.target.value);
                            router.get('/anggota', {
                                q: searchQ || undefined,
                                type: e.target.value || undefined,
                            }, { preserveState: true });
                        }}
                        className="px-3 py-2 bg-[#faf8f5] border border-[#d6cebc] rounded-xs text-[13px] text-[#332f26] shrink-0"
                    >
                        <option value="">Semua Golongan</option>
                        <option value="siswa">Hanya Siswa</option>
                        <option value="guru">Hanya Dewan Guru</option>
                        <option value="staf">Staf Perpustakaan</option>
                    </select>

                    <button
                        type="submit"
                        className="px-5 py-2 bg-[#164e3b] hover:bg-[#0f392b] text-white text-[13px] font-medium rounded-xs shadow-xs transition-colors shrink-0"
                    >
                        Cari Anggota
                    </button>
                </form>
            </div>

            {/* Members Table */}
            <div className="bg-white border border-[#ded7c4] rounded-xs overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-[13px]">
                        <thead className="bg-[#f5efe2] text-[#4d483e] font-semibold border-b border-[#ded7c4]">
                            <tr>
                                <th className="py-2.5 px-4">Kartu & NIS/NIP</th>
                                <th className="py-2.5 px-4">Nama Anggota</th>
                                <th className="py-2.5 px-4">Kategori</th>
                                <th className="py-2.5 px-4">Kelas / Rombel</th>
                                <th className="py-2.5 px-4">Pinjaman Aktif</th>
                                <th className="py-2.5 px-4">Status</th>
                                <th className="py-2.5 px-4 text-right">Aksi Kartu</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#ebe4d3]">
                            {members.data.map((m) => (
                                <tr key={m.id} className="hover:bg-[#faf8f5] transition-colors">
                                    <td className="py-3 px-4 font-mono font-bold text-[#164e3b]">
                                        {m.identity_number || '-'}
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="font-semibold text-[#191816]">{m.name}</div>
                                        <div className="text-[11px] text-[#787161]">{m.email}</div>
                                    </td>
                                    <td className="py-3 px-4">
                                        <span className="capitalize text-[#454137] font-medium">
                                            {m.member_type}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-[#5e5748]">
                                        {m.class_name || '-'}
                                    </td>
                                    <td className="py-3 px-4 font-mono">
                                        <span className={m.loans_count > 0 ? 'font-bold text-[#164e3b]' : 'text-[#787161]'}>
                                            {m.loans_count} / {m.max_loan_limit} buku
                                        </span>
                                    </td>
                                    <td className="py-3 px-4">
                                        <span className="px-2 py-0.5 rounded-2xs text-[11px] font-semibold bg-[#e8f5ed] text-[#134e31] border border-[#a3d9b8]">
                                            Aktif
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-right">
                                        <Link
                                            href={`/anggota/${m.id}/cetak-kartu`}
                                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xs bg-[#f4eee1] text-[#3d382f] hover:bg-[#eae3d2] border border-[#ded7c4] text-[12px] font-medium transition-colors"
                                        >
                                            <IconPrinter size={14} />
                                            <span>Cetak Kartu</span>
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {members.last_page > 1 && (
                    <div className="flex items-center justify-between p-4 border-t border-[#ded7c4] text-[13px]">
                        <div className="text-[#6d6657]">
                            Halaman {members.current_page} dari {members.last_page} ({members.total} anggota)
                        </div>
                        <div className="flex items-center gap-2">
                            {members.prev_page_url && (
                                <Link
                                    href={members.prev_page_url}
                                    className="px-3 py-1.5 rounded-xs border border-[#d6cebc] bg-white text-[#454137] hover:bg-[#f5efe2]"
                                >
                                    ← Sebelumnya
                                </Link>
                            )}
                            {members.next_page_url && (
                                <Link
                                    href={members.next_page_url}
                                    className="px-3 py-1.5 rounded-xs border border-[#d6cebc] bg-white text-[#454137] hover:bg-[#f5efe2]"
                                >
                                    Selanjutnya →
                                </Link>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Modal Tambah Anggota */}
            <Modal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title="Pendaftaran Anggota Baru"
                description="Input data siswa, guru, atau staf untuk menerbitkan kartu anggota perpustakaan."
            >
                <form onSubmit={handleAddMember} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-[12px] font-semibold text-[#191816] mb-1">Nama Lengkap *</label>
                            <input
                                type="text"
                                required
                                value={addForm.data.name}
                                onChange={(e) => addForm.setData('name', e.target.value)}
                                className="w-full px-3 py-2 bg-[#faf8f5] border border-[#d6cebc] rounded-xs text-[13px]"
                            />
                        </div>
                        <div>
                            <label className="block text-[12px] font-semibold text-[#191816] mb-1">Email Sekolah *</label>
                            <input
                                type="email"
                                required
                                value={addForm.data.email}
                                onChange={(e) => addForm.setData('email', e.target.value)}
                                className="w-full px-3 py-2 bg-[#faf8f5] border border-[#d6cebc] rounded-xs text-[13px]"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                            <label className="block text-[12px] font-semibold text-[#191816] mb-1">Nomor Induk (NIS/NIP) *</label>
                            <input
                                type="text"
                                required
                                value={addForm.data.identity_number}
                                onChange={(e) => addForm.setData('identity_number', e.target.value)}
                                placeholder="NIS-2024-xxx"
                                className="w-full px-3 py-2 bg-[#faf8f5] border border-[#d6cebc] rounded-xs text-[13px] font-mono"
                            />
                        </div>
                        <div>
                            <label className="block text-[12px] font-semibold text-[#191816] mb-1">Golongan Keanggotaan *</label>
                            <select
                                value={addForm.data.member_type}
                                onChange={(e) => addForm.setData('member_type', e.target.value as any)}
                                className="w-full px-3 py-2 bg-[#faf8f5] border border-[#d6cebc] rounded-xs text-[13px]"
                            >
                                <option value="siswa">Siswa (Maks 3 Buku)</option>
                                <option value="guru">Guru (Maks 5 Buku)</option>
                                <option value="staf">Staf Perpustakaan</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[12px] font-semibold text-[#191816] mb-1">Kelas / Rombel</label>
                            <input
                                type="text"
                                value={addForm.data.class_name}
                                onChange={(e) => addForm.setData('class_name', e.target.value)}
                                placeholder="XII MIPA 1"
                                className="w-full px-3 py-2 bg-[#faf8f5] border border-[#d6cebc] rounded-xs text-[13px]"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#ebe4d3]">
                        <button
                            type="button"
                            onClick={() => setIsAddModalOpen(false)}
                            className="px-4 py-2 text-[13px] rounded-xs border border-[#d6cebc]"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={addForm.processing}
                            className="px-5 py-2 text-[13px] font-bold text-white bg-[#164e3b] hover:bg-[#0f392b] rounded-xs shadow-xs"
                        >
                            Daftarkan Anggota
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Modal Impor Massal Dapodik / CSV */}
            <Modal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                title="Sinkronisasi & Impor Massal Dapodik (CSV)"
                description="Impor ratusan siswa atau guru sekaligus dari berkas Excel/CSV ekspor Dapodik sekolah."
            >
                <form onSubmit={handleImportSubmit} className="space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-[12px] text-[#6d6657]">
                            Format kolom: <strong>NIS, Nama Siswa, Kelas, Email</strong>
                        </span>
                        <button
                            type="button"
                            onClick={pasteSampleCsv}
                            className="text-[12px] text-[#164e3b] font-semibold hover:underline"
                        >
                            + Masukkan Contoh Data
                        </button>
                    </div>

                    <div>
                        <textarea
                            required
                            rows={6}
                            value={importForm.data.csv_data}
                            onChange={(e) => importForm.setData('csv_data', e.target.value)}
                            placeholder="Tempelkan baris CSV di sini:
NIS-2024-001,Nama Siswa,XII MIPA 1,siswa@sekolah.sch.id"
                            className="w-full p-3 font-mono text-[12px] bg-[#faf8f5] border border-[#d6cebc] rounded-xs focus:outline-hidden focus:border-[#164e3b]"
                        />
                    </div>

                    <div>
                        <label className="block text-[12px] font-semibold text-[#191816] mb-1">
                            Golongan Data yang Diimpor:
                        </label>
                        <select
                            value={importForm.data.default_type}
                            onChange={(e) => importForm.setData('default_type', e.target.value as any)}
                            className="w-full px-3 py-2 bg-[#faf8f5] border border-[#d6cebc] rounded-xs text-[13px]"
                        >
                            <option value="siswa">Data Siswa Sekolah (Kuota 3 Buku)</option>
                            <option value="guru">Data Dewan Guru (Kuota 5 Buku)</option>
                        </select>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#ebe4d3]">
                        <button
                            type="button"
                            onClick={() => setIsImportModalOpen(false)}
                            className="px-4 py-2 text-[13px] rounded-xs border border-[#d6cebc]"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={importForm.processing}
                            className="px-5 py-2 text-[13px] font-bold text-white bg-[#164e3b] hover:bg-[#0f392b] rounded-xs shadow-xs"
                        >
                            Mulai Impor & Sinkronisasi
                        </button>
                    </div>
                </form>
            </Modal>
        </AppLayout>
    );
}
