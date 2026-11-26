import React, { useState, useRef, useEffect } from 'react';

export interface DropdownItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  danger?: boolean;
  dividerBefore?: boolean;
  description?: string;
}

export interface DropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  align?: 'left' | 'right';
  className?: string;
  menuWidth?: string;
}

export const Dropdown: React.FC<DropdownProps> = ({
  trigger,
  items,
  align = 'right',
  className = '',
  menuWidth = 'w-56',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const toggle = () => setIsOpen((prev) => !prev);

  return (
    <div ref={dropdownRef} className={`relative inline-block text-left ${className}`}>
      <div onClick={toggle} className="cursor-pointer">
        {trigger}
      </div>

      {isOpen && (
        <div
          role="menu"
          aria-orientation="vertical"
          className={`
            absolute ${align === 'right' ? 'right-0' : 'left-0'} mt-2 
            ${menuWidth} max-w-[calc(100vw-1.5rem)] max-h-[70dvh] overflow-y-auto overscroll-contain bg-white rounded-none shadow-[6px_6px_0px_#111111] border-3 border-[#111111] 
            py-1.5 z-40 focus:outline-none animate-in fade-in duration-100
          `}
        >
          {items.map((item) => (
            <React.Fragment key={item.id}>
              {item.dividerBefore && (
                <div className="h-0.5 bg-[#111111] my-1" role="separator" />
              )}
              <button
                type="button"
                role="menuitem"
                disabled={item.disabled}
                onClick={() => {
                  if (!item.disabled && item.onClick) {
                    item.onClick();
                  }
                  setIsOpen(false);
                }}
                className={`
                  w-full px-3.5 py-2.5 md:py-2 min-h-[44px] md:min-h-0 text-left text-xs font-bold font-heading uppercase tracking-wide
                  flex items-center gap-2.5 transition-colors cursor-pointer
                  ${
                    item.disabled
                      ? 'text-[#111111]/40 cursor-not-allowed bg-[#EFE9DC]/30'
                      : item.danger
                      ? 'text-[#F05A79] hover:bg-[#F05A79] hover:text-[#FFFFFF]'
                      : 'text-[#111111] hover:bg-[#FFD83D]'
                  }
                `}
              >
                {item.icon && <span className="shrink-0 text-[#111111]">{item.icon}</span>}
                <div className="flex-1 truncate">
                  <div>{item.label}</div>
                  {item.description && (
                    <div className="text-[10px] font-mono normal-case tracking-normal opacity-75 font-normal">
                      {item.description}
                    </div>
                  )}
                </div>
              </button>
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
};
