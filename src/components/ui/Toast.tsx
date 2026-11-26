import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import { ToastMessage, ToastType } from '../../types';

interface ToastContextType {
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
  toast: {
    success: (title: string, message?: string) => void;
    error: (title: string, message?: string) => void;
    warning: (title: string, message?: string) => void;
    info: (title: string, message?: string) => void;
  };
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    ({ title, message, type = 'info', duration = 4000 }: Omit<ToastMessage, 'id'>) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      setToasts((prev) => [...prev, { id, title, message, type, duration }]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const toast = {
    success: (title: string, message?: string) => addToast({ title, message, type: 'success' }),
    error: (title: string, message?: string) => addToast({ title, message, type: 'danger' }),
    warning: (title: string, message?: string) => addToast({ title, message, type: 'warning' }),
    info: (title: string, message?: string) => addToast({ title, message, type: 'info' }),
  };

  return (
    <ToastContext.Provider value={{ addToast, removeToast, toast }}>
      {children}
      {/* Toast Notification Container */}
      <div
        aria-live="polite"
        className="fixed bottom-3 left-3 right-3 sm:bottom-4 sm:left-auto sm:right-4 z-50 flex flex-col gap-2 sm:max-w-sm sm:w-full pointer-events-none"
      >
        {toasts.map((item) => (
          <ToastCard key={item.id} toast={item} onDismiss={() => removeToast(item.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

const iconMap: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle2 className="w-5 h-5 text-[#111111] shrink-0" />,
  warning: <AlertTriangle className="w-5 h-5 text-[#111111] shrink-0" />,
  danger: <AlertCircle className="w-5 h-5 text-[#FFFFFF] shrink-0" />,
  info: <Info className="w-5 h-5 text-[#FFFFFF] shrink-0" />,
};

const borderMap: Record<ToastType, string> = {
  success: 'border-3 border-[#111111] bg-[#43C95E] text-[#111111] shadow-[5px_5px_0px_#111111]',
  warning: 'border-3 border-[#111111] bg-[#FFD83D] text-[#111111] shadow-[5px_5px_0px_#111111]',
  danger: 'border-3 border-[#111111] bg-[#F05A79] text-[#FFFFFF] shadow-[5px_5px_0px_#111111]',
  info: 'border-3 border-[#111111] bg-[#24A9C7] text-[#FFFFFF] shadow-[5px_5px_0px_#111111]',
};

const ToastCard: React.FC<{ toast: ToastMessage; onDismiss: () => void }> = ({
  toast,
  onDismiss,
}) => {
  return (
    <div
      role="alert"
      className={`
        pointer-events-auto p-3.5 rounded-none border-3 border-[#111111] flex items-start gap-3 
        transition-all duration-150 animate-in slide-in-from-bottom-2
        ${borderMap[toast.type]}
      `}
    >
      <div className="mt-0.5">{iconMap[toast.type]}</div>
      <div className="flex-1 min-w-0 pr-1">
        <p className="text-xs font-heading uppercase font-bold tracking-wider">{toast.title}</p>
        {toast.message && (
          <p className="text-xs mt-0.5 font-medium leading-relaxed opacity-95">{toast.message}</p>
        )}
      </div>
      <button
        type="button"
        onClick={onDismiss}
        className="min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center p-2 sm:p-1 -mr-1 -mt-1 border border-[#111111] bg-white/30 hover:bg-white/60 text-current transition-colors cursor-pointer shrink-0"
        aria-label="Dismiss notification"
      >
        <X className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
      </button>
    </div>
  );
};
