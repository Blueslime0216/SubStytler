import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, X, Info, Cog } from 'lucide-react';

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
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-400" />;
      case 'info':
      default:
        return <Info className="w-4 h-4 text-brass" />;
    }
  };

  const getToastClass = () => {
    switch (type) {
      case 'success':
        return 'bg-green-900 border-green-600';
      case 'error':
        return 'bg-red-900 border-red-600';
      case 'warning':
        return 'bg-yellow-900 border-yellow-600';
      case 'info':
      default:
        return 'toast-steampunk';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.95 }}
      className={`relative p-4 rounded-lg max-w-md ${getToastClass()} overflow-hidden`}
    >
      {/* 장식용 기어 */}
      <div className="absolute top-1 right-1">
        <Cog className="w-2 h-2 text-brass gear-slow opacity-30" />
      </div>
      
      {/* 리벳 장식 */}
      <div className="rivet-decoration top-1 left-1"></div>
      <div className="rivet-decoration bottom-1 right-1"></div>
      
      <div className="flex items-start space-x-3 relative z-10">
        {getIcon()}
        <div className="flex-1 min-w-0">
          <h4 className="font-steampunk text-sm font-medium text-primary">{title}</h4>
          {message && (
            <p className="font-body text-sm text-secondary mt-1">{message}</p>
          )}
        </div>
        <button
          onClick={() => onClose(id)}
          className="flex-shrink-0 p-1 rounded-full hover:bg-white/10 transition-colors"
        >
          <X className="w-3 h-3 text-muted" />
        </button>
      </div>
      
      {/* 프로그레스 바 */}
      {duration > 0 && (
        <motion.div
          className="absolute bottom-0 left-0 h-1 bg-brass rounded-b-lg"
          initial={{ width: '100%' }}
          animate={{ width: '0%' }}
          transition={{ duration: duration / 1000, ease: 'linear' }}
        />
      )}
    </motion.div>
  );
};