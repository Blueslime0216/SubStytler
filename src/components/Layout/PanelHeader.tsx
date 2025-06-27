import React, { useState } from 'react';
import { PanelType } from '../../types/project';
import { PanelTypeSelector } from './PanelTypeSelector';
import { panelConfig } from '../../config/panelConfig';
import type { BorderDir } from './hooks/areaDragUtils';
import { 
  SplitSquareHorizontal, 
  SplitSquareVertical, 
  ArrowUp, 
  ArrowDown, 
  ArrowLeft, 
  ArrowRight, 
  MoreHorizontal 
} from 'lucide-react';

interface PanelHeaderProps {
  type: PanelType;
  isActionsOpen: boolean;
  setIsActionsOpen: (v: boolean) => void;
  canRemove: boolean;
  onCover: (dir: BorderDir) => void;
  onTypeChange: (newType: PanelType) => void;
  titleButtonRef: React.RefObject<HTMLButtonElement>;
  actionsButtonRef: React.RefObject<HTMLButtonElement>;
  coverButtonRef?: React.RefObject<HTMLDivElement>;
  onSplitPanel: (direction: 'horizontal' | 'vertical', newPanelType: PanelType) => void;
}

export const PanelHeader: React.FC<PanelHeaderProps> = ({
  type,
  isActionsOpen,
  setIsActionsOpen,
  canRemove,
  onCover,
  onTypeChange,
  actionsButtonRef,
  onSplitPanel,
}) => {
  const config = panelConfig[type];
  const [showSplitOptions, setShowSplitOptions] = useState(false);
  const [showCoverOptions, setShowCoverOptions] = useState(false);

  const handleSplitButtonClick = () => {
    setShowSplitOptions(!showSplitOptions);
    setShowCoverOptions(false);
  };

  const handleCoverButtonClick = () => {
    setShowCoverOptions(!showCoverOptions);
    setShowSplitOptions(false);
  };

  const handleSplitAction = (direction: 'horizontal' | 'vertical') => {
    onSplitPanel(direction, 'empty');
    setShowSplitOptions(false);
  };

  const handleCoverAction = (dir: BorderDir) => {
    onCover(dir);
    setShowCoverOptions(false);
  };

  return (
    <div className="panel-header">
      <div className="flex items-center space-x-3 flex-1 min-w-0">
        <PanelTypeSelector
          currentType={type}
          onTypeChange={onTypeChange}
          className="flex-shrink-0"
        />

        <div className="text-left min-w-0 flex-1">
          <div className="panel-title truncate">
            {config.title}
          </div>
          <div className="panel-subtitle truncate">
            {config.description}
          </div>
        </div>
      </div>

      <div className="panel-actions">
        {/* Split Button */}
        <div className="relative">
          <button
            onClick={handleSplitButtonClick}
            className="panel-action-btn"
            title="Split panel"
          >
            <SplitSquareHorizontal className="w-3.5 h-3.5" />
          </button>

          {showSplitOptions && (
            <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 p-1">
              <button
                onClick={() => handleSplitAction('vertical')}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-gray-50 rounded"
                title="Split horizontally"
              >
                <SplitSquareHorizontal className="w-4 h-4" />
                Horizontal
              </button>
              <button
                onClick={() => handleSplitAction('horizontal')}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-gray-50 rounded"
                title="Split vertically"
              >
                <SplitSquareVertical className="w-4 h-4" />
                Vertical
              </button>
            </div>
          )}
        </div>

        {/* Cover Button */}
        {canRemove && (
          <div className="relative">
            <button
              onClick={handleCoverButtonClick}
              className="panel-action-btn"
              title="Cover adjacent area"
            >
              <MoreHorizontal className="w-3.5 h-3.5" />
            </button>

            {showCoverOptions && (
              <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                <div className="grid grid-cols-3 grid-rows-3 gap-1 p-2 w-24 h-24">
                  <button
                    onClick={() => handleCoverAction('top')}
                    className="col-start-2 row-start-1 panel-action-btn"
                    title="Cover top area"
                  >
                    <ArrowUp className="w-3 h-3" />
                  </button>
                  
                  <button
                    onClick={() => handleCoverAction('left')}
                    className="col-start-1 row-start-2 panel-action-btn"
                    title="Cover left area"
                  >
                    <ArrowLeft className="w-3 h-3" />
                  </button>
                  
                  <button
                    onClick={() => handleCoverAction('right')}
                    className="col-start-3 row-start-2 panel-action-btn"
                    title="Cover right area"
                  >
                    <ArrowRight className="w-3 h-3" />
                  </button>
                  
                  <button
                    onClick={() => handleCoverAction('bottom')}
                    className="col-start-2 row-start-3 panel-action-btn"
                    title="Cover bottom area"
                  >
                    <ArrowDown className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};