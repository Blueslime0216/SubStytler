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
        {/* 🎯 심플한 뉴모피즘 패널 선택 버튼 */}
        <motion.button
          ref={titleButtonRef}
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="neu-btn-icon p-2 cursor-pointer neu-interactive"
          title={`${config.title} - 클릭하여 패널 변경`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            borderRadius: '12px',
            background: isDropdownOpen
              ? 'linear-gradient(145deg, var(--neu-accent), var(--neu-surface))'
              : 'var(--neu-base)',
            boxShadow: isDropdownOpen
              ? `
                  inset 3px 3px 8px rgba(13, 17, 23, 0.6),
                  inset -1px -1px 6px rgba(45, 55, 72, 0.4)
                `
              : `
                  4px 4px 12px rgba(13, 17, 23, 0.6),
                  -2px -2px 8px rgba(45, 55, 72, 0.4)
                `,
            transition: 'all 0.2s ease',
          }}
        >
          <motion.div
            animate={{ 
              rotate: isDropdownOpen ? 180 : 0,
            }}
            transition={{ 
              duration: 0.2,
              ease: "easeInOut"
            }}
          >
            <IconComponent 
              className={`w-4 h-4 ${
                isDropdownOpen ? 'neu-text-primary' : 'neu-text-secondary'
              } transition-colors duration-200`} 
            />
          </motion.div>
        </motion.button>

        {/* 📝 패널 정보 */}
        <div className="text-left">
          <div className="neu-body-primary text-xs font-semibold">
            {config.title}
          </div>
          <div className="neu-caption text-xs opacity-70">
            {config.description}
          </div>
        </div>
      </div>

      {/* 🛠️ 액션 버튼들 */}
      <div className="flex items-center space-x-2">
        {/* ➕ 분할 버튼 */}
        <motion.button
          ref={actionsButtonRef}
          onClick={() => setIsActionsOpen(!isActionsOpen)}
          className="neu-btn-icon p-2 cursor-pointer neu-interactive"
          title="패널 분할"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            borderRadius: '10px',
            background: isActionsOpen
              ? 'linear-gradient(145deg, var(--neu-accent), var(--neu-surface))'
              : 'var(--neu-base)',
            boxShadow: isActionsOpen
              ? `
                  inset 3px 3px 8px rgba(13, 17, 23, 0.6),
                  inset -1px -1px 6px rgba(45, 55, 72, 0.4)
                `
              : `
                  4px 4px 12px rgba(13, 17, 23, 0.6),
                  -2px -2px 8px rgba(45, 55, 72, 0.4)
                `,
            transition: 'all 0.2s ease',
          }}
        >
          <motion.svg 
            className="w-3.5 h-3.5" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            animate={{ rotate: isActionsOpen ? 45 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </motion.svg>
        </motion.button>
        
        {/* ❌ 제거 버튼 */}
        <motion.button
          ref={removeButtonRef}
          onClick={onRemoveClick}
          disabled={!canRemove}
          className={`neu-btn-icon p-2 ${canRemove ? 'cursor-pointer neu-interactive' : 'opacity-40 cursor-not-allowed'}`}
          title={canRemove ? "패널 닫기" : "마지막 패널은 닫을 수 없습니다"}
          whileHover={canRemove ? { scale: 1.05 } : {}}
          whileTap={canRemove ? { scale: 0.95 } : {}}
          style={{
            borderRadius: '10px',
            background: canRemove ? 'var(--neu-base)' : 'var(--neu-dark)',
            boxShadow: canRemove
              ? `
                  4px 4px 12px rgba(13, 17, 23, 0.6),
                  -2px -2px 8px rgba(45, 55, 72, 0.4)
                `
              : 'none',
            transition: 'all 0.2s ease',
          }}
        >
          {canRemove ? (
            <motion.svg 
              className="w-3.5 h-3.5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              whileHover={{ rotate: 90 }}
              transition={{ duration: 0.2 }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </motion.svg>
          ) : (
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          )}
        </motion.button>
      </div>
    </div>
  );
};