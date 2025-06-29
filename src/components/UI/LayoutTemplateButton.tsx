import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutTemplate, Grid3X3, Columns, Rows, PanelTop, PanelBottomClose, LayoutGrid, Save, FolderOpen } from 'lucide-react';
import { useLayoutStore } from '../../stores/layoutStore';
import { useHistoryStore } from '../../stores/historyStore';
import { Area } from '../../types/area';
import { templateLayouts } from '../../config/templateLayouts';
import { useProjectSave } from '../../hooks/useProjectSave';

export const LayoutTemplateButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { setAreas } = useLayoutStore();
  const { saveLayoutToFileSystem, loadLayoutFromFileSystem } = useProjectSave();
  
  const handleTemplateSelect = (template: Area[]) => {
    // Record current layout for undo
    const { areas } = useLayoutStore.getState();
    useHistoryStore.getState().record(areas, 'Before changing layout template');
    
    // Apply new template
    setAreas(template);
    
    // Record new layout for redo
    useHistoryStore.getState().record(template, 'Changed layout template');
    
    // Close dropdown
    setIsOpen(false);
  };

  const handleSaveLayout = async () => {
    await saveLayoutToFileSystem();
    setIsOpen(false);
  };

  const handleLoadLayout = async () => {
    await loadLayoutFromFileSystem();
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="btn-sm px-4 py-2 text-sm flex items-center hover:bg-mid-color transition-all"
        title="Change layout template"
        whileHover={{ scale: 1.07, boxShadow: '0 2px 12px 0 rgba(94,129,172,0.10)' }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        <LayoutTemplate className="w-4 h-4 mr-2" />
        <span>Layout</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop for closing */}
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)}
            />
            
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute left-0 top-full mt-1 z-50 bg-surface rounded-lg shadow-outset-strong p-3 w-80"
            >
              <h3 className="text-sm font-medium text-text-primary mb-3">Layout Templates</h3>
              
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(templateLayouts).map(([key, template]) => (
                  <motion.button
                    key={key}
                    onClick={() => handleTemplateSelect(template.areas)}
                    className="bg-bg p-3 rounded-lg shadow-outset-subtle hover:border-primary-color transition-all"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="aspect-video bg-surface rounded-md shadow-inset-subtle mb-2 overflow-hidden relative">
                      {template.icon}
                    </div>
                    <div className="text-xs font-medium text-text-primary">{template.name}</div>
                    <div className="text-xs text-text-secondary mt-1">{template.description}</div>
                  </motion.button>
                ))}
              </div>

              {/* Layout Import/Export Options */}
              <div className="mt-4 border-t border-border-color pt-3">
                <div className="flex items-center justify-between gap-3">
                  <motion.button
                    onClick={handleSaveLayout}
                    className="flex-1 flex items-center justify-center gap-2 bg-bg p-2 rounded-lg shadow-outset-subtle hover:border-primary-color transition-all"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Save className="w-3.5 h-3.5 text-text-secondary" />
                    <span className="text-xs font-medium">Export Layout</span>
                  </motion.button>
                  
                  <motion.button
                    onClick={handleLoadLayout}
                    className="flex-1 flex items-center justify-center gap-2 bg-bg p-2 rounded-lg shadow-outset-subtle hover:border-primary-color transition-all"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <FolderOpen className="w-3.5 h-3.5 text-text-secondary" />
                    <span className="text-xs font-medium">Import Layout</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};