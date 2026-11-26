import React from 'react';

interface BaseTypographyProps {
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
  id?: string;
}

export const DisplayHeading: React.FC<BaseTypographyProps> = ({ 
  children, 
  className = '', 
  as: Component = 'h1',
  id,
}) => {
  return (
    <Component 
      id={id}
      className={`font-heading text-[clamp(1.625rem,7.2vw,2.25rem)] sm:text-4xl lg:text-5xl font-extrabold uppercase tracking-tight text-[#111111] leading-[1.05] [text-wrap:balance] break-words ${className}`}
    >
      {children}
    </Component>
  );
};

export const PageHeading: React.FC<BaseTypographyProps> = ({ 
  children, 
  className = '', 
  as: Component = 'h1',
  id,
}) => {
  return (
    <Component 
      id={id}
      className={`font-heading text-[clamp(1.375rem,5.8vw,1.875rem)] sm:text-3xl font-bold uppercase tracking-tight text-[#111111] leading-tight [text-wrap:balance] break-words ${className}`}
    >
      {children}
    </Component>
  );
};

export const SectionHeading: React.FC<BaseTypographyProps> = ({ 
  children, 
  className = '', 
  as: Component = 'h2',
  id,
}) => {
  return (
    <Component 
      id={id}
      className={`font-heading text-lg sm:text-xl font-bold uppercase tracking-tight text-[#111111] ${className}`}
    >
      {children}
    </Component>
  );
};

export const Subheading: React.FC<BaseTypographyProps> = ({ 
  children, 
  className = '', 
  as: Component = 'p' 
}) => {
  return (
    <Component 
      className={`text-sm sm:text-base text-[#111111]/80 font-medium leading-relaxed ${className}`}
    >
      {children}
    </Component>
  );
};

export const Text: React.FC<BaseTypographyProps & { size?: 'xs' | 'sm' | 'base' | 'lg'; muted?: boolean }> = ({ 
  children, 
  className = '', 
  as: Component = 'p',
  size = 'base',
  muted = false,
}) => {
  const sizeClasses = {
    xs: 'text-xs leading-normal',
    sm: 'text-sm leading-relaxed',
    base: 'text-[15px] leading-relaxed',
    lg: 'text-lg leading-relaxed',
  };

  const colorClass = muted ? 'text-[#111111]/70' : 'text-[#111111]';

  return (
    <Component className={`${sizeClasses[size]} ${colorClass} ${className}`}>
      {children}
    </Component>
  );
};

export const MonospaceCallout: React.FC<BaseTypographyProps> = ({ 
  children, 
  className = '', 
  as: Component = 'span' 
}) => {
  return (
    <Component 
      className={`font-mono font-bold text-xs tracking-wider text-[#111111] bg-[#FFD83D] px-2.5 py-1 border-2 border-[#111111] shadow-[2px_2px_0px_#111111] select-all uppercase inline-block ${className}`}
    >
      {children}
    </Component>
  );
};

export const Kicker: React.FC<BaseTypographyProps> = ({ 
  children, 
  className = '', 
  as: Component = 'span' 
}) => {
  return (
    <Component 
      className={`font-mono text-xs font-bold uppercase tracking-widest text-[#111111] bg-[#FFD83D] border-2 border-[#111111] shadow-[2px_2px_0px_#111111] px-2 py-0.5 inline-block mb-2 select-none ${className}`}
    >
      {children}
    </Component>
  );
};
