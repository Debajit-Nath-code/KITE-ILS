import React from 'react';
import { PageContent } from '../../data/readerMockData';
import { ReaderSettings } from '../../services/readingProgressService';

export interface ReaderContentProps {
  page: PageContent;
  settings: ReaderSettings;
  bookTitle: string;
  totalPages: number;
}

export const ReaderContent: React.FC<ReaderContentProps> = ({
  page,
  settings,
  bookTitle,
  totalPages,
}) => {
  // Compute typography classes based on reader settings
  const fontSizeClass = {
    sm: 'text-sm sm:text-base',
    md: 'text-base sm:text-lg',
    lg: 'text-lg sm:text-xl',
    xl: 'text-xl sm:text-2xl',
  }[settings.fontSize];

  const lineHeightClass = {
    tight: 'leading-normal',
    normal: 'leading-relaxed',
    relaxed: 'leading-loose',
  }[settings.lineHeight];

  const fontFamilyClass = settings.fontFamily === 'serif' ? 'font-serif' : 'font-sans';

  return (
    <main className="flex-1 overflow-y-auto px-4 sm:px-8 lg:px-12 py-8 flex justify-center selection:bg-sky-500/30 selection:text-inherit">
      <article className="max-w-2xl lg:max-w-3xl w-full flex flex-col justify-between min-h-full">
        {/* Running Header */}
        <div className="pb-6 mb-8 border-b border-inherit opacity-40 flex items-center justify-between text-[11px] font-mono select-none">
          <span className="truncate">{bookTitle}</span>
          <span className="shrink-0 ml-2">Kite Digital Access</span>
        </div>

        {/* Page Main Scholarly Body */}
        <div className={`space-y-6 ${fontFamilyClass} ${fontSizeClass} ${lineHeightClass}`}>
          {page.content.map((item, idx) => {
            if (item.type === 'heading') {
              return (
                <h2
                  key={idx}
                  className="font-serif font-bold text-2xl sm:text-3xl tracking-tight pt-2 pb-1 border-b border-inherit opacity-95"
                >
                  {item.text}
                </h2>
              );
            }

            if (item.type === 'paragraph') {
              return (
                <p key={idx} className="text-justify indent-4 sm:indent-6 opacity-90">
                  {item.text}
                </p>
              );
            }

            if (item.type === 'theorem') {
              return (
                <div
                  key={idx}
                  className="my-5 p-4 rounded-xl border border-inherit bg-black/5 dark:bg-white/5 font-sans text-xs sm:text-sm space-y-1.5"
                >
                  <span className="font-bold uppercase tracking-wider text-[11px] opacity-75 font-mono block">
                    {item.label || 'Theorem'}
                  </span>
                  <p className="font-serif italic leading-relaxed opacity-95">
                    {item.text}
                  </p>
                </div>
              );
            }

            if (item.type === 'callout') {
              return (
                <div
                  key={idx}
                  className="my-5 p-4 rounded-xl border-l-4 border-sky-600 bg-sky-500/10 font-sans text-xs sm:text-sm space-y-1"
                >
                  <span className="font-bold text-[11px] uppercase tracking-wider text-sky-700 dark:text-sky-300 font-mono block">
                    {item.label || 'Note'}
                  </span>
                  <p className="leading-relaxed opacity-90">
                    {item.text}
                  </p>
                </div>
              );
            }

            if (item.type === 'exercise') {
              return (
                <div
                  key={idx}
                  className="my-5 p-4 rounded-xl border border-amber-500/40 bg-amber-500/10 font-sans text-xs sm:text-sm space-y-1"
                >
                  <span className="font-bold text-[11px] uppercase tracking-wider text-amber-700 dark:text-amber-300 font-mono block">
                    {item.label || 'Exercise'}
                  </span>
                  <p className="leading-relaxed opacity-90">
                    {item.text}
                  </p>
                </div>
              );
            }

            if (item.type === 'code') {
              return (
                <div
                  key={idx}
                  className="my-5 rounded-xl overflow-hidden border border-inherit bg-slate-900 text-slate-100 font-mono text-xs shadow-inner"
                >
                  <div className="bg-slate-950 px-4 py-1.5 border-b border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
                    <span className="uppercase tracking-widest">{item.language || 'C Code'}</span>
                    <span>Example implementation</span>
                  </div>
                  <pre className="p-4 overflow-x-auto text-[11px] sm:text-xs leading-relaxed font-mono">
                    <code>{item.code}</code>
                  </pre>
                </div>
              );
            }

            return null;
          })}
        </div>

        {/* Running Footer */}
        <div className="pt-8 mt-12 border-t border-inherit opacity-40 flex items-center justify-between text-[11px] font-mono select-none">
          <span>{page.chapterTitle}</span>
          <span>Page {page.pageNumber} of {totalPages}</span>
        </div>
      </article>
    </main>
  );
};
