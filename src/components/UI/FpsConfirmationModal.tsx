import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Clock } from 'lucide-react';
import { Portal } from './Portal';

interface FpsConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  detectedFps: number;
  onConfirm: (fps: number) => void;
}

export const FpsConfirmationModal: React.FC<FpsConfirmationModalProps> = ({
  isOpen,
  onClose,
  detectedFps,
  onConfirm
}) => {
  const [customFps, setCustomFps] = useState<string>(detectedFps.toString());
  const [error, setError] = useState<string | null>(null);

  // 일반적인 FPS 값 목록
  const commonFpsValues = [23.976, 24, 25, 29.97, 30, 50, 59.94, 60];

  const handleConfirm = () => {
    const fps = parseFloat(customFps);
    if (isNaN(fps) || fps <= 0 || fps > 240) {
      setError('유효한 FPS 값을 입력해주세요 (0-240)');
      return;
    }
    onConfirm(fps);
  };

  const handleFpsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomFps(e.target.value);
    setError(null);
  };

  const handleCommonFpsSelect = (fps: number) => {
    setCustomFps(fps.toString());
    setError(null);
  };

  if (!isOpen) return null;

  return (
    <Portal>
      <div className="fixed inset-0 z-[850] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="relative bg-surface border border-border-color rounded-lg shadow-outset-strong max-w-md w-full mx-4 overflow-hidden z-[860]"
        >
          {/* Header */}
          <div className="p-5 border-b border-border-color">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-warning-color/20 text-warning-color rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-text-primary">비정상적인 FPS 감지됨</h2>
                <p className="text-sm text-text-secondary">FPS 값을 확인해주세요</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-5">
            <div className="bg-warning-color/10 border border-warning-color/20 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-warning-color flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-warning-color mb-1">비정상적인 FPS 값</h3>
                  <p className="text-xs text-text-secondary">
                    감지된 FPS 값 <span className="font-semibold">{detectedFps}</span>가 일반적인 범위를 벗어납니다.
                    정확한 자막 타이밍을 위해 올바른 FPS 값을 설정해주세요.
                  </p>
                </div>
              </div>
            </div>

            {/* FPS 입력 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-text-primary mb-2">
                FPS 값 입력
              </label>
              <input
                type="number"
                value={customFps}
                onChange={handleFpsChange}
                className="w-full bg-bg shadow-inset rounded p-2 text-text-primary"
                placeholder="예: 23.976, 24, 25, 30, 60"
                step="0.001"
                min="1"
                max="240"
              />
              {error && (
                <p className="mt-1 text-xs text-error-color">{error}</p>
              )}
            </div>

            {/* 일반적인 FPS 값 선택 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-text-primary mb-2">
                일반적인 FPS 값
              </label>
              <div className="flex flex-wrap gap-2">
                {commonFpsValues.map((fps) => (
                  <button
                    key={fps}
                    onClick={() => handleCommonFpsSelect(fps)}
                    className={`px-3 py-1.5 text-xs rounded-md transition-all ${
                      parseFloat(customFps) === fps
                        ? 'bg-primary-color text-white shadow-outset'
                        : 'bg-bg text-text-secondary shadow-inset-subtle'
                    }`}
                  >
                    {fps}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 p-5 border-t border-border-color bg-bg/50">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-border-color text-text-secondary hover:bg-mid-color transition-colors"
            >
              취소
            </button>
            <button
              onClick={handleConfirm}
              className="px-4 py-2 rounded-lg bg-primary-color text-white hover:bg-primary-color/90 transition-colors"
            >
              확인
            </button>
          </div>
        </motion.div>
      </div>
    </Portal>
  );
};