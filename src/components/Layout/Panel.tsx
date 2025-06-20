import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Cog, Wrench, X, AlertTriangle } from 'lucide-react';
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
      className={`panel-steampunk flex flex-col ${className} relative`}
      initial={{ opacity: 0, scale: 0.98, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {/* 장식용 리벳들 */}
      <div className="rivet-decoration top-2 left-2"></div>
      <div className="rivet-decoration top-2 right-2"></div>
      
      {/* 패널 헤더 */}
      <div className="panel-header-steampunk flex items-center justify-between relative">
        {/* 장식용 기어 */}
        <div className="absolute top-1 left-2">
          <Cog className="w-2 h-2 text-brass gear-slow opacity-40" />
        </div>
        
        <div className="flex items-center space-x-3 flex-1 relative z-10">
          {/* 아이콘 컨테이너 */}
          <motion.div 
            className="p-1.5 rounded-lg bg-brass border border-brass-dark relative overflow-hidden"
            whileHover={{ scale: 1.05 }}
          >
            <IconComponent className="w-3 h-3 text-workshop" />
            <div className="absolute inset-0 texture-metal opacity-30"></div>
          </motion.div>
          
          {/* 패널 제목 & 선택기 */}
          <motion.button
            ref={titleButtonRef}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center space-x-2 group"
          >
            <div className="text-left">
              <div className="font-steampunk text-sm font-medium text-primary">{config.title}</div>
              <div className="font-mono text-xs text-muted">{config.description}</div>
            </div>
            <motion.svg 
              className="w-3 h-3 text-muted"
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
        
        {/* 패널 액션들 */}
        <div className="flex items-center space-x-1 relative z-10">
          {/* 액션 버튼 */}
          <motion.button
            ref={actionsButtonRef}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsActionsOpen(!isActionsOpen)}
            className="btn-steampunk-icon p-1"
            title="Panel Actions"
          >
            <Wrench className="w-3 h-3" />
          </motion.button>
          
          {/* 제거 버튼 */}
          <motion.button
            ref={removeButtonRef}
            whileHover={{ 
              scale: canRemove ? 1.05 : 1,
            }}
            whileTap={{ scale: canRemove ? 0.95 : 1 }}
            onClick={onRemoveClick}
            disabled={!canRemove}
            className={`btn-steampunk-icon p-1 ${
              canRemove 
                ? 'hover:bg-red-600 hover:border-red-500' 
                : 'opacity-40 cursor-not-allowed'
            }`}
            title={canRemove ? "Close Panel" : "Cannot close the last panel"}
          >
            {canRemove ? (
              <X className="w-3 h-3" />
            ) : (
              <AlertTriangle className="w-3 h-3" />
            )}
          </motion.button>
        </div>
        
        {/* 장식용 파이프 */}
        <div className="pipe-decoration top-0 right-16 w-8 h-1"></div>
      </div>
      
      {/* 패널 콘텐츠 */}
      <div className="flex-1 overflow-hidden relative">
        <PanelContent type={type} />
        
        {/* 하단 리벳들 */}
        <div className="rivet-decoration bottom-2 left-2"></div>
        <div className="rivet-decoration bottom-2 right-2"></div>
      </div>

      {/* 드롭다운들 */}
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