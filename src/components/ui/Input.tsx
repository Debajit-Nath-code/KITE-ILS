import React from 'react';
import { Search, X } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      className = '',
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-medium text-slate-700 select-none"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3 flex items-center pointer-events-none text-slate-400">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            className={`
              w-full h-11 px-3.5 
              ${leftIcon ? 'pl-10' : ''} 
              ${rightIcon ? 'pr-10' : ''} 
              bg-white text-[#111111] text-base md:text-sm font-medium
              border-3 border-[#111111] rounded-none
              shadow-[3px_3px_0px_#111111]
              transition-all duration-100
              placeholder:text-[#111111]/40 
              disabled:bg-[#EFE9DC] disabled:text-[#111111]/40 disabled:cursor-not-allowed
              focus:outline-none focus:bg-[#FFFDF9] focus:shadow-[5px_5px_0px_#111111]
              ${error ? 'border-[#F05A79] focus:border-[#F05A79]' : 'border-[#111111]'}
              ${className}
            `}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 flex items-center text-slate-400">
              {rightIcon}
            </div>
          )}
        </div>
        {error ? (
          <p className="text-xs text-rose-600 font-medium">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-slate-500">{helperText}</p>
        ) : null}
      </div>
    );
  }
);
Input.displayName = 'Input';

export interface SearchInputProps extends Omit<InputProps, 'leftIcon'> {
  onClear?: () => void;
  shortcutHint?: string;
}

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  (
    {
      value,
      onChange,
      onClear,
      placeholder = 'Search by title, author, ISBN, or LC call number...',
      shortcutHint = '⌘K',
      className = '',
      ...props
    },
    ref
  ) => {
    const hasValue = Boolean(value && String(value).length > 0);

    return (
      <div className="relative w-full">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
          <Search className="w-4 h-4" />
        </div>
        <input
          ref={ref}
          type="search"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`
            w-full h-11 pl-10 pr-14 sm:pr-16 
            bg-white text-[#111111] text-base md:text-sm font-medium
            border-3 border-[#111111] rounded-none
            shadow-[3px_3px_0px_#111111]
            placeholder:text-[#111111]/40 
            transition-all duration-100
            hover:border-[#111111]
            focus:outline-none focus:bg-[#FFFDF9] focus:shadow-[5px_5px_0px_#111111]
            ${className}
          `}
          {...props}
        />
        <div className="absolute right-1.5 sm:right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
          {hasValue && onClear && (
            <button
              type="button"
              onClick={onClear}
              className="min-w-[38px] min-h-[38px] sm:min-w-0 sm:min-h-0 flex items-center justify-center p-1 text-[#111111] hover:bg-[#FFD83D] border border-[#111111] transition-colors"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          {shortcutHint && !hasValue && (
            <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono font-bold text-[#111111] bg-[#FFD83D] border-2 border-[#111111] shadow-[1px_1px_0px_#111111]">
              {shortcutHint}
            </kbd>
          )}
        </div>
      </div>
    );
  }
);
SearchInput.displayName = 'SearchInput';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { label: string; value: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className = '', id, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={selectId} className="block text-xs font-heading font-bold uppercase tracking-wider text-[#111111]">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={`
            w-full h-11 px-3 bg-white text-[#111111] text-base md:text-sm font-medium
            border-3 border-[#111111] rounded-none shadow-[3px_3px_0px_#111111]
            transition-all duration-100
            hover:border-[#111111]
            focus:outline-none focus:bg-[#FFFDF9] focus:shadow-[5px_5px_0px_#111111]
            disabled:bg-[#EFE9DC] disabled:text-[#111111]/40
            ${error ? 'border-[#F05A79]' : ''}
            ${className}
          `}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="text-xs text-[#F05A79] font-bold">{error}</p>}
      </div>
    );
  }
);
Select.displayName = 'Select';

export interface SegmentedControlProps<T extends string> {
  options: { label: string; value: T; count?: number }[];
  value: T;
  onChange: (val: T) => void;
  className?: string;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className = '',
}: SegmentedControlProps<T>) {
  return (
    <div
      role="tablist"
      className={`inline-flex max-w-full overflow-x-auto items-center p-1 bg-[#111111] border-3 border-[#111111] shadow-[3px_3px_0px_#111111] gap-1 ${className}`}
    >
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(option.value)}
            className={`
              min-h-[44px] md:min-h-0 px-3 py-1.5 text-xs font-heading uppercase font-bold tracking-wider whitespace-nowrap shrink-0 transition-all duration-100
              ${
                isActive
                  ? 'bg-[#FFD83D] text-[#111111] shadow-[2px_2px_0px_#111111]'
                  : 'text-[#FFFFFF] hover:bg-[#FFFFFF]/20'
              }
            `}
          >
            <span>{option.label}</span>
            {typeof option.count === 'number' && (
              <span
                className={`ml-1.5 font-mono text-[11px] tabular-nums font-bold ${
                  isActive ? 'text-[#111111]' : 'text-[#FFD83D]'
                }`}
              >
                ({option.count})
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
