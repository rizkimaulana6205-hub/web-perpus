import React from 'react';

interface BarcodeBadgeProps {
    code?: string;
    barcode?: string;
    label?: string;
    compact?: boolean;
    className?: string;
}

export default function BarcodeBadge({ code, barcode, label, compact = false, className = '' }: BarcodeBadgeProps) {
    const rawCode = (code || barcode || 'BOK-000-000').toString();

    // Generate deterministic pseudo-random bar pattern from string
    const bars = React.useMemo(() => {
        const pattern: number[] = [];
        let hash = 0;
        for (let i = 0; i < rawCode.length; i++) {
            hash = (hash << 5) - hash + rawCode.charCodeAt(i);
            hash |= 0;
        }

        const safeHash = Math.abs(hash);
        for (let i = 0; i < 28; i++) {
            const bit = (safeHash >> (i % 31)) & 1;
            const extra = (i * 7 + rawCode.length) % 3;
            pattern.push(bit ? (extra === 0 ? 3 : 2) : 1);
        }
        return pattern;
    }, [rawCode]);

    return (
        <div
            className={`inline-flex flex-col items-center justify-center bg-white border border-[#d6cebc] rounded-xs px-2.5 py-1.5 shadow-2xs ${className}`}
        >
            {label && (
                <div className="text-[10px] font-medium text-[#736c5e] uppercase tracking-wider mb-0.5">
                    {label}
                </div>
            )}
            <div className={`flex items-end gap-[1.5px] ${compact ? 'h-6' : 'h-9'} px-1`}>
                {bars.map((width, idx) => (
                    <div
                        key={idx}
                        className="bg-[#191816] rounded-none shrink-0"
                        style={{
                            width: `${width * 1.5}px`,
                            height: idx % 6 === 0 ? '100%' : '90%',
                        }}
                    />
                ))}
            </div>
            <div className="text-[11px] font-mono tracking-widest text-[#191816] mt-0.5 font-bold">
                {rawCode}
            </div>
        </div>
    );
}
