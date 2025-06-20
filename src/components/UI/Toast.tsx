import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, X, Info, Satellite } from 'lucide-react';

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
        return <CheckCircle className="w-6 h-6 text-aurora" />;
      case 'error':
        return <AlertCircle className="w-6 h-6 text-red-400" />;
      case 'warning':
        return <AlertCircle className="w-6 h-6 text-plasma" />;
      case 'info':
      default:
        return <Satellite className="w-6 h-6 text-nebula" />;
    }
  };

  const getToastClass = () => {
    switch (type) {
      case 'success':
        return 'toast-station-success';
      case 'error':
        return 'toast-station-error';
      case 'warning':
        return 'toast-station-warning';
      case 'info':
      default:
        return 'toast-station-info';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.95 }}
      className={`relative p-6 rounded-xl backdrop-blur-sm shadow-holo max-w-md ${getToastClass()}`}
    >
      <div className="flex items-start space-x-4">
        {getIcon()}
        <div className="flex-1 min-w-0">
          <h4 className="text-base font-semibold text-white font-station">{title}</h4>
          {message && (
            <p className="text-sm text-gray-100 mt-2 font-tech">{message}</p>
          )}
        </div>
        <button
          onClick={() => onClose(id)}
          className="flex-shrink-0 p-1 rounded-full hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5 text-gray-200" />
        </button>
      </div>
      
      {/* 우주 정거장 프로그레스 바 */}
      {duration > 0 && (
        <motion.div
          className="absolute bottom-0 left-0 h-1 bg-white/30 rounded-b-xl"
          initial={{ width: '100%' }}
          animate={{ width: '0%' }}
          transition={{ duration: duration / 1000, ease: 'linear' }}
        />
      )}
    </motion.div>
  );
};