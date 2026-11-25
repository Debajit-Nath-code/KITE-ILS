import React from 'react';
import { BookOpen } from 'lucide-react';

export const BookCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs animate-pulse">
      <div className="flex gap-4 items-start">
        {/* Book spine/cover mockup skeleton */}
        <div className="w-16 h-22 bg-slate-200 rounded-sm shrink-0" />
        <div className="flex-1 space-y-2.5">
          <div className="h-4 bg-slate-200 rounded w-4/5" />
          <div className="h-3 bg-slate-100 rounded w-3/5" />
          <div className="pt-2 flex items-center gap-2">
            <div className="h-4 bg-slate-100 rounded w-24" />
            <div className="h-4 bg-slate-100 rounded w-16" />
          </div>
        </div>
      </div>
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
        <div className="h-3 bg-slate-100 rounded w-32" />
        <div className="h-7 bg-slate-200 rounded-lg w-20" />
      </div>
    </div>
  );
};

export const TableRowSkeleton: React.FC = () => {
  return (
    <tr className="animate-pulse border-b border-slate-100">
      <td className="py-4 px-4">
        <div className="h-4 bg-slate-200 rounded w-48 mb-1" />
        <div className="h-3 bg-slate-100 rounded w-32" />
      </td>
      <td className="py-4 px-4">
        <div className="h-4 bg-slate-100 rounded w-28 font-mono" />
      </td>
      <td className="py-4 px-4">
        <div className="h-4 bg-slate-100 rounded w-20" />
      </td>
      <td className="py-4 px-4 text-right">
        <div className="h-8 bg-slate-200 rounded-lg w-24 ml-auto" />
      </td>
    </tr>
  );
};

export const AcademicSpinner: React.FC<{ text?: string; className?: string }> = ({
  text = 'Retrieving university catalog...',
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-12 text-center ${className}`}>
      <div className="relative w-12 h-12 flex items-center justify-center mb-4">
        <div className="absolute inset-0 rounded-full border-2 border-slate-200 border-t-sky-600 animate-spin" />
        <BookOpen className="w-5 h-5 text-slate-700" />
      </div>
      <p className="text-sm font-medium text-slate-700">{text}</p>
      <p className="text-xs text-slate-400 mt-1">Cross-referencing real-time shelf status</p>
    </div>
  );
};
