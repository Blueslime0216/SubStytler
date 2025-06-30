import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Clock, Database, Trash2, RotateCcw } from 'lucide-react';
import { useAutoSave } from '../../hooks/useAutoSave';
import { formatFileSize } from '../../utils/videoUtils';
import { ClearBackupsConfirmationModal } from './ClearBackupsConfirmationModal';

interface AutoSaveMenuProps {
  isOpen: boolean;
  onClose: () => void;
  triggerRef: React.RefObject<HTMLElement>;
}

export const AutoSaveMenu: React.FC<AutoSaveMenuProps> = ({
  isOpen,
  onClose,
  triggerRef
}) => {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [showRestoreConfirm, setShowRestoreConfirm] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  
  const { 
    isEnabled, 
    toggleAutoSave, 
    interval, 
    setInterval, 
    maxBackups, 
    setMaxBackups,
    backups,
    totalStorageUsed,
    restoreBackup,
    clearAllBackups
  } = useAutoSave();

  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const menuHeight = 500;
      const menuWidth = 350;
      
      let top = rect.bottom + 8;
      let left = rect.left;
      
      // Adjust if menu would go off screen
      if (top + menuHeight > window.innerHeight) {
        top = rect.top - menuHeight - 8;
      }
      
      if (left + menuWidth > window.innerWidth) {
        left = rect.right - menuWidth;
      }
      
      setPosition({ top, left });
    }
  }, [isOpen, triggerRef]);

  const handleIntervalChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setInterval(parseInt(e.target.value));
  };

  const handleMaxBackupsChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setMaxBackups(parseInt(e.target.value));
  };

  const handleRestoreBackup = (timestamp: string) => {
    restoreBackup(timestamp);
    setShowRestoreConfirm(null);
    onClose();
  };

  const handleClearAllClick = () => {
    setShowClearConfirm(true);
  };

  const handleConfirmClearAll = () => {
    clearAllBackups();
    setShowClearConfirm(false);
    onClose();
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(parseInt(timestamp));
    return date.toLocaleString();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40"
        onClick={onClose}
      />
      
      {/* Menu */}
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          className="fixed z-50 bg-surface rounded-lg shadow-outset-strong overflow-hidden"
          style={{
            top: position.top,
            left: position.left,
            width: '350px',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-border-color bg-bg sticky top-0 z-10">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-text-primary text-sm">Auto Save</h3>
              <div className="flex items-center">
                <span className="text-xs text-text-secondary mr-2">
                  {isEnabled ? 'Enabled' : 'Disabled'}
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={isEnabled}
                    onChange={toggleAutoSave}
                  />
                  <div className="w-9 h-5 bg-surface peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-color"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            {/* Storage Usage */}
            <div className="bg-bg rounded-lg p-4 shadow-inset-subtle mb-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-text-primary flex items-center">
                  <Database className="w-3.5 h-3.5 mr-1.5" />
                  Storage Usage
                </h4>
                <span className="text-xs font-mono bg-surface px-2 py-1 rounded shadow-inset-subtle">
                  {formatFileSize(totalStorageUsed)}
                </span>
              </div>
              <div className="text-xs text-text-secondary">
                Total size of all auto-saved backups
              </div>
            </div>

            {/* Settings */}
            <div className="bg-bg rounded-lg p-4 shadow-inset-subtle mb-4">
              <h4 className="text-sm font-medium text-text-primary mb-3">Settings</h4>
              
              {/* Save Interval */}
              <div className="mb-3">
                <label className="block text-xs font-medium text-text-secondary mb-1">
                  <Clock className="w-3.5 h-3.5 inline mr-1.5" />
                  Save Interval
                </label>
                <select 
                  value={interval} 
                  onChange={handleIntervalChange}
                  className="w-full bg-surface shadow-inset rounded p-2 text-xs text-text-primary"
                  disabled={!isEnabled}
                >
                  <option value={0}>Real-time (every action)</option>
                  <option value={5000}>Every 5 seconds</option>
                  <option value={15000}>Every 15 seconds</option>
                  <option value={30000}>Every 30 seconds</option>
                  <option value={60000}>Every minute</option>
                  <option value={300000}>Every 5 minutes</option>
                </select>
                <p className="text-xs text-text-muted mt-1">
                  How frequently auto-save should occur
                </p>
              </div>
              
              {/* Max Backups */}
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">
                  <Database className="w-3.5 h-3.5 inline mr-1.5" />
                  Maximum Backups
                </label>
                <select 
                  value={maxBackups} 
                  onChange={handleMaxBackupsChange}
                  className="w-full bg-surface shadow-inset rounded p-2 text-xs text-text-primary"
                  disabled={!isEnabled}
                >
                  <option value={1}>1 backup</option>
                  <option value={3}>3 backups</option>
                  <option value={5}>5 backups</option>
                  <option value={10}>10 backups</option>
                  <option value={16}>16 backups</option>
                </select>
                <p className="text-xs text-text-muted mt-1">
                  Number of previous versions to keep
                </p>
              </div>
            </div>

            {/* Recent Backups */}
            <div className="bg-bg rounded-lg p-4 shadow-inset-subtle">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-text-primary">Recent Backups</h4>
                {backups.length > 0 && (
                  <button 
                    onClick={handleClearAllClick}
                    className="text-xs text-error-color flex items-center"
                    title="Clear all backups"
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    Clear All
                  </button>
                )}
              </div>
              
              {backups.length === 0 ? (
                <div className="text-center py-4 text-text-secondary">
                  <Save className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No backups available</p>
                  <p className="text-xs mt-1">Enable auto-save to create backups</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {backups.map((backup) => (
                    <div 
                      key={backup.timestamp}
                      className="bg-surface p-2 rounded shadow-outset-subtle flex items-center justify-between"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-text-primary truncate">
                          {backup.projectName || 'Untitled'}
                        </div>
                        <div className="text-xs text-text-secondary flex items-center">
                          <Clock className="w-3 h-3 mr-1 inline" />
                          {formatDate(backup.timestamp)}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-text-muted px-1">
                          {formatFileSize(backup.size)}
                        </span>
                        {showRestoreConfirm === backup.timestamp ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleRestoreBackup(backup.timestamp)}
                              className="text-xs bg-primary-color text-white px-2 py-1 rounded"
                            >
                              Yes
                            </button>
                            <button
                              onClick={() => setShowRestoreConfirm(null)}
                              className="text-xs bg-surface text-text-secondary px-2 py-1 rounded"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setShowRestoreConfirm(backup.timestamp)}
                            className="p-1 hover:bg-bg rounded"
                            title="Restore this backup"
                          >
                            <RotateCcw className="w-3.5 h-3.5 text-text-secondary" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-4 py-2 bg-bg/50 border-t border-border-color">
            <p className="text-xs text-text-secondary">
              Auto-save uses browser local storage to preserve your work
            </p>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Clear All Confirmation Modal */}
      <ClearBackupsConfirmationModal
        isOpen={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        onConfirm={handleConfirmClearAll}
        totalCount={backups.length}
        totalSize={formatFileSize(totalStorageUsed)}
      />
    </>
  );
};