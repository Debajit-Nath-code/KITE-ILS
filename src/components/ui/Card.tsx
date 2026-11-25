import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
  elevation?: 'flat' | 'subtle';
  accentColor?: 'yellow' | 'blue' | 'orange' | 'purple' | 'pink' | 'green' | 'white';
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ children, className = '', interactive = false, elevation = 'subtle', accentColor = 'white', ...props }, ref) => {
    const bgMap = {
      white: 'bg-white',
      yellow: 'bg-[#FFD83D]',
      blue: 'bg-[#24A9C7]',
      orange: 'bg-[#F26B32]',
      purple: 'bg-[#7654D9]',
      pink: 'bg-[#F05A79]',
      green: 'bg-[#43C95E]',
    };

    const elevationClasses = {
      flat: 'border-3 border-[#111111] shadow-[2px_2px_0px_#111111]',
      subtle: 'border-3 border-[#111111] shadow-[5px_5px_0px_#111111]',
    };

    const interactiveClasses = interactive
      ? 'transition-all duration-100 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[8px_8px_0px_#111111] cursor-pointer'
      : '';

    return (
      <div
        ref={ref}
        className={`rounded-none ${bgMap[accentColor]} ${elevationClasses[elevation]} ${interactiveClasses} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Card.displayName = 'Card';

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <div className={`p-4 sm:p-5 border-b-2 border-[#111111] ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <h3
      className={`font-heading text-lg sm:text-xl font-bold uppercase tracking-tight text-[#111111] leading-snug ${className}`}
      {...props}
    >
      {children}
    </h3>
  );
};

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <p className={`text-xs sm:text-sm text-[#111111]/80 mt-1 font-medium leading-relaxed ${className}`} {...props}>
      {children}
    </p>
  );
};

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <div className={`p-4 sm:p-5 ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`px-4 sm:px-5 py-3 border-t-2 border-[#111111] bg-[#F5F0E6]/50 flex items-center justify-between text-xs font-semibold text-[#111111] ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
