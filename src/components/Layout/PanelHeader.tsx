import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Plus, X, AlertTriangle } from 'lucide-react';

interface PanelConfig {
  title: string;
  icon: React.ComponentType<any>;
  description: string;
}

interface PanelHeaderProps {
  config: PanelConfig;
  isDropdownOpen: boolean;
  setIsDropdownOpen: (open: boolean) => void;
  isActionsOpen: boolean;
  setIsActionsOpen: (open: boolean) => void;
  canRemove: boolean;
  showRemoveConfirm: boolean;
  onRemoveClick: () => void;
  onRemovePanel: () => void;
  onCancelRemove: () => void;
}

export const PanelHeader: React.FC<PanelHeaderProps> = ({
  config,
  isDropdownOpen,
  setIsDropdownOpen,
  isActionsOpen,
  setIsActionsOpen,
  canRemove,
  showRemoveConfirm,
  onRemoveClick,
  onRemovePanel,
  onCancelRemove
}) => {
  const IconComponent = config.icon;

  return (
    <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700 relative">
      <div className="flex items-center space-x-2 flex-1">
        <IconComponent className="w-4 h-4 text-gray-400" />
        
        {/* Panel Selector Dropdown Container */}
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center space-x-1 text-sm font-medium text-gray-200 hover:text-white transition-colors group"
          >
            <span>{config.title}</span>
            <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${
              isDropdownOpen ? 'rotate-180' : ''
            }`} />
          </motion.button>

          {/* Panel Type Dropdown - Positioned relative to this container */}
          <AnimatePresence>
            {isDropdownOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40"
                  onClick={() => setIsDropdownOpen(false)}
                />
                
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full left-0 mt-1 w-64 bg-gray-800 border border-gray-600 rounded-lg shadow-xl z-50 overflow-hidden"
                >
                  <div className="p-2">
                    <div className="text-xs text-gray-400 px-2 py-1 mb-1">
                      Switch Panel Type
                    </div>
                    {/* Content will be rendered by PanelDropdowns component */}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      {/* Panel Actions */}
      <div className="flex items-center space-x-1">
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsActionsOpen(!isActionsOpen)}
            className="p-1 rounded hover:bg-gray-700 transition-colors"
            title="Panel Actions"
          >
            <Plus className="w-3 h-3 text-gray-400" />
          </motion.button>

          {/* Actions Dropdown - Positioned relative to this container */}
          <AnimatePresence>
            {isActionsOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40"
                  onClick={() => setIsActionsOpen(false)}
                />
                
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full right-0 mt-1 w-48 bg-gray-800 border border-gray-600 rounded-lg shadow-xl z-50 overflow-hidden"
                >
                  <div className="p-2">
                    <div className="text-xs text-gray-400 px-2 py-1 mb-1">
                      Panel Actions
                    </div>
                    {/* Content will be rendered by PanelDropdowns component */}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
        
        <div className="relative">
          <motion.button
            whileHover={{ 
              scale: canRemove ? 1.05 : 1,
              backgroundColor: canRemove ? 'rgba(239, 68, 68, 0.2)' : 'rgba(107, 114, 128, 0.2)'
            }}
            whileTap={{ scale: canRemove ? 0.95 : 1 }}
            onClick={onRemoveClick}
            disabled={!canRemove}
            className={`p-1 rounded transition-colors group ${
              canRemove 
                ? 'hover:bg-red-900/20 cursor-pointer' 
                : 'cursor-not-allowed opacity-50'
            }`}
            title={canRemove ? "Close Panel" : "Cannot close the last panel"}
          >
            {canRemove ? (
              <X className="w-4 h-4 text-gray-400 group-hover:text-red-400 transition-colors" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-gray-500" />
            )}
          </motion.button>

          <AnimatePresence>
            {showRemoveConfirm && canRemove && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -10 }}
                className="absolute top-full right-0 mt-1 w-48 bg-red-900/90 border border-red-600 rounded-lg shadow-xl z-50 p-3"
              >
                <p className="text-sm text-red-100 mb-2">Remove this panel?</p>
                <div className="flex space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onRemovePanel}
                    className="px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-xs text-white"
                  >
                    Remove
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onCancelRemove}
                    className="px-2 py-1 bg-gray-600 hover:bg-gray-700 rounded text-xs text-white"
                  >
                    Cancel
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};