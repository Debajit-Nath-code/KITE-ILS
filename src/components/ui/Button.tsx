import React from 'react';
import { Loader2 } from 'lucide-react';

export type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className = '',
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled = false,
      leftIcon,
      rightIcon,
      type = 'button',
      ...props
    },
    ref
  ) => {
    // Neo-Brutal Physical Buttons with bold black borders and hard offset shadows
    const variantStyles: Record<ButtonVariant, string> = {
      primary:
        'bg-[#FFD83D] text-[#111111] hover:bg-[#FFE366] active:bg-[#F5CB18] shadow-[4px_4px_0px_#111111]',
      secondary:
        'bg-[#FFFFFF] text-[#111111] hover:bg-[#FFFDF9] active:bg-[#EFE9DC] shadow-[4px_4px_0px_#111111]',
      accent:
        'bg-[#24A9C7] text-[#FFFFFF] hover:bg-[#34B7D5] active:bg-[#1E95B0] shadow-[4px_4px_0px_#111111]',
      outline:
        'bg-transparent text-[#111111] hover:bg-[#FFD83D]/20 shadow-[3px_3px_0px_#111111]',
      ghost:
        'bg-transparent text-[#111111] border-transparent shadow-none hover:bg-[#111111]/10 active:bg-[#111111]/20',
      danger:
        'bg-[#F05A79] text-[#FFFFFF] hover:bg-[#F3708C] active:bg-[#D94564] shadow-[4px_4px_0px_#111111]',
    };

    const sizeStyles: Record<ButtonSize, string> = {
      sm: 'h-8 px-3 text-xs font-bold gap-1.5',
      md: 'h-10 px-4 text-xs sm:text-sm font-bold gap-2',
      lg: 'h-12 px-6 text-sm sm:text-base font-extrabold gap-2.5',
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={`
          inline-flex items-center justify-center 
          whitespace-nowrap shrink-0 uppercase tracking-wider
          border-3 border-[#111111] rounded-none font-heading
          transition-transform duration-75 ease-out
          select-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0
          hover:not(:disabled):-translate-x-0.5 hover:not(:disabled):-translate-y-0.5 hover:not(:disabled):shadow-[6px_6px_0px_#111111]
          active:not(:disabled):translate-x-1 active:not(:disabled):translate-y-1 active:not(:disabled):shadow-[1px_1px_0px_#111111]
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111] focus-visible:ring-offset-2
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${className}
        `}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
        {!isLoading && leftIcon && <span className="shrink-0">{leftIcon}</span>}
        <span className="truncate">{children}</span>
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
