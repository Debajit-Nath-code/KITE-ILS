import React from 'react';
import { SearchX, BookmarkX, Clock, FolderPlus, LucideIcon } from 'lucide-react';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = SearchX,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  className = '',
}) => {
  return (
    <div
      className={`
        bg-white rounded-xl border border-dashed border-slate-300/80 
        p-8 sm:p-12 text-center flex flex-col items-center justify-center 
        max-w-xl mx-auto my-6 ${className}
      `}
    >
      <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 mb-4 ring-1 ring-slate-200/60">
        <Icon className="w-6 h-6 stroke-[1.75]" />
      </div>
      <h3 className="font-serif text-lg sm:text-xl font-medium text-slate-900 tracking-tight">
        {title}
      </h3>
      <p className="text-xs sm:text-sm text-slate-500 mt-1.5 max-w-md leading-relaxed">
        {description}
      </p>

      {(actionLabel || secondaryActionLabel) && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {actionLabel && onAction && (
            <Button variant="primary" size="sm" onClick={onAction}>
              {actionLabel}
            </Button>
          )}
          {secondaryActionLabel && onSecondaryAction && (
            <Button variant="secondary" size="sm" onClick={onSecondaryAction}>
              {secondaryActionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export const NoReservationsEmpty: React.FC<{ onExplore: () => void }> = ({ onExplore }) => (
  <EmptyState
    icon={Clock}
    title="No Active Book Reservations"
    description="Reserve physical monographs, course reserves, or archival folios for automated locker or circulation desk pickup."
    actionLabel="Explore Catalog"
    onAction={onExplore}
  />
);

export const NoLoansEmpty: React.FC<{ onExplore: () => void }> = ({ onExplore }) => (
  <EmptyState
    icon={BookmarkX}
    title="No Books Currently Borrowed"
    description="Your checkout queue is empty. Real-time shelf discovery lets you reserve or locate any book in the university stacks."
    actionLabel="Browse Collection"
    onAction={onExplore}
  />
);

export const NoAcquisitionsEmpty: React.FC<{ onRequest: () => void }> = ({ onRequest }) => (
  <EmptyState
    icon={FolderPlus}
    title="No Acquisition Requests"
    description="Faculty and researchers may submit recommendations for new monograph purchases and subscription databases."
    actionLabel="Submit Acquisition Request"
    onAction={onRequest}
  />
);
