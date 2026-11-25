import React from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { ReaderSettings } from '../../services/readingProgressService';
import { Type, Sun, Moon, Coffee, AlignLeft, Check } from 'lucide-react';

export interface ReaderSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ReaderSettings;
  onUpdateSettings: (updated: Partial<ReaderSettings>) => void;
}

export const ReaderSettingsModal: React.FC<ReaderSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Reader Appearance"
      description="Personalize digital typography, contrast themes, and line spacing."
      maxWidth="sm"
      footer={
        <Button variant="primary" size="sm" className="w-full text-xs" onClick={onClose}>
          Done
        </Button>
      }
    >
      <div className="space-y-5 text-xs sm:text-sm py-1">
        {/* 1. Theme Selection */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
            Color Environment
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'paper', label: 'Paper', desc: 'White Light', bg: 'bg-white border-slate-300 text-slate-900', icon: <Sun className="w-4 h-4 text-amber-500" /> },
              { id: 'sepia', label: 'Sepia', desc: 'Warm Tint', bg: 'bg-[#f8f5eb] border-[#e4dcce] text-[#2d251e]', icon: <Coffee className="w-4 h-4 text-[#8c6b45]" /> },
              { id: 'dark', label: 'Midnight', desc: 'Low Light', bg: 'bg-slate-900 border-slate-700 text-slate-100', icon: <Moon className="w-4 h-4 text-sky-400" /> },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => onUpdateSettings({ theme: t.id as any })}
                className={`
                  p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${t.bg}
                  ${settings.theme === t.id ? 'ring-2 ring-sky-500 shadow-xs' : 'opacity-80 hover:opacity-100'}
                `}
              >
                <div className="flex items-center justify-between w-full mb-2">
                  {t.icon}
                  {settings.theme === t.id && <Check className="w-3.5 h-3.5" />}
                </div>
                <span className="font-semibold text-xs block">{t.label}</span>
                <span className="text-[10px] opacity-70 block">{t.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 2. Font Family */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
            Typography Style
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onUpdateSettings({ fontFamily: 'serif' })}
              className={`
                p-3 rounded-xl border text-left cursor-pointer transition-all
                ${
                  settings.fontFamily === 'serif'
                    ? 'border-sky-500 bg-sky-50/60 dark:bg-sky-950/60 ring-1 ring-sky-300 font-serif'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-serif'
                }
              `}
            >
              <span className="font-bold text-sm block">Editorial Serif</span>
              <span className="text-[11px] text-slate-500 block mt-0.5">Classic academic publishing face</span>
            </button>

            <button
              type="button"
              onClick={() => onUpdateSettings({ fontFamily: 'sans' })}
              className={`
                p-3 rounded-xl border text-left cursor-pointer transition-all
                ${
                  settings.fontFamily === 'sans'
                    ? 'border-sky-500 bg-sky-50/60 dark:bg-sky-950/60 ring-1 ring-sky-300 font-sans'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-sans'
                }
              `}
            >
              <span className="font-bold text-sm block">Modern Sans</span>
              <span className="text-[11px] text-slate-500 block mt-0.5">Clean technical readability</span>
            </button>
          </div>
        </div>

        {/* 3. Font Size Slider / Buttons */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
            Text Size
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[
              { id: 'sm', label: 'Small', sample: 'Aa' },
              { id: 'md', label: 'Medium', sample: 'Aa' },
              { id: 'lg', label: 'Large', sample: 'Aa' },
              { id: 'xl', label: 'XL', sample: 'Aa' },
            ].map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => onUpdateSettings({ fontSize: s.id as any })}
                className={`
                  p-2.5 rounded-lg border text-center transition-all cursor-pointer
                  ${
                    settings.fontSize === s.id
                      ? 'bg-slate-900 text-white border-slate-900 shadow-2xs font-bold'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                  }
                `}
              >
                <span className="text-base block mb-0.5">{s.sample}</span>
                <span className="text-[10px] block uppercase font-mono">{s.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 4. Line Spacing */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
            Line Spacing
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'tight', label: 'Compact' },
              { id: 'normal', label: 'Standard' },
              { id: 'relaxed', label: 'Spacious' },
            ].map((lh) => (
              <button
                key={lh.id}
                type="button"
                onClick={() => onUpdateSettings({ lineHeight: lh.id as any })}
                className={`
                  py-2 px-3 rounded-lg border text-center text-xs transition-all cursor-pointer
                  ${
                    settings.lineHeight === lh.id
                      ? 'bg-slate-900 text-white border-slate-900 font-semibold'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }
                `}
              >
                {lh.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
};
