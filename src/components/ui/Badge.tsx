import React from 'react';
import { CheckCircle2, Clock, AlertCircle, Bookmark, Compass } from 'lucide-react';
import { BookAvailabilityStatus, ReservationStatus } from '../../types';

export const MetadataSeparator: React.FC<{ className?: string }> = ({ className = 'text-slate-300' }) => (
  <span className={`select-none mx-1.5 font-light ${className}`} aria-hidden="true">
    ·
  </span>
);

export interface StatusIndicatorProps {
  status: BookAvailabilityStatus | ReservationStatus | string;
  className?: string;
  showIcon?: boolean;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({ 
  status, 
  className = '',
  showIcon = true 
}) => {
  // Neo-Brutalist bold badges with solid black borders
  const configMap: Record<
    string, 
    { label: string; bgClass: string; textClass: string; borderClass: string; icon: React.ReactNode }
  > = {
    available_shelf: {
      label: 'AVAILABLE ON SHELF',
      bgClass: 'bg-[#43C95E]',
      textClass: 'text-[#111111]',
      borderClass: 'border-2 border-[#111111] shadow-[2px_2px_0px_#111111]',
      icon: <CheckCircle2 className="w-3.5 h-3.5 text-[#111111]" />,
    },
    ready_for_pickup: {
      label: 'READY FOR PICKUP',
      bgClass: 'bg-[#FFD83D]',
      textClass: 'text-[#111111]',
      borderClass: 'border-2 border-[#111111] shadow-[2px_2px_0px_#111111]',
      icon: <CheckCircle2 className="w-3.5 h-3.5 text-[#111111]" />,
    },
    reserved_hold: {
      label: 'ON HOLD / RESERVED',
      bgClass: 'bg-[#FFD83D]',
      textClass: 'text-[#111111]',
      borderClass: 'border-2 border-[#111111] shadow-[2px_2px_0px_#111111]',
      icon: <Clock className="w-3.5 h-3.5 text-[#111111]" />,
    },
    in_retrieval: {
      label: 'IN RETRIEVAL',
      bgClass: 'bg-[#24A9C7]',
      textClass: 'text-[#111111]',
      borderClass: 'border-2 border-[#111111] shadow-[2px_2px_0px_#111111]',
      icon: <Compass className="w-3.5 h-3.5 text-[#111111]" />,
    },
    queued: {
      label: 'IN QUEUE',
      bgClass: 'bg-[#FFD83D]',
      textClass: 'text-[#111111]',
      borderClass: 'border-2 border-[#111111] shadow-[2px_2px_0px_#111111]',
      icon: <Clock className="w-3.5 h-3.5 text-[#111111]" />,
    },
    checked_out: {
      label: 'CHECKED OUT',
      bgClass: 'bg-[#E5E0D5]',
      textClass: 'text-[#111111]',
      borderClass: 'border-2 border-[#111111] shadow-[2px_2px_0px_#111111]',
      icon: <Bookmark className="w-3.5 h-3.5 text-[#111111]" />,
    },
    in_transit: {
      label: 'IN TRANSIT',
      bgClass: 'bg-[#24A9C7]',
      textClass: 'text-[#111111]',
      borderClass: 'border-2 border-[#111111] shadow-[2px_2px_0px_#111111]',
      icon: <Clock className="w-3.5 h-3.5 text-[#111111]" />,
    },
    reference_only: {
      label: 'REFERENCE ONLY',
      bgClass: 'bg-[#F05A79]',
      textClass: 'text-[#FFFFFF]',
      borderClass: 'border-2 border-[#111111] shadow-[2px_2px_0px_#111111]',
      icon: <AlertCircle className="w-3.5 h-3.5 text-[#FFFFFF]" />,
    },
  };

  const current = configMap[status] || {
    label: status.replace(/_/g, ' ').toUpperCase(),
    bgClass: 'bg-[#FFFFFF]',
    textClass: 'text-[#111111]',
    borderClass: 'border-2 border-[#111111] shadow-[2px_2px_0px_#111111]',
    icon: <span className="w-2 h-2 rounded-full bg-[#111111]" />,
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-heading uppercase font-bold tracking-wider ${current.bgClass} ${current.textClass} ${current.borderClass} ${className}`}>
      {showIcon && current.icon}
      <span className="truncate">{current.label}</span>
    </span>
  );
};

export interface FormatBadgeProps {
  format: string;
  className?: string;
}

export const FormatBadge: React.FC<FormatBadgeProps> = ({ format, className = '' }) => {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-[11px] font-mono font-bold tracking-wider uppercase text-[#111111] bg-[#FFD83D] border-2 border-[#111111] shadow-[2px_2px_0px_#111111] ${className}`}
    >
      {format}
    </span>
  );
};
