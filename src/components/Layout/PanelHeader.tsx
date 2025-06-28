import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PanelType } from '../../types/project';
import { PanelTypeSelector } from './PanelTypeSelector';
import { panelConfig } from '../../config/panelConfig';
import type { BorderDir } from './hooks/areaDragUtils';
import { SplitSquareHorizontal, SplitSquareVertical, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, ChevronDown } from 'lucide-react';

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
  coverButtonRef,
  titleButtonRef,
  onSplitPanel,
}) => {
  // 현재 패널 타입의 설정 가져오기
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

  return (
    <div className="panel-header">
      <div className="flex items-center space-x-4 flex-1 min-w-0">
        {/* 패널 타입 선택기 */}
        <PanelTypeSelector
          currentType={type}
          onTypeChange={onTypeChange}
          className="flex-shrink-0"
        />

        {/* 패널 정보 */}
        <div className="text-left min-w-0 flex-1">
          <div className="panel-title truncate">
            {config.title}
          </div>
          <div className="panel-subtitle truncate">
            {config.description}
          </div>
        </div>
      </div>

      {/* 액션 버튼들 */}
      <div className="panel-actions">
        {/* 분할 버튼 영역 */}
        <div className="relative">
          <motion.button
            onClick={handleSplitButtonClick}
            className="panel-action-btn"
            title="패널 분할"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <SplitSquareHorizontal className="w-3.5 h-3.5" />
          </motion.button>

          {/* 분할 옵션 작은 팝업 */}
          <AnimatePresence>
            {showSplitOptions && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.9 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full right-0 mt-2 p-2 bg-surface shadow-outset rounded"
                style={{ zIndex: 1000 }}
                onMouseLeave={() => setShowSplitOptions(false)}
              >
                <motion.button
                  onClick={() => { onSplitPanel('vertical', 'empty'); setShowSplitOptions(false); }}
                  className="panel-action-btn mb-1"
                  title="가로 분할"
                >
                  <SplitSquareHorizontal className="w-4 h-4" />
                </motion.button>
                <motion.button
                  onClick={() => { onSplitPanel('horizontal', 'empty'); setShowSplitOptions(false); }}
                  className="panel-action-btn"
                  title="세로 분할"
                >
                  <SplitSquareVertical className="w-4 h-4" />
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 영역 덮기 버튼 */}
        {canRemove && (
          <div className="relative">
            <motion.button
              onClick={handleCoverButtonClick}
              className="panel-action-btn"
              title="영역 덮기 방향 선택"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </motion.button>

            {/* 덮기 방향 옵션 팝업 */}
            <AnimatePresence>
              {showCoverOptions && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.9 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full right-0 mt-2 p-2 bg-surface shadow-outset rounded"
                  style={{ zIndex: 100 }}
                  onMouseLeave={() => setShowCoverOptions(false)}
                >
                  <div className="grid grid-cols-3 grid-rows-3 gap-1 w-24 h-24">
                    {/* 상단 영역 */}
                    <motion.button
                      onClick={() => { onCover('top'); setShowCoverOptions(false); }}
                      className="panel-action-btn col-start-2 row-start-1"
                      title="위쪽 영역 덮기"
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </motion.button>
                    
                    {/* 좌측 영역 */}
                    <motion.button
                      onClick={() => { onCover('left'); setShowCoverOptions(false); }}
                      className="panel-action-btn col-start-1 row-start-2"
                      title="왼쪽 영역 덮기"
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                    </motion.button>
                    
                    {/* 우측 영역 */}
                    <motion.button
                      onClick={() => { onCover('right'); setShowCoverOptions(false); }}
                      className="panel-action-btn col-start-3 row-start-2"
                      title="오른쪽 영역 덮기"
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                    </motion.button>
                    
                    {/* 하단 영역 */}
                    <motion.button
                      onClick={() => { onCover('bottom'); setShowCoverOptions(false); }}
                      className="panel-action-btn col-start-2 row-start-3"
                      title="아래쪽 영역 덮기"
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};