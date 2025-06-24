import React from 'react';
import { motion } from 'framer-motion';
import { PanelType } from '../../types/project';
import { panelConfig } from '../../config/panelConfig';

interface PanelHeaderProps {
  type: PanelType;
  isDropdownOpen: boolean;
  setIsDropdownOpen: (v: boolean) => void;
  isActionsOpen: boolean;
  setIsActionsOpen: (v: boolean) => void;
  canRemove: boolean;
  onRemoveClick: () => void;
  titleButtonRef: React.RefObject<HTMLButtonElement>;
  actionsButtonRef: React.RefObject<HTMLButtonElement>;
  removeButtonRef: React.RefObject<HTMLButtonElement>;
}

export const PanelHeader: React.FC<PanelHeaderProps> = ({
  type,
  isDropdownOpen,
  setIsDropdownOpen,
  isActionsOpen,
  setIsActionsOpen,
  canRemove,
  onRemoveClick,
  titleButtonRef,
  actionsButtonRef,
  removeButtonRef,
}) => {
  const config = panelConfig[type];
  const IconComponent = config.icon;

  return (
    <div className="neu-panel-header flex items-center justify-between flex-shrink-0">
      <div className="flex items-center space-x-3 flex-1">
        {/* 🎯 아이콘 클릭으로 패널 선택기 열기 */}
        <motion.button
          ref={titleButtonRef}
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="p-1.5 rounded-lg neu-shadow-1 cursor-pointer neu-interactive group"
          style={{ background: 'linear-gradient(145deg, var(--neu-base), var(--neu-accent))' }}
          title={`${config.title} - 클릭하여 패널 변경`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <IconComponent className="w-3.5 h-3.5 neu-text-accent group-hover:neu-text-primary transition-colors" />
        </motion.button>

        {/* 📝 간단한 패널 정보 표시 */}
        <div className="text-left">
          <div className="neu-body-primary text-xs">{config.title}</div>
          <div className="neu-caption text-xs opacity-70">{config.description}</div>
        </div>
      </div>

      <div className="flex items-center space-x-1">
        <motion.button
          ref={actionsButtonRef}
          onClick={() => setIsActionsOpen(!isActionsOpen)}
          className="neu-btn-icon p-1.5 cursor-pointer neu-interactive"
          title="패널 액션"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </motion.button>
        
        <motion.button
          ref={removeButtonRef}
          onClick={onRemoveClick}
          disabled={!canRemove}
          className={`neu-btn-icon p-1.5 ${canRemove ? 'cursor-pointer neu-interactive' : 'opacity-40 cursor-not-allowed'}`}
          title={canRemove ? "패널 닫기" : "마지막 패널은 닫을 수 없습니다"}
          whileHover={canRemove ? { scale: 1.05 } : {}}
          whileTap={canRemove ? { scale: 0.95 } : {}}
        >
          {canRemove ? (
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          )}
        </motion.button>
      </div>
    </div>
  );
};