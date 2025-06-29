import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, AlertTriangle } from 'lucide-react';
import { Portal } from './Portal';
import { SubtitleTrack } from '../../types/project';

interface TrackDeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  track: SubtitleTrack | null;
}

export const TrackDeleteConfirmationModal: React.FC<TrackDeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  track
}) => {
  if (!isOpen || !track) return null;

  return (
    <Portal>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-surface rounded-lg shadow-outset-strong max-w-md w-full overflow-hidden"
        >
          {/* Header */}
          <div className="p-5 border-b border-border-color">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-error-color/20 text-error-color rounded-lg flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-text-primary">Delete Track</h2>
                <p className="text-sm text-text-secondary">This action cannot be undone</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-5">
            <div className="bg-warning-color/10 border border-warning-color/20 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-warning-color flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-warning-color mb-1">Warning</h3>
                  <p className="text-xs text-text-secondary">
                    Deleting track <span className="font-semibold">"{track.name}"</span> will also delete all subtitles in this track.
                  </p>
                </div>
              </div>
            </div>

            <p className="text-sm text-text-secondary mb-4">
              Are you sure you want to delete this track? This action cannot be undone.
            </p>
            
            {/* Track Details */}
            <div className="bg-bg rounded-lg p-4 shadow-inset-subtle">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-text-primary">{track.name}</span>
                <span className={`text-xs px-2 py-1 rounded ${track.locked ? 'bg-warning-color/20 text-warning-color' : 'bg-success-color/20 text-success-color'}`}>
                  {track.locked ? 'Locked' : 'Unlocked'}
                </span>
              </div>
              {track.detail && (
                <p className="text-xs text-text-secondary">{track.detail}</p>
              )}
            </div>
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
              Delete Track
            </button>
          </div>
        </motion.div>
      </div>
    </Portal>
  );
};