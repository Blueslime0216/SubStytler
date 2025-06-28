import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHotkeys } from 'react-hotkeys-hook';
import { PanelType } from '../../types/project';
import { panelConfig } from '../../config/panelConfig';

interface PanelTypeSelectorProps {
  currentType: PanelType;
  onTypeChange: (newType: PanelType) => void;
  className?: string;
}

export const PanelTypeSelector: React.FC<PanelTypeSelectorProps> = ({
  currentType,
  onTypeChange,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const selectorRef = useRef<HTMLDivElement>(null);

  // Panel types list
  const panelTypes = Object.keys(panelConfig) as PanelType[];
  const currentIndex = panelTypes.indexOf(currentType);
  
  // Current panel configuration
  const currentConfig = panelConfig[currentType];
  const CurrentIcon = currentConfig.icon;

  // Initialize selected index when opening
  useEffect(() => {
    if (isOpen) {
      setSelectedIndex(currentIndex);
      setHoveredIndex(null);
    }
  }, [isOpen, currentIndex]);

  // Toggle selector
  const toggleSelector = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  // Handle panel selection
  const handlePanelSelect = useCallback((index: number) => {
    const selectedType = panelTypes[index];
    if (selectedType !== currentType) {
      onTypeChange(selectedType);
    }
    setIsOpen(false);
    setHoveredIndex(null);
  }, [currentType, onTypeChange, panelTypes]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        setSelectedIndex(prev => Math.max(0, prev - 1));
        setHoveredIndex(null);
        break;
      case 'ArrowRight':
        e.preventDefault();
        setSelectedIndex(prev => Math.min(panelTypes.length - 1, prev + 1));
        setHoveredIndex(null);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => Math.max(0, prev - 5)); // Move up a row (5 columns)
        setHoveredIndex(null);
        break;
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => Math.min(panelTypes.length - 1, prev + 5)); // Move down a row (5 columns)
        setHoveredIndex(null);
        break;
      case 'Enter':
        e.preventDefault();
        handlePanelSelect(selectedIndex);
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        break;
    }
  }, [isOpen, selectedIndex, panelTypes.length, handlePanelSelect]);

  // Handle mouse wheel navigation
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (!isOpen) return;
    e.preventDefault();

    const direction = e.deltaY > 0 ? 1 : -1;
    setSelectedIndex(prev => {
      const newIndex = prev + direction;
      return Math.max(0, Math.min(panelTypes.length - 1, newIndex));
    });
    setHoveredIndex(null);
  }, [isOpen, panelTypes.length]);

  // Outside click handler
  const handleOutsideClick = useCallback((e: MouseEvent) => {
    if (selectorRef.current && !selectorRef.current.contains(e.target as Node)) {
      setIsOpen(false);
    }
  }, []);

  // ESC key handler
  useHotkeys('escape', () => {
    if (isOpen) {
      setIsOpen(false);
    }
  }, [isOpen]);

  // Event listeners
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      return () => document.removeEventListener('mousedown', handleOutsideClick);
    }
  }, [isOpen, handleOutsideClick]);

  // Get display index (for keyboard navigation)
  const displayIndex = hoveredIndex !== null ? hoveredIndex : selectedIndex;

  return (
    <div ref={selectorRef} className={`relative ${className}`}>
      {/* Main selector button */}
      <motion.button
        onClick={toggleSelector}
        onKeyDown={handleKeyDown}
        className="panel-selector-button-enhanced"
        title={`${currentConfig.title} - Click to change panel type`}
        initial={false}
        animate={{
          width: isOpen ? 280 : 56,
          height: 56,
        }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        whileHover={{ 
          filter: 'brightness(1.05)',
          borderColor: 'var(--primary-color)'
        }}
        whileTap={{ scale: 0.98 }}
      >
        <AnimatePresence mode="wait">
          {!isOpen ? (
            // Closed state: show current panel icon
            <motion.div
              key="closed"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              className="flex items-center justify-center w-full h-full"
            >
              <CurrentIcon className="w-6 h-6 text-text-primary" />
            </motion.div>
          ) : (
            // Open state: show panel grid
            <motion.div
              key="open"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="panel-selector-grid-container"
              onWheel={handleWheel}
            >
              {/* Panel grid */}
              <div className="panel-selector-grid">
                {panelTypes.map((panelType, index) => {
                  const config = panelConfig[panelType];
                  const Icon = config.icon;
                  const isSelected = index === displayIndex;
                  const isCurrent = panelType === currentType;

                  return (
                    <motion.div
                      key={panelType}
                      className={`panel-selector-grid-item ${isSelected ? 'selected' : ''} ${isCurrent ? 'current' : ''}`}
                      onClick={() => handlePanelSelect(index)}
                      onMouseEnter={() => setHoveredIndex(index)}
                      onMouseLeave={() => setHoveredIndex(null)}
                      animate={{
                        scale: isSelected ? 1.1 : 1,
                        zIndex: isSelected ? 10 : 1,
                      }}
                      transition={{ duration: 0.2 }}
                      whileHover={{ scale: isSelected ? 1.15 : 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <div className={`panel-selector-icon-wrapper ${isSelected ? 'selected' : ''} ${isCurrent ? 'current' : ''}`}>
                        <Icon className="panel-selector-icon" />
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Selected panel info */}
              <motion.div
                className="panel-selector-info"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="panel-selector-info-title">
                  {panelConfig[panelTypes[displayIndex]]?.title || 'Unknown'}
                </div>
                <div className="panel-selector-info-description">
                  {panelConfig[panelTypes[displayIndex]]?.description || ''}
                </div>
              </motion.div>

              {/* Navigation hint */}
              <motion.div
                className="panel-selector-hint"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                Use arrow keys or scroll to navigate • Enter to select • Esc to close
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
};