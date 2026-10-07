import React from 'react';
import { Head, Link } from '@inertiajs/react';
import BarcodeBadge from '@/components/BarcodeBadge';
import { IconPrinter, IconBookOpen, IconBarcode } from '@/components/icons';

interface BookCopy {
    id: number;
    barcode: string;
    call_number: string;
    status: string;
    condition: string;
    book: {
        id: number;
        title: string;
        author: string;
        publisher: string;
        ddc_code: string;
        rack_location: string;
        category?: {
            name: string;
        };
    };
}

interface BarcodesProps {
    copies: BookCopy[];
    setting: {
        library_name: string;
        institution_name: string;
    };
}

export default function BookBarcodes({ copies, setting }: BarcodesProps) {
    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="min-h-screen bg-[#ede8dc] py-8 px-4 flex flex-col items-center print:bg-white print:p-0">
            <Head title="Cetak Lembar Barcode & Label Punggung Buku" />

            {/* Print action toolbar */}
            <div className="w-full max-w-5xl flex items-center justify-between mb-6 no-print bg-white p-3.5 rounded-xs border border-[#ded7c4] shadow-xs">
                <Link
                    href="/kelola-buku"
                    className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#454137] hover:text-[#164e3b]"
                >
                    ← Kembali ke Kelola Katalog
                </Link>

                <div className="flex items-center gap-3">
                    <span className="text-[12px] text-[#6d6657]">
                        Menampilkan <strong>{copies.length}</strong> stiker label buku siap cetak
                    </span>
                    <button
                        type="button"
                        onClick={handlePrint}
                        className="inline-flex items-center gap-2 px-5 py-2 bg-[#164e3b] hover:bg-[#0f392b] text-white text-[13px] font-bold rounded-xs shadow-xs transition-colors"
                    >
                        <IconPrinter size={16} />
                        <span>Cetak Lembar Stiker (A4)</span>
                    </button>
                </div>
            </div>

            {/* Printable Sheet (Standard A4 Grid of Book Spine & Barcode Labels) */}
            <div className="w-full max-w-5xl bg-white p-8 border border-[#cfc7b4] shadow-md print:border-none print:shadow-none print:p-4 text-[#111110]">
                <div className="text-center pb-4 border-b border-[#ded7c4] mb-6 no-print">
                    <div className="text-[11px] font-mono text-[#787161] uppercase tracking-wider">
                        Lembar Label Punggung Buku & Stiker Barcode Scanner
                    </div>
                    <h2 className="text-xl font-serif font-bold text-[#191816] mt-0.5">
                        {setting.library_name} • {setting.institution_name}
                    </h2>
                </div>

                {/* Grid of Sticker Labels (2 columns per row, designed to fit standard Avery/Tom & Jerry sticker sheet) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {copies.map((copy) => (
                        <div
                            key={copy.id}
                            className="border-2 border-[#191816] rounded-xs p-3 bg-white flex flex-col justify-between h-[180px] relative text-[#191816] print:border-2"
                        >
                            {/* Header Label */}
                            <div className="text-center pb-1.5 border-b border-[#191816]">
                                <div className="text-[8.5px] font-mono font-bold uppercase tracking-wider truncate">
                                    {setting.library_name}
                                </div>
                                <div className="text-[7.5px] text-[#524d42] truncate uppercase">
                                    {setting.institution_name}
                                </div>
                            </div>

                            {/* Middle Spine Spec (Call number in standard library 3-line format) */}
                            <div className="my-auto py-1 text-center font-mono">
                                <div className="text-[14px] font-bold tracking-wider leading-none text-[#191816]">
                                    {copy.call_number}
                                </div>
                                <div className="text-[10px] font-serif font-bold text-[#191816] line-clamp-1 mt-1">
                                    {copy.book.title}
                                </div>
                                <div className="text-[8px] text-[#6d6657] truncate font-sans">
                                    {copy.book.rack_location}
                                </div>
                            </div>

                            {/* Bottom Barcode */}
                            <div className="pt-1.5 border-t border-[#191816] flex items-center justify-between">
                                <BarcodeBadge
                                    code={copy.barcode}
                                    compact={true}
                                    className="border-none p-0 bg-transparent"
                                />
                                <div className="text-right text-[7.5px] font-mono text-[#524d42]">
                                    DDC {copy.book.ddc_code}<br />
                                    MILIK NEGARA
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
