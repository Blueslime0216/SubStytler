import React, { useState, useRef } from 'react';
import { PanelType } from '../../types/project';
import { useLayoutStore } from '../../stores/layoutStore';
import { PanelBody } from './PanelBody';
import { PanelDropdown } from './PanelDropdown';
import { PanelActionsDropdown } from './PanelActionsDropdown';
import { PanelRemoveConfirmation } from './PanelRemoveConfirmation';
import { usePanelActions } from '../../hooks/usePanelActions';
import { panelConfig } from '../../config/panelConfig';
import { PanelHeader } from './PanelHeader';

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
    <div
      className={`neu-panel flex flex-col h-full ${className}`}
      style={{
        // 🔧 모든 애니메이션 완전 비활성화
        transition: 'none !important',
        animation: 'none !important',
        // 🔧 하드웨어 가속
        transform: 'translate3d(0, 0, 0)',
        backfaceVisibility: 'hidden',
      }}
    >
      <PanelHeader
        type={type}
        isDropdownOpen={isDropdownOpen}
        setIsDropdownOpen={setIsDropdownOpen}
        isActionsOpen={isActionsOpen}
        setIsActionsOpen={setIsActionsOpen}
        canRemove={canRemove}
        onRemoveClick={onRemoveClick}
        titleButtonRef={titleButtonRef}
        actionsButtonRef={actionsButtonRef}
        removeButtonRef={removeButtonRef}
      />
      {/* Panel Content */}
      <PanelBody type={type} />

      {/* Dropdowns */}
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
    </div>
  );
};