import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText } from 'lucide-react';
import { useProjectStore } from '../../stores/projectStore';
import { useToast } from '../../hooks/useToast';
import { generateYTTContent } from '../../utils/yttGenerator';
import { FpsConfirmationModal } from './FpsConfirmationModal';
import { expandProjectForAnimations } from '../../utils/animationExpander';

interface ExportMenuProps {
  isOpen: boolean;
  onClose: () => void;
  triggerRef: React.RefObject<HTMLElement>;
}

export const ExportMenu: React.FC<ExportMenuProps> = ({
  isOpen,
  onClose,
  triggerRef
}) => {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [isExporting, setIsExporting] = useState(false);
  const [fpsModalOpen, setFpsModalOpen] = useState(false);
  const [fpsForExport, setFpsForExport] = useState<number | null>(null);
  
  const { currentProject } = useProjectStore();
  const { success, error } = useToast();

  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const menuHeight = 200;
      const menuWidth = 280;
      
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

  const startExport = async (fpsValue: number) => {
    if (!currentProject || isExporting) return;
    setIsExporting(true);
    try {
      const expanded = expandProjectForAnimations(currentProject, fpsValue);
      const yttContent = generateYTTContent(expanded);
      
      // Create blob and download
      const blob = new Blob([yttContent], { type: 'application/xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${currentProject.name || 'subtitles'}.ytt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      success({
        title: 'Export Successful',
        message: 'Subtitles exported as YTT format'
      });
      
      onClose();
    } catch (err) {
      error({
        title: 'Export Failed',
        message: err instanceof Error ? err.message : 'Unknown error occurred'
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportClick = () => {
    // Open fps modal
    const defaultFps = currentProject?.videoMeta?.fps || 30;
    setFpsForExport(defaultFps);
    setFpsModalOpen(true);
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
            minWidth: '280px'
          }}
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-border-color bg-bg">
            <h3 className="font-semibold text-text-primary text-sm">Export Options</h3>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            {/* Export YTT */}
            <motion.button
              onClick={handleExportClick}
              disabled={!currentProject || isExporting || !currentProject.subtitles.length}
              className="w-full px-4 py-3 text-left hover:bg-bg transition-colors flex items-center gap-3 disabled:opacity-50"
              whileHover={{ x: 2 }}
            >
              <FileText className="w-4 h-4 text-text-secondary" />
              <div>
                <div className="text-sm font-medium text-text-primary">
                  {isExporting ? 'Exporting...' : 'Export Subtitles'}
                </div>
                <div className="text-xs text-text-secondary">
                  Export as YouTube Timed Text (.ytt) format
                </div>
              </div>
            </motion.button>
          </div>

          {/* Footer */}
          <div className="px-4 py-2 bg-bg/50 border-t border-border-color text-xs text-text-secondary">
            <p>Currently only YTT format is supported</p>
          </div>
        </motion.div>
      </AnimatePresence>

      <FpsConfirmationModal
        isOpen={fpsModalOpen}
        detectedFps={fpsForExport || 30}
        onClose={() => setFpsModalOpen(false)}
        onConfirm={(fps) => {
          setFpsModalOpen(false);
          startExport(fps);
        }}
      />
    </>
  );
};