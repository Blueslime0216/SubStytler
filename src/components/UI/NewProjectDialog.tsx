import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, AlertTriangle } from 'lucide-react';
import { useProjectStore } from '../../stores/projectStore';
import { Portal } from './Portal';

interface NewProjectDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewProjectDialog: React.FC<NewProjectDialogProps> = ({
  isOpen,
  onClose
}) => {
  const { createProject, isModified } = useProjectStore();

  const handleCreateNewProject = () => {
    createProject('Untitled Project');
    onClose();
  };

  if (!isOpen) return null;

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
              <div className="w-10 h-10 bg-primary-color/20 text-primary-color rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-text-primary">Create New Project</h2>
                <p className="text-sm text-text-secondary">This will reset your current work</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-5">
            {isModified && (
              <div className="bg-warning-color/10 border border-warning-color/20 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-warning-color flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium text-warning-color mb-1">Unsaved Changes</h3>
                    <p className="text-xs text-text-secondary">
                      You have unsaved changes in your current project. Creating a new project will discard these changes.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <p className="text-sm text-text-secondary mb-4">
              Are you sure you want to create a new project? This will reset your workspace and remove any unsaved work.
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
              onClick={handleCreateNewProject}
              className="px-4 py-2 rounded-lg bg-primary-color text-white hover:bg-primary-color/90 transition-colors"
            >
              Create New Project
            </button>
          </div>
        </motion.div>
      </div>
    </Portal>
  );
};