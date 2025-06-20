import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { PanelType } from '../../types/project';
import { useLayoutStore } from '../../stores/layoutStore';
import { PanelContent } from './PanelContent';
import { PanelDropdown } from './PanelDropdown';
import { PanelActionsDropdown } from './PanelActionsDropdown';
import { PanelRemoveConfirmation } from './PanelRemoveConfirmation';
import { usePanelActions } from '../../hooks/usePanelActions';
import { panelConfig } from '../../config/panelConfig';

interface PanelProps {
  type: PanelType;
  className?: string;
  areaId?: string;
}

export const Panel: React.FC<PanelProps> = ({ type, className = '', areaId }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  
  const titleButtonRef = useRef<HTMLButtonElement>(null);
  const actionsButtonRef = useRef<HTMLButtonElement>(null);
  const removeButtonRef = useRef<HTMLButtonElement>(null);
  
  const { areas } = useLayoutStore();
  const {
    canRemove,
    availablePanels,
    handlePanelChange,
    handleSplitPanel,
    handleRemovePanel,
    handleRemoveClick
  } = usePanelActions(areaId, type, areas, setIsDropdownOpen, setIsActionsOpen, setShowRemoveConfirm);

  const config = panelConfig[type];
  const IconComponent = config.icon;

  const onPanelChange = (newPanelType: PanelType) => {
    handlePanelChange(newPanelType);
    setIsDropdownOpen(false);
  };

  const onSplitPanel = (direction: 'horizontal' | 'vertical', newPanelType: PanelType) => {
    handleSplitPanel(direction, newPanelType);
    setIsActionsOpen(false);
  };

  const onRemovePanel = () => {
    handleRemovePanel();
    setShowRemoveConfirm(false);
  };

  const onRemoveClick = () => {
    if (!canRemove) return;
    handleRemoveClick();
  };

  return (
    <motion.div
      className={`panel-container flex flex-col ${className}`}
      initial={{ opacity: 0, scale: 0.98, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {/* Enhanced Panel Header */}
      <div className="panel-header flex items-center justify-between">
        <div className="flex items-center space-x-4 flex-1">
          {/* Icon Container */}
          <motion.div 
            className="p-2.5 rounded-xl bg-surface border border-accent/20"
            whileHover={{ scale: 1.05, backgroundColor: 'var(--bg-hover)' }}
          >
            <IconComponent className="w-5 h-5 text-accent" />
          </motion.div>
          
          {/* Panel Title & Selector */}
          <motion.button
            ref={titleButtonRef}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center space-x-3 group"
          >
            <div className="text-left">
              <div className="heading-secondary">{config.title}</div>
              <div className="caption">{config.description}</div>
            </div>
            <motion.svg 
              className="w-4 h-4 text-muted"
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              animate={{ rotate: isDropdownOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </motion.svg>
          </motion.button>
        </div>
        
        {/* Panel Actions */}
        <div className="flex items-center space-x-2">
          {/* Actions Button */}
          <motion.button
            ref={actionsButtonRef}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsActionsOpen(!isActionsOpen)}
            className="btn-icon"
            title="Panel Actions"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </motion.button>
          
          {/* Remove Button */}
          <motion.button
            ref={removeButtonRef}
            whileHover={{ 
              scale: canRemove ? 1.05 : 1,
              backgroundColor: canRemove ? 'rgba(239, 68, 68, 0.15)' : undefined
            }}
            whileTap={{ scale: canRemove ? 0.95 : 1 }}
            onClick={onRemoveClick}
            disabled={!canRemove}
            className={`btn-icon ${
              canRemove 
                ? 'hover:border-error hover:text-error' 
                : 'opacity-40 cursor-not-allowed'
            }`}
            title={canRemove ? "Close Panel" : "Cannot close the last panel"}
          >
            {canRemove ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            )}
          </motion.button>
        </div>
      </div>
      
      {/* Panel Content */}
      <PanelContent type={type} />

      {/* Enhanced Dropdowns */}
      <PanelDropdown
        isOpen={isDropdownOpen}
        onClose={() => setIsDropdownOpen(false)}
        triggerRef={titleButtonRef}
        availablePanels={availablePanels}
        onPanelChange={onPanelChange}
      />

      <PanelActionsDropdown
        isOpen={isActionsOpen}
        onClose={() => setIsActionsOpen(false)}
        triggerRef={actionsButtonRef}
        onSplitPanel={onSplitPanel}
      />

      <PanelRemoveConfirmation
        isOpen={showRemoveConfirm && canRemove}
        onClose={() => setShowRemoveConfirm(false)}
        onConfirm={onRemovePanel}
        triggerRef={removeButtonRef}
      />
    </motion.div>
  );
};