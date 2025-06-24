import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
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
  children?: React.ReactNode;
}

const PanelComponent: React.FC<PanelProps> = ({ type, className = '', areaId, children }) => {
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

  // 🔧 성능 최적화: 이벤트 핸들러 메모이제이션
  const onPanelChange = React.useCallback((newPanelType: PanelType) => {
    handlePanelChange(newPanelType);
    setIsDropdownOpen(false);
  }, [handlePanelChange]);

  const onSplitPanel = React.useCallback((direction: 'horizontal' | 'vertical', newPanelType: PanelType) => {
    handleSplitPanel(direction, newPanelType);
    setIsActionsOpen(false);
  }, [handleSplitPanel]);

  const onRemovePanel = React.useCallback(() => {
    handleRemovePanel();
    setShowRemoveConfirm(false);
  }, [handleRemovePanel]);

  const onRemoveClick = React.useCallback(() => {
    if (!canRemove) return;
    handleRemoveClick();
  }, [canRemove, handleRemoveClick]);

  return (
    <motion.div
      className={`neu-panel ${className}`}
      initial={{ opacity: 1, scale: 1 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.15, ease: 'easeOut' }} // 🔧 더 빠른 애니메이션
      // 🔧 성능 최적화: 레이아웃 최적화
      style={{
        contain: 'layout style',
        willChange: 'auto'
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

      {/* Dropdowns - 조건부 렌더링으로 성능 최적화 */}
      {isDropdownOpen && (
        <PanelDropdown
          isOpen={isDropdownOpen}
          onClose={() => setIsDropdownOpen(false)}
          triggerRef={titleButtonRef}
          availablePanels={availablePanels}
          onPanelChange={onPanelChange}
        />
      )}

      {isActionsOpen && (
        <PanelActionsDropdown
          isOpen={isActionsOpen}
          onClose={() => setIsActionsOpen(false)}
          triggerRef={actionsButtonRef}
          onSplitPanel={onSplitPanel}
        />
      )}

      {showRemoveConfirm && canRemove && (
        <PanelRemoveConfirmation
          isOpen={showRemoveConfirm}
          onClose={() => setShowRemoveConfirm(false)}
          onConfirm={onRemovePanel}
          triggerRef={removeButtonRef}
        />
      )}
    </motion.div>
  );
};

// 🔧 성능 최적화: React.memo로 감싸서 불필요한 리렌더링 방지 + 더 정교한 비교
export const Panel = React.memo(PanelComponent, (prevProps, nextProps) => {
  // 🔧 패널 타입과 areaId가 같으면 리렌더링 방지
  return prevProps.type === nextProps.type && 
         prevProps.areaId === nextProps.areaId &&
         prevProps.className === nextProps.className;
});