import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, FolderOpen, FileText, Download, AlertCircle, LayoutTemplate, Upload, RefreshCw } from 'lucide-react';
import { useProjectSave } from '../../hooks/useProjectSave';
import { useProjectStore } from '../../stores/projectStore';
import { useToast } from '../../hooks/useToast';

interface ProjectFileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  triggerRef: React.RefObject<HTMLElement>;
  onLoadProject: () => Promise<void>;
  onNewProject: () => void;
  hasVideo: boolean;
}

export const ProjectFileMenu: React.FC<ProjectFileMenuProps> = ({
  isOpen,
  onClose,
  triggerRef,
  onLoadProject,
  onNewProject,
  hasVideo
}) => {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { 
    saveProjectToFileSystem, 
    canSave 
  } = useProjectSave();
  const { currentProject, isModified, triggerVideoUpload } = useProjectStore();
  const { error } = useToast();

  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const menuHeight = 400; // Increased for new menu items
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

  const handleSave = async () => {
    if (!canSave || isSaving) return;
    
    setIsSaving(true);
    try {
      await saveProjectToFileSystem();
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  const handleLoad = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      // 🆕 Use the callback provided by App component
      await onLoadProject();
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadVideo = () => {
    triggerVideoUpload();
    onClose();
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
            <h3 className="font-semibold text-text-primary text-sm">Project</h3>
            {currentProject && (
              <p className="text-xs text-text-secondary mt-1">
                {currentProject.name}
                {isModified && <span className="text-warning-color ml-1">•</span>}
              </p>
            )}
          </div>

          {/* Menu Items */}
          <div className="py-2">
            {/* New Project */}
            <motion.button
              onClick={onNewProject}
              className="w-full px-4 py-3 text-left hover:bg-bg transition-colors flex items-center gap-3"
              whileHover={{ x: 2 }}
            >
              <FileText className="w-4 h-4 text-text-secondary" />
              <div>
                <div className="text-sm font-medium text-text-primary">New Project</div>
                <div className="text-xs text-text-secondary">Start a new project</div>
              </div>
            </motion.button>

            {/* Load Project */}
            <motion.button
              onClick={handleLoad}
              disabled={isLoading}
              className="w-full px-4 py-3 text-left hover:bg-bg transition-colors flex items-center gap-3 disabled:opacity-50"
              whileHover={{ x: 2 }}
            >
              <FolderOpen className="w-4 h-4 text-text-secondary" />
              <div>
                <div className="text-sm font-medium text-text-primary">
                  {isLoading ? 'Loading...' : 'Open Project'}
                </div>
                <div className="text-xs text-text-secondary">Load a .ssp project file</div>
              </div>
            </motion.button>

            {/* Divider */}
            <div className="my-2 border-t border-border-color" />

            {/* Save Project */}
            <motion.button
              onClick={handleSave}
              disabled={!canSave || isSaving}
              className="w-full px-4 py-3 text-left hover:bg-bg transition-colors flex items-center gap-3 disabled:opacity-50"
              whileHover={{ x: 2 }}
            >
              <Save className="w-4 h-4 text-text-secondary" />
              <div>
                <div className="text-sm font-medium text-text-primary">
                  {isSaving ? 'Saving...' : 'Save Project'}
                </div>
                <div className="text-xs text-text-secondary">
                  {canSave ? 'Save as .ssp file' : 'No project to save'}
                </div>
              </div>
            </motion.button>

            {/* Divider */}
            <div className="my-2 border-t border-border-color" />

            {/* Upload Video */}
            <motion.button
              onClick={handleUploadVideo}
              className="w-full px-4 py-3 text-left hover:bg-bg transition-colors flex items-center gap-3"
              whileHover={{ x: 2 }}
              disabled={hasVideo}
            >
              <Upload className="w-4 h-4 text-text-secondary" />
              <div>
                <div className="text-sm font-medium text-text-primary">Upload Video</div>
                <div className="text-xs text-text-secondary">
                  {hasVideo ? 'Video already uploaded' : 'Add a video to your project'}
                </div>
              </div>
            </motion.button>

            {/* Change Video */}
            <motion.button
              onClick={handleUploadVideo}
              className="w-full px-4 py-3 text-left hover:bg-bg transition-colors flex items-center gap-3"
              whileHover={{ x: 2 }}
              disabled={!hasVideo}
            >
              <RefreshCw className="w-4 h-4 text-text-secondary" />
              <div>
                <div className="text-sm font-medium text-text-primary">Change Video</div>
                <div className="text-xs text-text-secondary">
                  {hasVideo ? 'Replace current video' : 'No video to replace'}
                </div>
              </div>
            </motion.button>
          </div>

          {/* Footer */}
          {isModified && (
            <div className="px-4 py-2 bg-warning-color/10 border-t border-warning-color/20">
              <div className="flex items-center gap-2 text-xs text-warning-color">
                <AlertCircle className="w-3 h-3" />
                <span>You have unsaved changes</span>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </>
  );
};