import React, { useEffect } from 'react';
import { Check, X } from 'lucide-react';

export type ToastProps = {
  message: string;
  type?: 'success' | 'error';
  onClose: () => void;
};

const Toast: React.FC<ToastProps> = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
      <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-4 py-3 rounded-lg shadow-elevation-2 border border-gray-200 dark:border-gray-700">
        {type === 'success' ? (
          <Check className="h-5 w-5 text-success-500" />
        ) : (
          <X className="h-5 w-5 text-error-500" />
        )}
        <p className="text-sm text-gray-700 dark:text-gray-300">{message}</p>
        <button
          onClick={onClose}
          className="ml-2 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
        >
          <X className="h-4 w-4 text-gray-500" />
        </button>
      </div>
    </div>
  );
};

export default Toast;