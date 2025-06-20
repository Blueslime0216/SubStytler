import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, X, Info } from 'lucide-react';

export interface ToastProps {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
  duration?: number;
  onClose: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({
  id,
  type,
  title,
  message,
  duration = 5000,
  onClose
}) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose(id);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [id, duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-4 h-4" style={{ color: 'var(--neu-success)' }} />;
      case 'error':
        return <AlertCircle className="w-4 h-4" style={{ color: 'var(--neu-error)' }} />;
      case 'warning':
        return <AlertCircle className="w-4 h-4" style={{ color: 'var(--neu-warning)' }} />;
      case 'info':
      default:
        return <Info className="w-4 h-4" style={{ color: 'var(--neu-primary)' }} />;
    }
  };

  const getToastClass = () => {
    switch (type) {
      case 'success':
        return 'neu-toast-success';
      case 'error':
        return 'neu-toast-error';
      case 'warning':
        return 'neu-toast-warning';
      case 'info':
      default:
        return 'neu-toast-info';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.95 }}
      className={`neu-toast relative p-3 max-w-md ${getToastClass()}`}
    >
      <div className="flex items-start space-x-3">
        {getIcon()}
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium neu-text-primary">{title}</h4>
          {message && (
            <p className="text-xs neu-text-secondary mt-1">{message}</p>
          )}
        </div>
        <button
          onClick={() => onClose(id)}
          className="neu-btn-icon p-1"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
      
      {/* Progress bar for auto-dismiss */}
      {duration > 0 && (
        <motion.div
          className="absolute bottom-0 left-0 h-1 rounded-b-lg"
          style={{ backgroundColor: 'var(--neu-primary)' }}
          initial={{ width: '100%' }}
          animate={{ width: '0%' }}
          transition={{ duration: duration / 1000, ease: 'linear' }}
        />
      )}
    </motion.div>
  );
};