import React from 'react';
import { motion } from 'framer-motion';
import { PanelType } from '../../types/project';
import { panelConfig } from '../../config/panelConfig';
import type { BorderDir } from './hooks/areaDragUtils';

interface PanelHeaderProps {
  type: PanelType;
  isDropdownOpen: boolean;
  setIsDropdownOpen: (v: boolean) => void;
  isActionsOpen: boolean;
  setIsActionsOpen: (v: boolean) => void;
  canRemove: boolean;
  onCover: (dir: BorderDir) => void;
  titleButtonRef: React.RefObject<HTMLButtonElement>;
  actionsButtonRef: React.RefObject<HTMLButtonElement>;
  coverButtonRef?: React.RefObject<HTMLDivElement>;
}

export const PanelHeader: React.FC<PanelHeaderProps> = ({
  type,
  isDropdownOpen,
  setIsDropdownOpen,
  isActionsOpen,
  setIsActionsOpen,
  canRemove,
  onCover,
  titleButtonRef,
  actionsButtonRef,
  coverButtonRef,
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

      {/* 🛠️ 액션 / 덮기 버튼들 */}
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
        
        {/* 🔄 덮기(제거) 방향 버튼 그룹 */}
        {canRemove && (
          <div
            ref={coverButtonRef}
            className="grid grid-cols-3 grid-rows-3 gap-0.5 select-none"
            style={{ width: '44px', height: '44px' }}
          >
            {['top', 'left', 'right', 'bottom'].map(dir => {
              // 좌표 매핑: 가운데 칸 비움
              const positionStyle: Record<string, React.CSSProperties> = {
                top: { gridColumn: '2', gridRow: '1' },
                left: { gridColumn: '1', gridRow: '2' },
                right: { gridColumn: '3', gridRow: '2' },
                bottom: { gridColumn: '2', gridRow: '3' },
              } as const;

              const iconPaths: Record<string, string> = {
                top: 'M12 6l-4 4h8l-4-4z',
                bottom: 'M12 18l4-4H8l4 4z',
                left: 'M6 12l4 4V8l-4 4z',
                right: 'M18 12l-4-4v8l4-4z',
              } as const;

              return (
                <motion.button
                  key={dir}
                  onClick={() => onCover(dir as BorderDir)}
                  className="neu-btn-icon p-1 neu-interactive flex items-center justify-center"
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    ...positionStyle[dir],
                    borderRadius: '6px',
                    background: 'var(--neu-base)',
                    boxShadow: `4px 4px 8px rgba(13,17,23,0.4), -2px -2px 6px rgba(45,55,72,0.3)`
                  }}
                >
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                    <path d={iconPaths[dir]} />
                  </svg>
                </motion.button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};