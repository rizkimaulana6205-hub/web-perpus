import React, { useState, useEffect } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import {
    IconBook,
    IconBookOpen,
    IconSearch,
    IconBarcode,
    IconUsers,
    IconRepeat,
    IconFileText,
    IconBarChart,
    IconSettings,
    IconAlertCircle,
    IconCheckCircle,
    IconClock,
    IconShield,
    IconX,
    IconUserCheck,
    IconChevronDown,
    IconPrinter,
} from '@/components/icons';
import Modal from '@/components/Modal';

interface AuthUser {
    id: number;
    name: string;
    email: string;
    role: 'super_admin' | 'petugas' | 'anggota' | 'tamu';
    member_type: 'siswa' | 'guru' | 'staf' | 'umum';
    identity_number?: string;
    class_name?: string;
    max_loan_limit: number;
    unpaid_fines: number;
    active_loans_count: number;
}

interface SharedProps {
    appName: string;
    settings: {
        library_name: string;
        institution_name: string;
        opening_hours: string;
        daily_fine_rate: number;
        loan_duration_days: number;
    };
    auth: {
        user: AuthUser | null;
    };
    flash: {
        success?: string | null;
        error?: string | null;
        info?: string | null;
    };
    [key: string]: unknown;
}

interface AppLayoutProps {
    children: React.ReactNode;
    title?: string;
    subtitle?: string;
    actions?: React.ReactNode;
}

type NavItem =
    | {
          type: 'link';
          label: string;
          href: string;
          icon: React.ComponentType<{ size?: number; className?: string }>;
          active: boolean;
          badge?: number;
      }
    | {
          type: 'dropdown';
          id: string;
          label: string;
          icon: React.ComponentType<{ size?: number; className?: string }>;
          active: boolean;
          items: Array<{
              label: string;
              desc?: string;
              href: string;
              icon: React.ComponentType<{ size?: number; className?: string }>;
              active: boolean;
              badge?: number;
          }>;
      };

