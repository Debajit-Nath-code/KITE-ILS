import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  maxWidth = 'md',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#111111]/70 backdrop-blur-xs transition-opacity duration-200"
        aria-hidden="true"
        onClick={onClose}
      />

      {/* Modal Dialog Card */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        className={`
          relative w-full ${maxWidthClasses[maxWidth]} max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-3rem)] flex flex-col
          bg-white rounded-none shadow-[6px_6px_0px_#111111] sm:shadow-[10px_10px_0px_#111111] border-4 border-[#111111] 
          transform transition-all duration-200 z-10 overflow-hidden my-auto
        `}
      >
        {/* Header */}
        {(title || description) && (
          <div className="px-4 sm:px-6 pt-4 sm:pt-5 pb-3.5 sm:pb-4 border-b-3 border-[#111111] bg-[#FFD83D] flex items-start justify-between gap-3 sm:gap-4 shrink-0">
            <div className="min-w-0">
              {title && (
                <h2 id="modal-title" className="font-heading text-lg sm:text-2xl font-bold uppercase tracking-tight text-[#111111] break-words">
                  {title}
                </h2>
              )}
              {description && (
                <p className="text-xs sm:text-sm text-[#111111]/80 mt-1 font-medium leading-relaxed">
                  {description}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center p-2 sm:p-1 text-[#111111] hover:bg-white border-2 border-[#111111] shadow-[2px_2px_0px_#111111] transition-transform active:translate-x-0.5 active:translate-y-0.5 cursor-pointer shrink-0"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Content */}
        <div className="px-4 sm:px-6 py-4 sm:py-5 flex-1 min-h-0 max-h-[calc(85dvh-140px)] sm:max-h-[calc(85vh-140px)] overflow-y-auto overscroll-contain bg-white text-[#111111]">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-4 sm:px-6 py-3.5 sm:py-4 bg-[#F5F0E6] border-t-3 border-[#111111] flex flex-wrap items-center justify-end gap-2.5 sm:gap-3 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
