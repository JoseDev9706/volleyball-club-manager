
import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';

type ToastType = 'success' | 'error';

interface ToastContextType {
  showToast: (message: string, type: ToastType) => void;
}

interface ToastState {
  message: string;
  type: ToastType;
  id: number;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const ToastStateContext = createContext<ToastState[] | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastState[]>([]);

  const showToast = useCallback((message: string, type: ToastType) => {
    const id = Date.now();
    setToasts(prevToasts => [...prevToasts, { message, type, id }]);
    setTimeout(() => {
      setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
    }, 5000);
  }, []);
  
  const removeToast = (id: number) => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
  };


  return (
    <ToastContext.Provider value={{ showToast }}>
      <ToastStateContext.Provider value={toasts}>
        {children}
        <ToastContainer removeToast={removeToast} />
      </ToastStateContext.Provider>
    </ToastContext.Provider>
  );
};


const ToastContainer: React.FC<{ removeToast: (id: number) => void }> = ({ removeToast }) => {
    const toasts = useContext(ToastStateContext) || [];
  
    return (
      <div className="fixed top-5 right-5 z-50 space-y-3 w-full max-w-xs">
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} onClose={() => removeToast(toast.id)} />
        ))}
      </div>
    );
}

const Toast: React.FC<ToastState & { onClose: () => void }> = ({ message, type, onClose }) => {
    const baseClasses = 'relative flex items-center justify-between w-full p-4 rounded-lg shadow-lg backdrop-blur-md';
    const typeClasses = {
        success: 'bg-green-500/30 text-green-200 border-l-4 border-green-500',
        error: 'bg-red-500/30 text-red-200 border-l-4 border-red-500',
    };
    const icon = {
        success: <i data-lucide="check-circle" className="w-6 h-6 text-green-400"></i>,
        error: <i data-lucide="alert-circle" className="w-6 h-6 text-red-400"></i>,
    }
    
    useEffect(() => {
      if (typeof (window as any).lucide !== 'undefined') {
        (window as any).lucide.createIcons();
      }
    }, []);

    return (
        <div className={`${baseClasses} ${typeClasses[type]} animate-fade-in-right`} role="alert">
            <div className="flex items-center">
              <div className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8">
                  {icon[type]}
              </div>
              <div className="ml-3 text-sm font-medium">{message}</div>
            </div>
            <button type="button" onClick={onClose} className="ml-auto -mx-1.5 -my-1.5 bg-transparent text-gray-400 hover:text-white rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-700/50 inline-flex h-8 w-8" aria-label="Close">
                <span className="sr-only">Close</span>
                <i data-lucide="x" className="w-5 h-5"></i>
            </button>
        </div>
    );
};


export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
