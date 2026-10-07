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
    IconSparkles,
    IconCreditCard,
} from '@/components/icons';

interface RegisterProps {
    setting: {
        library_name: string;
        institution_name: string;
        opening_hours: string;
        daily_fine_rate: number;
        loan_duration_days: number;
        max_loan_siswa: number;
        max_loan_guru: number;
    };
}

export default function Register({ setting }: RegisterProps) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        member_type: 'siswa',
        identity_number: '',
        class_name: 'X MIPA 1',
        email: '',
        phone: '',
        password: '',
        password_confirmation: '',
        agree: true,
    });

    const [customClass, setCustomClass] = useState(false);

    const classOptions = [
        'X MIPA 1', 'X MIPA 2', 'X IPS 1', 'X IPS 2', 'X RPL 1', 'X RPL 2',
        'XI MIPA 1', 'XI MIPA 2', 'XI IPS 1', 'XI IPS 2', 'XI RPL 1', 'XI RPL 2',
        'XII MIPA 1', 'XII MIPA 2', 'XII IPS 1', 'XII IPS 2', 'XII RPL 1', 'XII RPL 2',
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/daftar', {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <div className="min-h-screen bg-[#f7f5f0] text-[#191816] flex flex-col justify-between selection:bg-[#164e3b] selection:text-white">
            <Head title="Pendaftaran Anggota Perpustakaan" />

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

                    <div className="flex items-center gap-3">
                        <span className="hidden sm:inline text-[13px] text-[#787161]">Sudah punya akun?</span>
                        <Link
                            href="/login"
                            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#164e3b] hover:text-[#0f392b] px-3 py-1.5 rounded-xs border border-[#164e3b]/30 bg-white hover:bg-[#e8f5ed] transition-colors"
                        >
                            <span>Masuk / Login →</span>
                        </Link>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
                <div className="w-full max-w-5xl bg-white border border-[#d6cebc] rounded-xs shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12">
                    
                    {/* Left Panel: Membership Benefits & Live Digital Card Preview */}
                    <div className="lg:col-span-5 bg-[#faf8f3] border-b lg:border-b-0 lg:border-r border-[#d6cebc] p-6 sm:p-8 flex flex-col justify-between">
                        <div>
                            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-2xs bg-[#e8f5ed] border border-[#a3d9b8] text-[#164e3b] text-[11px] font-mono font-medium mb-5">
                                <IconSparkles size={13} />
                                <span>Pendaftaran Mandiri Anggota</span>
                            </div>

                            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#191816] tracking-tight leading-snug">
                                Terbitkan Akun & Kartu Perpustakaan Anda
                            </h2>
                            <p className="text-[13px] text-[#5c574c] mt-2.5 leading-relaxed">
                                Siswa dan guru dapat langsung mendaftar secara mandiri. Data otomatis terhubung ke sistem sirkulasi barcode tanpa perlu penginputan manual oleh petugas.
                            </p>

                            {/* Live Digital Card Preview */}
                            <div className="mt-6 p-4 rounded-xs bg-[#f4eee1] border border-[#d8cfbe] shadow-2xs relative overflow-hidden">
                                <div className="flex items-center justify-between border-b border-[#e2dacb] pb-2.5 mb-3">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-2xs bg-[#164e3b] text-white flex items-center justify-center">
                                            <IconCreditCard size={13} />
                                        </div>
                                        <div>
                                            <div className="text-[11px] font-bold text-[#191816]">KARTU ANGGOTA DIGITAL</div>
                                            <div className="text-[9px] font-mono text-[#787161]">PRATINJAU REAL-TIME</div>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-2xs bg-[#164e3b] text-white">
                                        {data.member_type.toUpperCase()}
                                    </span>
                                </div>

                                <div className="space-y-1.5 text-xs">
                                    <div>
                                        <div className="text-[10px] font-mono text-[#787161]">NAMA LENGKAP:</div>
                                        <div className="font-serif font-bold text-[14px] text-[#191816] truncate">
                                            {data.name || 'Nama Siswa / Guru'}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 pt-1">
                                        <div>
                                            <div className="text-[10px] font-mono text-[#787161]">
                                                {data.member_type === 'siswa' ? 'NO. INDUK (NIS):' : 'NO. INDUK (NIP):'}
                                            </div>
                                            <div className="font-mono text-[12px] font-medium text-[#164e3b]">
                                                {data.identity_number || (data.member_type === 'siswa' ? 'NIS-2024-XXX' : 'NIP-1985XXXX')}
                                            </div>
                                        </div>
                                        {data.member_type === 'siswa' && (
                                            <div>
                                                <div className="text-[10px] font-mono text-[#787161]">KELAS / ROMBEL:</div>
                                                <div className="font-mono text-[12px] font-medium text-[#3d3930]">
                                                    {data.class_name || 'Pilih Kelas'}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Simulated Barcode Strip */}
                                <div className="mt-3 pt-2 border-t border-[#e2dacb] flex items-center justify-between">
                                    <div className="font-mono text-[9px] text-[#787161]">BARCODE SIRKULASI OTOMATIS</div>
                                    <div className="flex gap-0.5 h-4 items-end">
                                        {[2, 1, 3, 1, 2, 4, 1, 2, 3, 1, 2, 1, 3, 2].map((h, idx) => (
                                            <span
                                                key={idx}
                                                className="bg-[#191816] inline-block"
                                                style={{ width: `${(idx % 3) + 1}px`, height: `${h * 4}px` }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Benefits checklist */}
                            <div className="mt-6 space-y-2 text-[12px] text-[#4a463d]">
                                <div className="flex items-start gap-2">
                                    <span className="w-4 h-4 rounded-full bg-[#e8f5ed] text-[#164e3b] flex items-center justify-center shrink-0 mt-0.5">
                                        <IconCheck size={11} />
                                    </span>
                                    <span>Kuota pinjam hingga <strong>{data.member_type === 'guru' ? (setting?.max_loan_guru || 5) : (setting?.max_loan_siswa || 3)} buku</strong> sekaligus.</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <span className="w-4 h-4 rounded-full bg-[#e8f5ed] text-[#164e3b] flex items-center justify-center shrink-0 mt-0.5">
                                        <IconCheck size={11} />
                                    </span>
                                    <span>Perpanjangan mandiri 1x secara online sebelum jatuh tempo.</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <span className="w-4 h-4 rounded-full bg-[#e8f5ed] text-[#164e3b] flex items-center justify-center shrink-0 mt-0.5">
                                        <IconCheck size={11} />
                                    </span>
                                    <span>Penerbitan <strong>Surat Bebas Pustaka</strong> otomatis ber-QR code resmi.</span>
                                </div>
                            </div>
                        </div>

                        {/* Bottom link to login */}
                        <div className="mt-8 pt-6 border-t border-[#e2dbca]">
                            <div className="text-[12px] text-[#787161]">
                                Sudah pernah terdaftar sebelumnya?
                            </div>
                            <Link
                                href="/login"
                                className="mt-1 inline-flex items-center gap-1 text-[13px] font-bold text-[#164e3b] hover:underline"
                            >
                                <span>Masuk ke Akun Perpustakaan Anda</span>
                                <IconArrowRight size={14} />
                            </Link>
                        </div>
                    </div>

                    {/* Right Panel: Registration Form */}
                    <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center">
                        <div className="max-w-md mx-auto w-full">
                            <div className="mb-6">
                                <h3 className="text-xl font-serif font-bold text-[#191816]">
                                    Formulir Pendaftaran Anggota
                                </h3>
                                <p className="text-[13px] text-[#6d6657] mt-1">
                                    Lengkapi data diri Anda di bawah ini dengan benar untuk mengaktifkan kartu anggota digital.
                                </p>
                            </div>

                            {/* Any Global Error Alert */}
                            {Object.keys(errors).length > 0 && (
                                <div className="mb-5 p-3.5 rounded-xs bg-[#fef2f2] border border-[#fecaca] text-[#991b1b] text-[13px] space-y-1">
                                    <div className="flex items-center gap-2 font-bold">
                                        <IconAlertCircle size={16} />
                                        <span>Periksa kembali data pendaftaran:</span>
                                    </div>
                                    <ul className="list-disc list-inside text-xs pl-1">
                                        {Object.values(errors).map((err, idx) => (
                                            <li key={idx}>{err}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Role / Member Type Selection Tabs */}
                                <div>
                                    <label className="block text-[12px] font-mono font-medium text-[#454137] uppercase tracking-wider mb-1.5">
                                        Jenis Keanggotaan
                                    </label>
                                    <div className="grid grid-cols-2 gap-2 p-1 bg-[#ede8dc] rounded-xs border border-[#ded7c4]">
                                        <button
                                            type="button"
                                            onClick={() => setData('member_type', 'siswa')}
                                            className={`py-2 px-3 text-xs font-semibold rounded-2xs transition-colors flex items-center justify-center gap-1.5 ${
                                                data.member_type === 'siswa'
                                                    ? 'bg-white text-[#164e3b] shadow-2xs font-bold'
                                                    : 'text-[#666052] hover:text-[#191816]'
                                            }`}
                                        >
                                            <IconUsers size={14} />
                                            <span>Siswa / Pelajar</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setData('member_type', 'guru')}
                                            className={`py-2 px-3 text-xs font-semibold rounded-2xs transition-colors flex items-center justify-center gap-1.5 ${
                                                data.member_type === 'guru'
                                                    ? 'bg-white text-[#164e3b] shadow-2xs font-bold'
                                                    : 'text-[#666052] hover:text-[#191816]'
                                            }`}
                                        >
                                            <IconBookOpen size={14} />
                                            <span>Dewan Guru / Pendidik</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Full Name */}
                                <div>
                                    <label className="block text-[12px] font-mono font-medium text-[#454137] uppercase tracking-wider mb-1.5">
                                        Nama Lengkap <span className="text-[#b91c1c]">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder={data.member_type === 'siswa' ? 'contoh: M. Rizky Pratama' : 'contoh: Bambang Hariyanto, S.Pd'}
                                        required
                                        className="w-full px-3.5 py-2.5 text-[14px] bg-[#faf8f5] border border-[#d6cebc] rounded-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#164e3b] focus:border-[#164e3b] transition-colors"
                                    />
                                    {errors.name && <p className="text-[12px] text-[#991b1b] mt-1">{errors.name}</p>}
                                </div>

                                {/* Identity Number (NIS / NIP) & Class Name */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[12px] font-mono font-medium text-[#454137] uppercase tracking-wider mb-1.5">
                                            {data.member_type === 'siswa' ? 'Nomor Induk Siswa (NIS)' : 'Nomor Induk Pegawai (NIP)'} <span className="text-[#b91c1c]">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={data.identity_number}
                                            onChange={(e) => setData('identity_number', e.target.value)}
                                            placeholder={data.member_type === 'siswa' ? 'NIS-2024-001' : 'NIP-19850101...'}
                                            required
                                            className="w-full px-3.5 py-2.5 text-[14px] bg-[#faf8f5] border border-[#d6cebc] rounded-xs font-mono focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#164e3b] focus:border-[#164e3b] transition-colors"
                                        />
                                        {errors.identity_number && (
                                            <p className="text-[12px] text-[#991b1b] mt-1">{errors.identity_number}</p>
                                        )}
                                    </div>

                                    {data.member_type === 'siswa' && (
                                        <div>
                                            <div className="flex items-center justify-between mb-1.5">
                                                <label className="block text-[12px] font-mono font-medium text-[#454137] uppercase tracking-wider">
                                                    Kelas / Rombel <span className="text-[#b91c1c]">*</span>
                                                </label>
                                                <button
                                                    type="button"
                                                    onClick={() => setCustomClass(!customClass)}
                                                    className="text-[10px] text-[#164e3b] underline font-mono"
                                                >
                                                    {customClass ? 'Pilih dari list' : 'Ketik manual'}
                                                </button>
                                            </div>

                                            {customClass ? (
                                                <input
                                                    type="text"
                                                    value={data.class_name}
                                                    onChange={(e) => setData('class_name', e.target.value)}
                                                    placeholder="contoh: X TKR 1"
                                                    required
                                                    className="w-full px-3.5 py-2.5 text-[14px] bg-[#faf8f5] border border-[#d6cebc] rounded-xs font-mono focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#164e3b] focus:border-[#164e3b] transition-colors"
                                                />
                                            ) : (
                                                <select
                                                    value={data.class_name}
                                                    onChange={(e) => setData('class_name', e.target.value)}
                                                    className="w-full px-3.5 py-2.5 text-[14px] bg-[#faf8f5] border border-[#d6cebc] rounded-xs font-mono focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#164e3b] focus:border-[#164e3b] transition-colors"
                                                >
                                                    {classOptions.map((cls) => (
                                                        <option key={cls} value={cls}>
                                                            {cls}
                                                        </option>
                                                    ))}
                                                </select>
                                            )}
                                            {errors.class_name && (
                                                <p className="text-[12px] text-[#991b1b] mt-1">{errors.class_name}</p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Email & WhatsApp */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[12px] font-mono font-medium text-[#454137] uppercase tracking-wider mb-1.5">
                                            Alamat Email <span className="text-[#b91c1c]">*</span>
                                        </label>
                                        <input
                                            type="email"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            placeholder="nama@siswa.sch.id"
                                            required
                                            className="w-full px-3.5 py-2.5 text-[14px] bg-[#faf8f5] border border-[#d6cebc] rounded-xs font-mono focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#164e3b] focus:border-[#164e3b] transition-colors"
                                        />
                                        {errors.email && <p className="text-[12px] text-[#991b1b] mt-1">{errors.email}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-[12px] font-mono font-medium text-[#454137] uppercase tracking-wider mb-1.5">
                                            No. WhatsApp / HP <span className="text-[11px] text-[#787161] font-normal">(opsional)</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={data.phone}
                                            onChange={(e) => setData('phone', e.target.value)}
                                            placeholder="08123456789"
                                            className="w-full px-3.5 py-2.5 text-[14px] bg-[#faf8f5] border border-[#d6cebc] rounded-xs font-mono focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#164e3b] focus:border-[#164e3b] transition-colors"
                                        />
                                        {errors.phone && <p className="text-[12px] text-[#991b1b] mt-1">{errors.phone}</p>}
                                    </div>
                                </div>

                                {/* Password & Confirmation */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[12px] font-mono font-medium text-[#454137] uppercase tracking-wider mb-1.5">
                                            Kata Sandi <span className="text-[#b91c1c]">*</span>
                                        </label>
                                        <input
                                            type="password"
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                            placeholder="Minimal 6 karakter"
                                            required
                                            className="w-full px-3.5 py-2.5 text-[14px] bg-[#faf8f5] border border-[#d6cebc] rounded-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#164e3b] focus:border-[#164e3b] transition-colors"
                                        />
                                        {errors.password && (
                                            <p className="text-[12px] text-[#991b1b] mt-1">{errors.password}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-[12px] font-mono font-medium text-[#454137] uppercase tracking-wider mb-1.5">
                                            Ulangi Kata Sandi <span className="text-[#b91c1c]">*</span>
                                        </label>
                                        <input
                                            type="password"
                                            value={data.password_confirmation}
                                            onChange={(e) => setData('password_confirmation', e.target.value)}
                                            placeholder="Ketik ulang kata sandi"
                                            required
                                            className="w-full px-3.5 py-2.5 text-[14px] bg-[#faf8f5] border border-[#d6cebc] rounded-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#164e3b] focus:border-[#164e3b] transition-colors"
                                        />
                                        {errors.password_confirmation && (
                                            <p className="text-[12px] text-[#991b1b] mt-1">{errors.password_confirmation}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Agreement Checkbox */}
                                <div className="pt-1">
                                    <label className="flex items-start gap-2.5 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={data.agree}
                                            onChange={(e) => setData('agree', e.target.checked)}
                                            required
                                            className="mt-0.5 w-4 h-4 rounded-2xs border-[#d6cebc] text-[#164e3b] focus:ring-[#164e3b]"
                                        />
                                        <span className="text-[12px] text-[#5c574c] leading-snug">
                                            Saya bersedia mematuhi seluruh peraturan perpustakaan sekolah, menjaga keutuhan buku pinjaman, dan mengembalikan buku tepat waktu.
                                        </span>
                                    </label>
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={processing || !data.agree}
                                    className="w-full mt-2 py-3 px-4 bg-[#164e3b] hover:bg-[#0f392b] text-white font-medium text-[14px] rounded-xs shadow-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {processing ? (
                                        <span>Mendaftarkan Akun Anggota...</span>
                                    ) : (
                                        <>
                                            <span>Daftar & Terbitkan Kartu Digital Saya</span>
                                            <IconArrowRight size={16} />
                                        </>
                                    )}
                                </button>
                            </form>

                            {/* Link to Login */}
                            <div className="mt-6 pt-5 border-t border-[#ede7d8] text-center">
                                <p className="text-[13px] text-[#736c5e]">
                                    Sudah memiliki akun anggota?{' '}
                                    <Link href="/login" className="font-semibold text-[#164e3b] hover:underline">
                                        Masuk ke akun Anda di sini →
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
