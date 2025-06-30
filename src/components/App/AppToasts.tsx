import React from 'react';
import { ToastContainer } from '../UI/ToastContainer';
import { ToastProps } from '../UI/Toast';

interface AppToastsProps {
  toasts: ToastProps[];
  onClose: (id: string) => void;
}

export const AppToasts: React.FC<AppToastsProps> = ({ toasts, onClose }) => {
  return <ToastContainer toasts={toasts} onClose={onClose} />;
};