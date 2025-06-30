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
 * 모든 자동-저장 백업을 삭제하기 전에 경고를 표시하는 모달 컴포넌트
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
                <h2 className="text-lg font-semibold text-text-primary">모든 백업 삭제</h2>
                <p className="text-sm text-text-secondary">이 작업은 되돌릴 수 없습니다.</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-5 space-y-4">
            <div className="flex items-center gap-3 text-text-secondary text-sm">
              <Database className="w-4 h-4" />
              <span>
                총 <span className="font-semibold text-text-primary">{totalCount}</span>개의 백업,{' '}
                <span className="font-semibold text-text-primary">{totalSize}</span> 사용 중
              </span>
            </div>
            <p className="text-sm text-text-secondary">
              모든 자동-저장 백업을 삭제하시겠습니까? 이 작업은 취소할 수 없습니다.
            </p>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 p-5 border-t border-border-color bg-bg/50">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-border-color text-text-secondary hover:bg-mid-color/30 transition-colors"
            >
              취소
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 rounded-lg bg-error-color text-white hover:bg-error-color/90 transition-colors"
            >
              모두 삭제
            </button>
          </div>
        </motion.div>
      </div>
    </Portal>
  );
}; 