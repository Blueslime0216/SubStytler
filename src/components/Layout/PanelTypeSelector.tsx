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
    <div ref={selectorRef} className={`relative ${className}`}>
      <button
        onClick={toggleSelector}
        className="flex items-center gap-2 px-3 py-1.5 bg-surface border border-border rounded shadow-outset hover:shadow-hover transition-all text-sm font-medium text-text-primary"
        title={`${currentConfig.title} - Click to change panel type`}
      >
        <CurrentIcon className="w-4 h-4" />
        <span>{currentConfig.title}</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 min-w-48 bg-surface border border-border-strong rounded-lg shadow-outset-strong z-50 overflow-hidden">
          {Object.entries(panelConfig).map(([panelType, config]) => {
            const Icon = config.icon;
            const isSelected = panelType === currentType;
            
            return (
              <button
                key={panelType}
                onClick={() => handleOptionClick(panelType as PanelType)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-surface-elevated transition-colors ${
                  isSelected ? 'bg-primary bg-opacity-10 text-primary' : 'text-text-primary'
                }`}
                title={config.description}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{config.title}</div>
                  <div className="text-xs text-text-secondary">{config.description}</div>
                </div>
                {isSelected && (
                  <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};