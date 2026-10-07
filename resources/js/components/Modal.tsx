import React, { useEffect } from 'react';
import { IconX } from '@/components/icons';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    description?: string;
    children: React.ReactNode;
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export default function Modal({
    isOpen,
    onClose,
    title,
    description,
    children,
    maxWidth = 'lg',
}: ModalProps) {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const maxWidthClass = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
        '2xl': 'max-w-2xl',
    }[maxWidth];

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-[#191816]/60 backdrop-blur-xs transition-opacity"
                onClick={onClose}
            />

            {/* Modal Dialog */}
            <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
                <div
                    className={`relative transform overflow-hidden rounded-sm bg-[#faf8f5] text-left shadow-xl transition-all sm:my-8 w-full ${maxWidthClass} border border-[#d6cebc]`}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="border-b border-[#e2d9c4] bg-[#f5efe2] px-6 py-4 flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-serif font-bold text-[#191816]">
                                {title}
                            </h3>
                            {description && (
                                <p className="text-[13px] text-[#6d6657] mt-0.5">
                                    {description}
                                </p>
                            )}
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-xs p-1 text-[#6d6657] hover:text-[#191816] hover:bg-[#eae3d2] transition-colors"
                        >
                            <IconX size={18} />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="px-6 py-5">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
