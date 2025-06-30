import React from 'react';
import { motion } from 'framer-motion';
import { Trash2, Database } from 'lucide-react';
import { Portal } from './Portal';

interface ClearBackupsConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  totalCount: number;
  totalSize: string;
}

/**
 * Modal component that warns before deleting all auto-save backups
 */
export const ClearBackupsConfirmationModal: React.FC<ClearBackupsConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  totalCount,
  totalSize,
}) => {
  if (!isOpen) return null;

  return (
    <Portal>
      <div className="fixed inset-0 z-[900] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="relative bg-surface rounded-lg shadow-outset-strong w-full max-w-md z-[910] overflow-hidden"
        >
          {/* Header */}
          <div className="p-5 border-b border-border-color">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-error-color/20 text-error-color rounded-lg flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-text-primary">Delete All Backups</h2>
                <p className="text-sm text-text-secondary">This action cannot be undone.</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-5 space-y-4">
            <div className="flex items-center gap-3 text-text-secondary text-sm">
              <Database className="w-4 h-4" />
              <span>
                Total <span className="font-semibold text-text-primary">{totalCount}</span> backups,{' '}
                <span className="font-semibold text-text-primary">{totalSize}</span> in use
              </span>
            </div>
            <p className="text-sm text-text-secondary">
              Are you sure you want to delete all auto-save backups? This action cannot be undone.
            </p>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 p-5 border-t border-border-color bg-bg/50">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-border-color text-text-secondary hover:bg-mid-color/30 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 rounded-lg bg-error-color text-white hover:bg-error-color/90 transition-colors"
            >
              Delete All
            </button>
          </div>
        </motion.div>
      </div>
    </Portal>
  );
}; 