import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutTemplate, Grid3X3, Columns, Rows, PanelTop, PanelBottomClose, LayoutGrid } from 'lucide-react';
import { useLayoutStore } from '../../stores/layoutStore';
import { useHistoryStore } from '../../stores/historyStore';
import { Area } from '../../types/area';
import { templateLayouts } from '../../config/templateLayouts';

export const LayoutTemplateButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { setAreas } = useLayoutStore();
  
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

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="btn px-4 py-1.5 text-sm shadow-outset bg-surface flex items-center gap-2"
        title="Change layout template"
      >
        <LayoutTemplate className="w-4 h-4" />
        <span>Templates</span>
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
              className="absolute left-0 top-full mt-2 z-50 bg-surface border border-border-color rounded-lg shadow-outset-strong p-3 w-80"
            >
              <h3 className="text-sm font-medium text-text-primary mb-3">Layout Templates</h3>
              
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(templateLayouts).map(([key, template]) => (
                  <motion.button
                    key={key}
                    onClick={() => handleTemplateSelect(template.areas)}
                    className="bg-bg p-3 rounded-lg shadow-outset-subtle border border-border-color hover:border-light-surface-color transition-all"
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
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};