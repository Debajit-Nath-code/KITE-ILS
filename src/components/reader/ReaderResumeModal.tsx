import React from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { BookOpen, Sparkles, RotateCcw, ArrowRight } from 'lucide-react';
import { ReadingProgress } from '../../services/readingProgressService';

export interface ReaderResumeModalProps {
  isOpen: boolean;
  progress: ReadingProgress;
  onContinue: () => void;
  onStartFromBeginning: () => void;
  onClose: () => void;
}

export const ReaderResumeModal: React.FC<ReaderResumeModalProps> = ({
  isOpen,
  progress,
  onContinue,
  onStartFromBeginning,
  onClose,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Welcome back"
      description={`Continue reading "${progress.bookTitle}" right where you left off.`}
      maxWidth="sm"
      footer={
        <div className="flex items-center justify-between gap-3 w-full">
          <Button
            variant="outline"
            size="md"
            className="w-1/2 text-xs"
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
            onClick={onStartFromBeginning}
          >
            Start from Beginning
          </Button>

          <Button
            variant="primary"
            size="md"
            className="w-1/2 text-xs"
            rightIcon={<ArrowRight className="w-4 h-4" />}
            onClick={onContinue}
          >
            Continue
          </Button>
        </div>
      }
    >
      <div className="space-y-4 py-2">
        {/* Prominent Question Banner */}
        <div className="p-4 bg-sky-50 dark:bg-sky-950/60 rounded-xl border border-sky-200/80 dark:border-sky-800 text-center space-y-1">
          <span className="text-xs uppercase font-mono tracking-wider text-sky-700 dark:text-sky-300 font-bold block">
            Smart Sync Active
          </span>
          <h3 className="font-serif text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            Continue from page {progress.currentPage}?
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {progress.chapter}
          </p>
        </div>

        {/* Progress Bar & Summary */}
        <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-700/60 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400">Reading Progress:</span>
            <span className="font-mono font-bold text-slate-900 dark:text-white">
              {progress.progressPercentage}% ({progress.currentPage} of {progress.totalPages} pages)
            </span>
          </div>

          <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-sky-600 rounded-full"
              style={{ width: `${progress.progressPercentage}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
            <span>Last opened {progress.lastOpened}</span>
            <span>Synced across campus devices</span>
          </div>
        </div>
      </div>
    </Modal>
  );
};