export default function AppLayout({ children, title, subtitle, actions }: AppLayoutProps) {
    const { url } = usePage();
    const { appName, settings, auth, flash } = usePage<SharedProps>().props;
    const [dismissFlash, setDismissFlash] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

    const currentUser = auth?.user;

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (!(e.target as HTMLElement).closest('[data-dropdown]')) {
                setActiveDropdown(null);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    // Filter and group navigation strictly into dropdowns by role to prevent overcrowded navbar
    const getNavGroups = (): NavItem[] => {
        if (!currentUser || currentUser.role === 'tamu') {
            // Guest / Public / Unauthenticated
            return [
                {
                    type: 'link',
                    label: 'Katalog OPAC',
                    href: '/katalog',
                    icon: IconSearch,
                    active: url === '/' || (url.startsWith('/katalog') && !url.includes('informasi-dan-tata-tertib')),
                },
                {
                    type: 'dropdown',
                    id: 'layanan_publik',
                    label: 'Layanan & Informasi',
                    icon: IconBookOpen,
                    active: url.startsWith('/presensi') || url.includes('informasi-dan-tata-tertib'),
                    items: [
                        {
                            label: 'Presensi Kiosk (Pintu Masuk)',
                            desc: 'Scan barcode kartu pelajar untuk buku tamu digital',
                            href: '/presensi/kiosk',
                            icon: IconUserCheck,
                            active: url.startsWith('/presensi'),
                        },
                        {
                            label: 'Jam Buka & Tata Tertib',
                            desc: 'Informasi jam operasional dan regulasi peminjaman',
                            href: '/katalog/informasi-dan-tata-tertib',
                            icon: IconClock,
                            active: url.includes('informasi-dan-tata-tertib'),
                        },
                    ],
                },
            ];
        }

        if (currentUser.role === 'anggota') {
            // Member (Student / Teacher)
            return [
                {
                    type: 'link',
                    label: 'Katalog OPAC',
                    href: '/katalog',
                    icon: IconSearch,
                    active: url === '/' || (url.startsWith('/katalog') && !url.includes('informasi-dan-tata-tertib')),
                },
                {
                    type: 'link',
                    label: 'Pinjaman Saya',
                    href: '/peminjaman-saya',
                    icon: IconBookOpen,
                    active: url.startsWith('/peminjaman-saya'),
                    badge: currentUser.active_loans_count > 0 ? currentUser.active_loans_count : undefined,
                },
                {
                    type: 'dropdown',
                    id: 'layanan_anggota',
                    label: 'Layanan Mandiri',
                    icon: IconFileText,
                    active: url.startsWith('/bebas-pustaka') || url.startsWith('/presensi') || url.includes('informasi-dan-tata-tertib'),
                    items: [
                        {
                            label: 'Surat Bebas Pustaka',
                            desc: 'Cek kelayakan & cetak surat bebas tanggungan kelulusan',
                            href: '/bebas-pustaka',
                            icon: IconFileText,
                            active: url.startsWith('/bebas-pustaka'),
                        },
                        {
                            label: 'Presensi Kiosk Pintu Masuk',
                            desc: 'Catat kehadiran mandiri via barcode saat berkunjung',
                            href: '/presensi/kiosk',
                            icon: IconUserCheck,
                            active: url.startsWith('/presensi'),
                        },
                        {
                            label: 'Jam Buka & Tata Tertib',
                            desc: 'Ketentuan durasi pinjam, batas kuota, dan sanksi denda',
                            href: '/katalog/informasi-dan-tata-tertib',
                            icon: IconClock,
                            active: url.includes('informasi-dan-tata-tertib'),
                        },
                    ],
                },
            ];
        }

        if (currentUser.role === 'petugas') {
            // Librarian / Circulation Staff
            return [
                {
                    type: 'link',
                    label: 'Meja Sirkulasi',
                    href: '/sirkulasi',
                    icon: IconRepeat,
                    active: url.startsWith('/sirkulasi'),
                },
                {
                    type: 'dropdown',
                    id: 'katalog_koleksi',
                    label: 'Katalog & Koleksi',
                    icon: IconBook,
                    active: url.startsWith('/kelola-buku') || (url.startsWith('/katalog') && !url.includes('informasi-dan-tata-tertib')),
                    items: [
                        {
                            label: 'Kelola Buku & Eksemplar',
                            desc: 'Input judul baru, nomor rak, & stok eksemplar',
                            href: '/kelola-buku',
                            icon: IconBook,
                            active: url === '/kelola-buku',
                        },
                        {
                            label: 'Cetak Barcode & Label',
                            desc: 'Generator label barcode punggung buku siap cetak',
                            href: '/kelola-buku/cetak-barcode-label',
                            icon: IconBarcode,
                            active: url.startsWith('/kelola-buku/cetak-barcode-label'),
                        },
                        {
                            label: 'Katalog OPAC Publik',
                            desc: 'Pratinjau tampilan pencarian untuk pengunjung',
                            href: '/katalog',
                            icon: IconSearch,
                            active: url === '/' || (url.startsWith('/katalog') && !url.includes('informasi-dan-tata-tertib')),
                        },
                    ],
                },
                {
                    type: 'dropdown',
                    id: 'layanan_anggota_petugas',
                    label: 'Keanggotaan & Layanan',
                    icon: IconUsers,
                    active: url.startsWith('/anggota') || url.startsWith('/presensi') || url.startsWith('/bebas-pustaka'),
                    items: [
                        {
                            label: 'Data Keanggotaan & Cetak Kartu',
                            desc: 'Kelola data siswa/guru, impor Dapodik, & kartu anggota',
                            href: '/anggota',
                            icon: IconUsers,
                            active: url.startsWith('/anggota'),
                        },
                        {
                            label: 'Rekapitulasi Presensi Kunjungan',
                            desc: 'Laporan log kunjungan harian & filter per kelas',
                            href: '/presensi/rekap',
                            icon: IconUserCheck,
                            active: url === '/presensi/rekap',
                        },
                        {
                            label: 'Layar Kiosk Pintu Masuk',
                            desc: 'Tampilan tablet check-in mandiri pengunjung',
                            href: '/presensi/kiosk',
                            icon: IconClock,
                            active: url === '/presensi/kiosk',
                        },
                        {
                            label: 'Surat Bebas Pustaka',
                            desc: 'Verifikasi kelayakan & penerbitan SKBP resmi',
                            href: '/bebas-pustaka',
                            icon: IconFileText,
                            active: url.startsWith('/bebas-pustaka'),
                        },
                    ],
                },
            ];
        }

        // Super Admin / Kepala Perpustakaan
        return [
            {
                type: 'link',
                label: 'Meja Sirkulasi',
                href: '/sirkulasi',
                icon: IconRepeat,
                active: url.startsWith('/sirkulasi'),
            },
            {
                type: 'dropdown',
                id: 'katalog_koleksi_admin',
                label: 'Katalog & Koleksi',
                icon: IconBook,
                active: url.startsWith('/kelola-buku') || (url.startsWith('/katalog') && !url.includes('informasi-dan-tata-tertib')),
                items: [
                    {
                        label: 'Kelola Buku & Eksemplar',
                        desc: 'Input judul baru, nomor rak, & stok eksemplar',
                        href: '/kelola-buku',
                        icon: IconBook,
                        active: url === '/kelola-buku',
                    },
                    {
                        label: 'Cetak Barcode & Label',
                        desc: 'Generator label barcode punggung buku siap cetak',
                        href: '/kelola-buku/cetak-barcode-label',
                        icon: IconBarcode,
                        active: url.startsWith('/kelola-buku/cetak-barcode-label'),
                    },
                    {
                        label: 'Katalog OPAC Publik',
                        desc: 'Pratinjau tampilan pencarian untuk pengunjung',
                        href: '/katalog',
                        icon: IconSearch,
                        active: url === '/' || (url.startsWith('/katalog') && !url.includes('informasi-dan-tata-tertib')),
                    },
                ],
            },
            {
                type: 'dropdown',
                id: 'layanan_anggota_admin',
                label: 'Keanggotaan & Layanan',
                icon: IconUsers,
                active: url.startsWith('/anggota') || url.startsWith('/presensi') || url.startsWith('/bebas-pustaka'),
                items: [
                    {
                        label: 'Data Keanggotaan & Cetak Kartu',
                        desc: 'Kelola data siswa/guru, impor Dapodik, & kartu anggota',
                        href: '/anggota',
                        icon: IconUsers,
                        active: url.startsWith('/anggota'),
                    },
                    {
                        label: 'Rekapitulasi Presensi Kunjungan',
                        desc: 'Laporan log kunjungan harian & filter per kelas',
                        href: '/presensi/rekap',
                        icon: IconUserCheck,
                        active: url === '/presensi/rekap',
                    },
                    {
                        label: 'Layar Kiosk Pintu Masuk',
                        desc: 'Tampilan tablet check-in mandiri pengunjung',
                        href: '/presensi/kiosk',
                        icon: IconClock,
                        active: url === '/presensi/kiosk',
                    },
                    {
                        label: 'Surat Bebas Pustaka',
                        desc: 'Verifikasi kelayakan & penerbitan SKBP resmi',
                        href: '/bebas-pustaka',
                        icon: IconFileText,
                        active: url.startsWith('/bebas-pustaka'),
                    },
                ],
            },
            {
                type: 'dropdown',
                id: 'tata_kelola_admin',
                label: 'Tata Kelola & Laporan',
                icon: IconBarChart,
                active: url.startsWith('/laporan') || url.startsWith('/pengaturan'),
                items: [
                    {
                        label: 'Statistik & Sirkulasi',
                        desc: 'Grafik frekuensi kunjungan, jam sibuk, & buku terpopuler',
                        href: '/laporan',
                        icon: IconBarChart,
                        active: url === '/laporan',
                    },
                    {
                        label: 'Borang Akreditasi SNP',
                        desc: 'Rekapitulasi data instrumen akreditasi perpustakaan',
                        href: '/laporan/akreditasi',
                        icon: IconFileText,
                        active: url.startsWith('/laporan/akreditasi'),
                    },
                    {
                        label: 'Kebijakan Sistem & Tarif',
                        desc: 'Konfigurasi tarif denda, durasi pinjam, kuota, & akun staf',
                        href: '/pengaturan',
                        icon: IconSettings,
                        active: url.startsWith('/pengaturan'),
                    },
                ],
            },
        ];
    };

    const navGroups = getNavGroups();

    const switchRole = (roleKey: string) => {
        router.post(`/demo-switch/${roleKey}`, {}, {
            preserveScroll: true,
            onSuccess: () => {
                setDismissFlash(false);
                setIsDemoModalOpen(false);
            },
        });
    };

    const handleLogout = () => {
        router.post('/logout');
    };

    return (
        <div className="min-h-screen flex flex-col bg-[#faf8f5] text-[#191816]">
            {/* Top Institutional Ticker Bar (Editorial Header) */}
            <div className="border-b border-[#e5decb] bg-[#f4eee1] text-[12px] text-[#5c574c] px-4 py-1.5 transition-colors">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5">
                    <div className="flex items-center gap-3 font-medium">
                        <span className="inline-flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-[#164e3b] animate-pulse"></span>
                            <span>{settings?.institution_name || 'SMA Negeri 1 Prestasi Bangsa'}</span>
                        </span>
                        <span className="hidden sm:inline text-[#c4bba4]">•</span>
                        <span className="hidden sm:inline-flex items-center gap-1 text-[#787161]">
                            <IconClock size={13} />
                            {settings?.opening_hours || '07.30 - 16.00 WIB'}
                        </span>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] font-mono text-[#787161]">
                        <span>Denda: Rp {(settings?.daily_fine_rate || 1000).toLocaleString('id-ID')} / hari</span>
                        <span>•</span>
                        <span>Masa Pinjam: {settings?.loan_duration_days || 7} hari</span>
                    </div>
                </div>
            </div>

            {/* Main Header / Navigation */}
            <header className="border-b border-[#ded7c4] bg-[#fdfbf7] sticky top-0 z-30 shadow-2xs backdrop-blur-xs">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="flex items-center justify-between h-16">
                        
                        {/* Brand / Logo */}
                        <div className="flex items-center gap-3">
                            <Link href="/" className="flex items-center gap-3 group">
                                <div className="w-10 h-10 rounded-xs bg-[#164e3b] text-white flex items-center justify-center shadow-2xs group-hover:bg-[#0f392b] transition-colors shrink-0">
                                    <IconBook size={22} />
                                </div>
                                <div>
                                    <div className="font-serif font-bold text-lg tracking-tight text-[#191816] group-hover:text-[#164e3b] transition-colors leading-tight">
                                        {settings?.library_name || 'Perpustakaan Cendekia'}
                                    </div>
                                    <div className="text-[11px] font-mono tracking-wider uppercase text-[#736c5e]">
                                        Sistem Otomasi Perpustakaan Sekolah
                                    </div>
                                </div>
                            </Link>
                        </div>

                        {/* Desktop Navigation with Dropdowns (Anti-Overcrowding) */}
                        <nav className="hidden lg:flex items-center gap-1.5">
                            {navGroups.map((group) => {
                                if (group.type === 'link') {
                                    const Icon = group.icon;
                                    return (
                                        <Link
                                            key={group.href}
                                            href={group.href}
                                            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xs text-[13px] font-medium transition-all ${
                                                group.active
                                                    ? 'bg-[#164e3b] text-white shadow-2xs'
                                                    : 'text-[#454137] hover:bg-[#ede7d8] hover:text-[#191816]'
                                            }`}
                                        >
                                            <Icon size={16} />
                                            <span>{group.label}</span>
                                            {group.badge !== undefined && (
                                                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                                                    group.active ? 'bg-white text-[#164e3b]' : 'bg-[#164e3b] text-white'
                                                }`}>
                                                    {group.badge}
                                                </span>
                                            )}
                                        </Link>
                                    );
                                }

                                // Dropdown Group Item
                                const Icon = group.icon;
                                const isOpen = activeDropdown === group.id;

                                return (
                                    <div key={group.id} className="relative" data-dropdown>
                                        <button
                                            type="button"
                                            onClick={() => setActiveDropdown(isOpen ? null : group.id)}
                                            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xs text-[13px] font-medium transition-all ${
                                                group.active
                                                    ? 'bg-[#e8f2ec] text-[#164e3b] font-semibold border border-[#a3d9b8]'
                                                    : 'text-[#454137] hover:bg-[#ede7d8] hover:text-[#191816]'
                                            }`}
                                        >
                                            <Icon size={16} />
                                            <span>{group.label}</span>
                                            <IconChevronDown
                                                size={14}
                                                className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                                            />
                                        </button>

                                        {/* Dropdown Menu Popover */}
                                        {isOpen && (
                                            <div className="absolute left-0 mt-1.5 w-72 bg-white border border-[#d6cebc] rounded-xs shadow-md py-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                                                {group.items.map((subItem) => {
                                                    const SubIcon = subItem.icon;
                                                    return (
                                                        <Link
                                                            key={subItem.href}
                                                            href={subItem.href}
                                                            onClick={() => setActiveDropdown(null)}
                                                            className={`block px-3.5 py-2.5 transition-colors border-l-2 ${
                                                                subItem.active
                                                                    ? 'bg-[#e8f5ed] border-[#164e3b] text-[#164e3b]'
                                                                    : 'border-transparent hover:bg-[#faf8f5] text-[#33302a]'
                                                            }`}
                                                        >
                                                            <div className="flex items-center gap-2 font-medium text-[13px]">
                                                                <SubIcon size={16} className={subItem.active ? 'text-[#164e3b]' : 'text-[#787161]'} />
                                                                <span>{subItem.label}</span>
                                                            </div>
                                                            {subItem.desc && (
                                                                <p className="text-[11px] text-[#736c5e] mt-0.5 pl-6 leading-tight">
                                                                    {subItem.desc}
                                                                </p>
                                                            )}
                                                        </Link>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </nav>

                        {/* User Profile / Login Action */}
                        <div className="hidden sm:flex items-center gap-3">
                            {currentUser ? (
                                <div className="flex items-center gap-2.5 pl-3 border-l border-[#ded7c4]">
                                    <div className="text-right">
                                        <div className="text-[13px] font-semibold text-[#191816] leading-tight">
                                            {currentUser.name}
                                        </div>
                                        <div className="text-[11px] font-mono text-[#787161] flex items-center justify-end gap-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-[#164e3b]"></span>
                                            <span>
                                                {currentUser.role === 'super_admin' && 'Kepala Perpustakaan'}
                                                {currentUser.role === 'petugas' && 'Petugas Sirkulasi'}
                                                {currentUser.role === 'anggota' && `${currentUser.member_type.toUpperCase()} • ${currentUser.class_name || currentUser.identity_number}`}
                                            </span>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleLogout}
                                        title="Keluar dari sesi"
                                        className="px-2.5 py-1.5 text-[12px] font-mono font-medium rounded-xs border border-[#ded7c4] bg-white hover:bg-[#fef2f2] text-[#787161] hover:text-[#991b1b] hover:border-[#fca5a5] transition-colors"
                                    >
                                        Keluar
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Link
                                        href="/daftar"
                                        className="inline-flex items-center gap-1 px-3 py-1.5 text-[13px] font-medium rounded-xs border border-[#ded7c4] bg-white text-[#3d3930] hover:bg-[#ede7d8] transition-colors"
                                    >
                                        <span>Daftar Anggota</span>
                                    </Link>
                                    <Link
                                        href="/login"
                                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-[13px] font-medium rounded-xs bg-[#164e3b] text-white hover:bg-[#0f392b] transition-colors shadow-2xs"
                                    >
                                        <span>Masuk / Login</span>
                                        <span>→</span>
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="flex items-center lg:hidden">
                            <button
                                type="button"
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="p-2 rounded-xs border border-[#ded7c4] bg-white text-[#454137]"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="3" y1="12" x2="21" y2="12"></line>
                                    <line x1="3" y1="6" x2="21" y2="6"></line>
                                    <line x1="3" y1="18" x2="21" y2="18"></line>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu Drawer */}
                {mobileMenuOpen && (
                    <div className="lg:hidden border-t border-[#ded7c4] bg-[#faf8f5] px-4 py-3 space-y-2">
                        {currentUser && (
                            <div className="p-2.5 mb-2 rounded-xs bg-[#f4eee1] border border-[#ded7c4]">
                                <div className="text-[13px] font-bold text-[#191816]">{currentUser.name}</div>
                                <div className="text-[11px] font-mono text-[#787161]">
                                    Peran: {currentUser.role} ({currentUser.member_type})
                                </div>
                            </div>
                        )}

                        {navGroups.map((group) => {
                            if (group.type === 'link') {
                                const Icon = group.icon;
                                return (
                                    <Link
                                        key={group.href}
                                        href={group.href}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={`flex items-center justify-between px-3 py-2 rounded-xs text-[13px] font-medium ${
                                            group.active ? 'bg-[#164e3b] text-white' : 'text-[#454137] hover:bg-[#ede7d8]'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <Icon size={16} />
                                            <span>{group.label}</span>
                                        </div>
                                        {group.badge !== undefined && (
                                            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono bg-[#164e3b] text-white">
                                                {group.badge}
                                            </span>
                                        )}
                                    </Link>
                                );
                            }

                            // Dropdown in Mobile Drawer: Group with Submenu
                            return (
                                <div key={group.id} className="pt-2 pb-1">
                                    <div className="text-[11px] font-mono uppercase tracking-wider text-[#787161] px-3 mb-1 font-semibold">
                                        {group.label}
                                    </div>
                                    <div className="space-y-1 pl-2">
                                        {group.items.map((sub) => {
                                            const SubIcon = sub.icon;
                                            return (
                                                <Link
                                                    key={sub.href}
                                                    href={sub.href}
                                                    onClick={() => setMobileMenuOpen(false)}
                                                    className={`flex items-center gap-2 px-3 py-2 rounded-xs text-[13px] font-medium ${
                                                        sub.active ? 'bg-[#164e3b] text-white' : 'text-[#454137] hover:bg-[#ede7d8]'
                                                    }`}
                                                >
                                                    <SubIcon size={15} />
                                                    <span>{sub.label}</span>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}

                        <div className="pt-2 border-t border-[#ded7c4] space-y-1.5">
                            {currentUser ? (
                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    className="w-full text-left px-3 py-2 text-[13px] text-[#991b1b] font-medium hover:bg-[#fef2f2] rounded-xs"
                                >
                                    Keluar dari Sistem
                                </button>
                            ) : (
                                <>
                                    <Link
                                        href="/daftar"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="block text-center px-4 py-2 border border-[#ded7c4] bg-white text-[#3d3930] text-[13px] font-medium rounded-xs hover:bg-[#ede7d8]"
                                    >
                                        Daftar Anggota Baru
                                    </Link>
                                    <Link
                                        href="/login"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="block text-center px-4 py-2 bg-[#164e3b] text-white text-[13px] font-medium rounded-xs hover:bg-[#0f392b]"
                                    >
                                        Masuk ke Akun
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </header>

            {/* Flash Notification Banner */}
            {!dismissFlash && (flash.success || flash.error || flash.info) && (
                <div
                    className={`border-b transition-all ${
                        flash.error
                            ? 'bg-[#fef2f2] border-[#fecaca] text-[#991b1b]'
                            : flash.info
                            ? 'bg-[#eff6ff] border-[#bfdbfe] text-[#1e40af]'
                            : 'bg-[#f0fdf4] border-[#bbf7d0] text-[#166534]'
                    }`}
                >
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between text-[13px]">
                        <div className="flex items-center gap-2">
                            {flash.error ? (
                                <IconAlertCircle size={18} className="shrink-0" />
                            ) : (
                                <IconCheckCircle size={18} className="shrink-0" />
                            )}
                            <span className="font-medium">
                                {flash.error || flash.info || flash.success}
                            </span>
                        </div>
                        <button
                            type="button"
                            onClick={() => setDismissFlash(true)}
                            className="text-current opacity-70 hover:opacity-100 p-1"
                        >
                            <IconX size={16} />
                        </button>
                    </div>
                </div>
            )}

            {/* Contextual Title Banner */}
            {(title || subtitle) && (
                <div className="border-b border-[#ded7c4] bg-[#fbf9f4] py-6 sm:py-8 px-4 sm:px-6">
                    <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            {title && (
                                <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-[#191816]">
                                    {title}
                                </h1>
                            )}
                            {subtitle && (
                                <p className="text-[13px] sm:text-[14px] text-[#6d6657] mt-1 max-w-3xl leading-relaxed">
                                    {subtitle}
                                </p>
                            )}
                        </div>
                        {actions && <div className="shrink-0">{actions}</div>}
                    </div>
                </div>
            )}

            {/* Main Application Canvas */}
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
                {children}
            </main>

            {/* Clean Archival Footer */}
            <footer className="border-t border-[#ded7c4] bg-[#f4eee1] text-[12px] text-[#615b4f] py-6 px-4 sm:px-6 mt-auto">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-center md:text-left">
                        <IconBook size={16} className="text-[#164e3b] shrink-0" />
                        <span>
                            © {new Date().getFullYear()} {settings?.library_name || 'Perpustakaan Cendekia Nusantara'}. 
                            Bagian dari ekosistem literasi {settings?.institution_name || 'SMA Negeri 1 Prestasi Bangsa'}.
                        </span>
                    </div>

                    <div className="flex items-center gap-3 font-mono text-[11px] text-[#787161]">
                        <Link href="/katalog/informasi-dan-tata-tertib" className="hover:underline">
                            Tata Tertib
                        </Link>
                        <span>•</span>
                        <Link href="/presensi/kiosk" className="hover:underline">
                            Kiosk Presensi
                        </Link>
                        <span>•</span>
                        <button
                            type="button"
                            onClick={() => setIsDemoModalOpen(true)}
                            className="text-[#164e3b] hover:underline font-semibold"
                        >
                            [Mode Evaluasi / Ganti Role]
                        </button>
                    </div>
                </div>
            </footer>

            {/* Evaluation Modal for Testing Different Roles without breaking user layout */}
            <Modal
                isOpen={isDemoModalOpen}
                onClose={() => setIsDemoModalOpen(false)}
                title="Beralih Peran Pengguna (Simulasi Evaluasi)"
            >
                <div className="space-y-4">
                    <p className="text-[13px] text-[#5c574c]">
                        Pilih peran di bawah ini untuk menguji hak akses sistem dan alur kerja masing-masing pengguna:
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <button
                            type="button"
                            onClick={() => switchRole('siswa')}
                            className="p-3 rounded-xs border border-[#ded7c4] bg-[#faf8f5] hover:bg-[#eef7f2] hover:border-[#164e3b] text-left transition-colors"
                        >
                            <div className="font-bold text-[13px] text-[#191816]">Siswa (Anggota)</div>
                            <div className="text-[11px] text-[#787161] font-mono mt-0.5">M. Rizky Pratama (XII MIPA 1)</div>
                            <div className="text-[11px] text-[#164e3b] mt-1">Akses: OPAC, Pinjaman Saya, Bebas Pustaka</div>
                        </button>

                        <button
                            type="button"
                            onClick={() => switchRole('guru')}
                            className="p-3 rounded-xs border border-[#ded7c4] bg-[#faf8f5] hover:bg-[#eef7f2] hover:border-[#164e3b] text-left transition-colors"
                        >
                            <div className="font-bold text-[13px] text-[#191816]">Dewan Guru (Anggota)</div>
                            <div className="text-[11px] text-[#787161] font-mono mt-0.5">Bambang Hariyanto, S.Pd</div>
                            <div className="text-[11px] text-[#164e3b] mt-1">Akses: Kuota 5 buku, Pinjaman Saya</div>
                        </button>

                        <button
                            type="button"
                            onClick={() => switchRole('petugas')}
                            className="p-3 rounded-xs border border-[#ded7c4] bg-[#faf8f5] hover:bg-[#eef7f2] hover:border-[#164e3b] text-left transition-colors"
                        >
                            <div className="font-bold text-[13px] text-[#191816]">Petugas Sirkulasi</div>
                            <div className="text-[11px] text-[#787161] font-mono mt-0.5">Ahmad Fadillah, S.Hum</div>
                            <div className="text-[11px] text-[#164e3b] mt-1">Akses: Meja Sirkulasi, Kelola Buku, Anggota</div>
                        </button>

                        <button
                            type="button"
                            onClick={() => switchRole('super_admin')}
                            className="p-3 rounded-xs border border-[#ded7c4] bg-[#faf8f5] hover:bg-[#eef7f2] hover:border-[#164e3b] text-left transition-colors"
                        >
                            <div className="font-bold text-[13px] text-[#191816]">Kepala Perpustakaan</div>
                            <div className="text-[11px] text-[#787161] font-mono mt-0.5">Dra. Hj. Siti Rahmawati, M.Pd</div>
                            <div className="text-[11px] text-[#164e3b] mt-1">Akses Penuh: Laporan Akreditasi, Tarif Denda</div>
                        </button>
                    </div>

                    <div className="pt-2 border-t border-[#ded7c4] flex justify-between items-center">
                        <button
                            type="button"
                            onClick={() => {
                                handleLogout();
                                setIsDemoModalOpen(false);
                            }}
                            className="text-[12px] text-[#991b1b] hover:underline font-mono"
                        >
                            Keluar Menjadi Tamu (Guest)
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsDemoModalOpen(false)}
                            className="px-4 py-1.5 rounded-xs border border-[#ded7c4] bg-white text-[12px] font-medium text-[#454137]"
                        >
                            Tutup
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
