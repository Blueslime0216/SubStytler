import React, { useState, useCallback, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
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
  const selectorRef = useRef<HTMLDivElement>(null);

  const currentConfig = panelConfig[currentType];
  const CurrentIcon = currentConfig.icon;

  const toggleSelector = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const handleOptionClick = useCallback((panelType: PanelType) => {
    onTypeChange(panelType);
    setIsOpen(false);
  }, [onTypeChange]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectorRef.current && !selectorRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  return (
    <div ref={selectorRef} className={`panel-type-selector ${className}`}>
      <button
        onClick={toggleSelector}
        className="panel-type-button"
        title={`${currentConfig.title} - Click to change panel type`}
      >
        <CurrentIcon className="w-4 h-4" />
        <span className="font-medium">{currentConfig.title}</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="panel-type-dropdown">
          {Object.entries(panelConfig).map(([panelType, config]) => {
            const Icon = config.icon;
            const isSelected = panelType === currentType;
            
            return (
              <button
                key={panelType}
                onClick={() => handleOptionClick(panelType as PanelType)}
                className={`panel-type-option ${isSelected ? 'selected' : ''}`}
                title={config.description}
              >
                <Icon className="w-4 h-4" />
                <div className="flex-1 text-left">
                  <div className="font-medium">{config.title}</div>
                  <div className="text-xs opacity-75">{config.description}</div>
                </div>
                {isSelected && (
                  <div className="w-2 h-2 bg-current rounded-full opacity-75" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};