import React from 'react';

export interface PageContainerProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  maxWidth?: 'standard' | 'wide' | 'narrow';
}

export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  header,
  actions,
  className = '',
  maxWidth = 'standard',
}) => {
  const maxWidthClasses = {
    narrow: 'max-w-4xl',
    standard: 'max-w-7xl',
    wide: 'max-w-[1600px]',
  };

  return (
    <div className={`w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 ${maxWidthClasses[maxWidth]} ${className}`}>
      {(header || actions) && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 mb-8 border-b-4 border-[#111111]">
          <div className="min-w-0 flex-1">{header}</div>
          {actions && <div className="flex items-center gap-3 shrink-0">{actions}</div>}
        </div>
      )}
      {children}
    </div>
  );
};
