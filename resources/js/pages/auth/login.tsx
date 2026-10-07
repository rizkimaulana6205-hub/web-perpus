import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    IconBook,
    IconBookOpen,
    IconShield,
    IconUsers,
    IconAlertCircle,
    IconCheck,
    IconArrowRight,
    IconClock,
} from '@/components/icons';

interface LoginProps {
    setting: {
        library_name: string;
        institution_name: string;
        opening_hours: string;
    };
}

export default function Login({ setting }: LoginProps) {
    const { data, setData, post, processing, errors, reset } = useForm({
        identity: '',
        password: '',
        remember: false,
    });

    const [selectedRolePreset, setSelectedRolePreset] = useState<string>('');

    const demoAccounts = [
        {
            role: 'siswa',
            label: 'Siswa',
            desc: 'Akses OPAC, pinjaman mandiri & bebas pustaka',
            identity: 'rizky@siswa.sch.id',
            password: 'password',
            name: 'M. Rizky Pratama (XII MIPA 1)',
            badge: 'Siswa Aktif',
        },
        {
            role: 'guru',
            label: 'Dewan Guru',
            desc: 'Akses koleksi referensi & modul belajar',
            identity: 'bambang@guru.sch.id',
            password: 'password',
            name: 'Bambang Hariyanto, S.Pd',
            badge: 'Guru Fisika',
        },
        {
            role: 'petugas',
            label: 'Petugas Sirkulasi',
            desc: 'Operasional barcode scanner, pinjam & kembali',
            identity: 'petugas@perpustakaan.sch.id',
            password: 'password',
            name: 'Ahmad Fadillah, S.Hum',
            badge: 'Pustakawan',
        },
        {
            role: 'super_admin',
            label: 'Kepala Perpustakaan',
            desc: 'Akses penuh, laporan akreditasi & kebijakan',
            identity: 'kepala@perpustakaan.sch.id',
            password: 'password',
            name: 'Dra. Hj. Siti Rahmawati, M.Pd',
            badge: 'Super Admin',
        },
    ];

    const applyPreset = (account: typeof demoAccounts[0]) => {
        setSelectedRolePreset(account.role);
        setData({
            identity: account.identity,
            password: account.password,
            remember: true,
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/login', {
            onFinish: () => reset('password'),
        });
    };

    return (
        <div className="min-h-screen bg-[#f7f5f0] text-[#191816] flex flex-col justify-between selection:bg-[#164e3b] selection:text-white">
            <Head title="Masuk Sistem Perpustakaan" />

            {/* Top Minimal Header */}
            <header className="border-b border-[#ded7c4] bg-[#fdfbf7] px-6 py-3.5">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="w-9 h-9 rounded-xs bg-[#164e3b] text-white flex items-center justify-center shadow-2xs group-hover:bg-[#0f392b] transition-colors">
                            <IconBook size={20} />
                        </div>
                        <div>
                            <div className="font-serif font-bold text-base tracking-tight text-[#191816] group-hover:text-[#164e3b] transition-colors">
                                {setting?.library_name || 'Perpustakaan Cendekia Nusantara'}
                            </div>
                            <div className="text-[11px] font-mono text-[#787161]">
                                {setting?.institution_name || 'SMA Negeri 1 Prestasi Bangsa'}
                            </div>
                        </div>
                    </Link>

                    <Link
                        href="/"
                        className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#5c574c] hover:text-[#164e3b] px-3 py-1.5 rounded-xs hover:bg-[#ede7d8] transition-colors"
                    >
                        <span>← Kembali ke Katalog Publik (OPAC)</span>
                    </Link>
                </div>
            </header>

            {/* Main Center Content */}
            <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
                <div className="w-full max-w-5xl bg-white border border-[#d6cebc] rounded-xs shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12">
                    
                    {/* Left Panel: Archival Identity & Quick Switcher */}
                    <div className="lg:col-span-5 bg-[#faf8f3] border-b lg:border-b-0 lg:border-r border-[#d6cebc] p-6 sm:p-8 flex flex-col justify-between">
                        <div>
                            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-2xs bg-[#e8f5ed] border border-[#a3d9b8] text-[#164e3b] text-[11px] font-mono font-medium mb-5">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#164e3b] animate-pulse"></span>
                                Autentikasi Pengguna Perpustakaan
                            </div>

                            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#191816] tracking-tight leading-snug">
                                Gerbang Masuk Layanan Literasi Digital
                            </h2>
                            <p className="text-[13px] text-[#5c574c] mt-2.5 leading-relaxed">
                                Masuk untuk meminjam buku, memantau masa aktif peminjaman, perpanjangan mandiri, serta pencetakan Surat Bebas Pustaka.
                            </p>

                            {/* Institutional Info Card */}
                            <div className="mt-6 p-4 rounded-xs bg-white border border-[#ded7c4] space-y-2 text-[12px]">
                                <div className="flex items-center justify-between text-[#666052]">
                                    <span>Jam Pelayanan:</span>
                                    <span className="font-medium text-[#191816]">{setting?.opening_hours || '07.30 - 16.00 WIB'}</span>
                                </div>
                                <div className="flex items-center justify-between text-[#666052]">
                                    <span>Hak Akses:</span>
                                    <span className="font-mono text-[#164e3b] font-medium">RBAC Terproteksi</span>
                                </div>
                                <div className="flex items-center justify-between text-[#666052]">
                                    <span>Presensi Mandiri:</span>
                                    <Link href="/presensi/kiosk" className="text-[#164e3b] underline hover:text-[#0f392b]">
                                        Buka Kiosk Pintu Masuk
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Quick Demo Accounts Selection */}
                        <div className="mt-8 pt-6 border-t border-[#e2dbca]">
                            <div className="text-[11px] font-mono uppercase tracking-wider text-[#787161] mb-2.5 font-medium">
                                Pilih Akun Cepat Pengujian (1-Klik):
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                {demoAccounts.map((acc) => (
                                    <button
                                        key={acc.role}
                                        type="button"
                                        onClick={() => applyPreset(acc)}
                                        className={`text-left p-2.5 rounded-xs border text-xs transition-all ${
                                            selectedRolePreset === acc.role
                                                ? 'border-[#164e3b] bg-[#eef7f2] text-[#164e3b] shadow-2xs'
                                                : 'border-[#ded7c4] bg-white hover:bg-[#f5efe2] text-[#3d3930]'
                                        }`}
                                    >
                                        <div className="font-bold flex items-center justify-between">
                                            <span>{acc.label}</span>
                                            {selectedRolePreset === acc.role && <IconCheck size={14} />}
                                        </div>
                                        <div className="text-[10px] text-[#736c5e] mt-0.5 truncate font-mono">
                                            {acc.name}
                                        </div>
                                    </button>
                                ))}
                            </div>
                            <p className="text-[11px] text-[#8c8574] mt-2 italic">
                                *Klik salah satu kartu di atas untuk mengisi kredensial secara instan.
                            </p>
                        </div>
                    </div>

                    {/* Right Panel: Login Form */}
                    <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center">
                        <div className="max-w-md mx-auto w-full">
                            <div className="mb-6">
                                <h3 className="text-xl font-serif font-bold text-[#191816]">
                                    Masuk ke Akun Anda
                                </h3>
                                <p className="text-[13px] text-[#6d6657] mt-1">
                                    Gunakan alamat email terdaftar atau nomor identitas (NIS untuk Siswa, NIP untuk Guru/Staf).
                                </p>
                            </div>

                            {errors.identity && (
                                <div className="mb-5 p-3.5 rounded-xs bg-[#fef2f2] border border-[#fecaca] text-[#991b1b] text-[13px] flex items-start gap-2.5">
                                    <IconAlertCircle size={18} className="shrink-0 mt-0.5" />
                                    <span>{errors.identity}</span>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-[12px] font-mono font-medium text-[#454137] uppercase tracking-wider mb-1.5">
                                        Email / NIS / NIP
                                    </label>
                                    <input
                                        type="text"
                                        value={data.identity}
                                        onChange={(e) => setData('identity', e.target.value)}
                                        placeholder="contoh: rizky@siswa.sch.id atau NIS-2024-001"
                                        required
                                        autoFocus
                                        className="w-full px-3.5 py-2.5 text-[14px] bg-[#faf8f5] border border-[#d6cebc] rounded-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#164e3b] focus:border-[#164e3b] font-mono transition-colors"
                                    />
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <label className="block text-[12px] font-mono font-medium text-[#454137] uppercase tracking-wider">
                                            Kata Sandi (Password)
                                        </label>
                                        <span className="text-[11px] text-[#787161]">
                                            Default seeder: <code className="font-mono text-[#164e3b]">password</code>
                                        </span>
                                    </div>
                                    <input
                                        type="password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        placeholder="••••••••"
                                        required
                                        className="w-full px-3.5 py-2.5 text-[14px] bg-[#faf8f5] border border-[#d6cebc] rounded-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#164e3b] focus:border-[#164e3b] transition-colors"
                                    />
                                    {errors.password && (
                                        <p className="text-[12px] text-[#991b1b] mt-1">{errors.password}</p>
                                    )}
                                </div>

                                <div className="flex items-center justify-between pt-1">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={data.remember}
                                            onChange={(e) => setData('remember', e.target.checked)}
                                            className="w-4 h-4 rounded-2xs border-[#d6cebc] text-[#164e3b] focus:ring-[#164e3b]"
                                        />
                                        <span className="text-[13px] text-[#5c574c]">Ingat sesi masuk</span>
                                    </label>
                                    <Link
                                        href="/katalog/informasi-dan-tata-tertib"
                                        className="text-[12px] text-[#164e3b] hover:underline"
                                    >
                                        Bantuan & Tata Tertib
                                    </Link>
                                </div>

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full mt-2 py-3 px-4 bg-[#164e3b] hover:bg-[#0f392b] text-white font-medium text-[14px] rounded-xs shadow-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {processing ? (
                                        <span>Memverifikasi Akun...</span>
                                    ) : (
                                        <>
                                            <span>Masuk ke Sistem Perpustakaan</span>
                                            <IconArrowRight size={16} />
                                        </>
                                    )}
                                </button>
                            </form>

                            {/* Register Prompt */}
                            <div className="mt-6 pt-5 border-t border-[#ede7d8] text-center">
                                <p className="text-[13px] text-[#736c5e]">
                                    Belum terdaftar sebagai anggota perpustakaan?
                                </p>
                                <Link
                                    href="/daftar"
                                    className="mt-1.5 inline-flex items-center gap-1.5 text-[13px] font-bold text-[#164e3b] hover:underline"
                                >
                                    <span>Daftar Akun Anggota Baru Mandiri</span>
                                    <IconArrowRight size={14} />
                                </Link>
                            </div>

                            {/* Guest Info */}
                            <div className="mt-4 pt-4 border-t border-[#ede7d8]/60 text-center">
                                <p className="text-[12px] text-[#787161]">
                                    Hanya ingin melihat ketersediaan buku di rak fisik?{' '}
                                    <Link
                                        href="/katalog"
                                        className="font-medium text-[#164e3b] hover:underline"
                                    >
                                        Telusuri OPAC Tamu →
                                    </Link>
                                </p>
                            </div>
                        </div>
                    </div>

                </div>
            </main>

            {/* Bottom Footer */}
            <footer className="border-t border-[#ded7c4] bg-[#fbf9f5] px-6 py-4 text-center text-[12px] text-[#787161]">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
                    <div>
                        © {new Date().getFullYear()} {setting?.institution_name || 'SMA Negeri 1 Prestasi Bangsa'}. Seluruh Hak Cipta Dilindungi.
                    </div>
                    <div className="flex items-center gap-3">
                        <Link href="/presensi/kiosk" className="hover:underline">Presensi Pintu Masuk</Link>
                        <span>•</span>
                        <Link href="/katalog/informasi-dan-tata-tertib" className="hover:underline">Tata Tertib</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
