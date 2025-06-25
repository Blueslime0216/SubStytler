import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PanelType } from '../../types/project';
import { useLayoutStore } from '../../stores/layoutStore';
import { PanelBody } from './PanelBody';
import { usePanelActions } from '../../hooks/usePanelActions';
import { PanelHeader } from './PanelHeader';
import { extractPanelType } from '../../config/panelRegistry';
import { BorderDir } from './hooks/areaDragUtils';

interface PanelProps {
  type?: PanelType;
  className?: string;
  areaId?: string;
  children?: React.ReactNode;
}

const PanelComponent: React.FC<PanelProps> = ({ type, className = '', areaId, children }) => {
  // 🎯 패널 타입 결정 - areaId에서 추출하거나 전달받은 type 사용
  const actualType = type || (areaId ? extractPanelType(areaId) : 'empty');
  
  const [isActionsOpen, setIsActionsOpen] = useState(false);
  
  const titleButtonRef = useRef<HTMLButtonElement>(null);
  const actionsButtonRef = useRef<HTMLButtonElement>(null);
  
  const { areas, changePanelType, setFocusedArea } = useLayoutStore();
  const {
    canRemove,
    availablePanels,
    handleSplitPanel,
  } = usePanelActions(areaId, actualType, areas, () => {}, setIsActionsOpen, () => {});

  // 덮기(제거) 기능
  const coverArea = useLayoutStore(state => state.coverArea);

  const handleCoverPanel = React.useCallback((dir: BorderDir) => {
    if (!areaId || !canRemove) return;
    coverArea(areaId, dir);
  }, [areaId, canRemove, coverArea]);

  // 🎯 패널 타입 변경 핸들러 - 로직 개선
  const handleTypeChange = React.useCallback((newPanelType: PanelType) => {
    console.log('🔄 패널 타입 변경 요청:', { 
      areaId, 
      currentType: actualType, 
      newType: newPanelType 
    });
    
    if (!areaId) {
      console.warn('⚠️ areaId가 없어서 패널 변경할 수 없습니다');
      return;
    }
    
    if (newPanelType !== actualType) {
      try {
        changePanelType(areaId, newPanelType);
        console.log('✅ 패널 변경 완료:', { 
          areaId, 
          from: actualType, 
          to: newPanelType 
        });
      } catch (error) {
        console.error('❌ 패널 변경 실패:', error);
      }
    } else {
      console.log('ℹ️ 동일한 패널 타입이므로 변경하지 않음');
    }
  }, [areaId, actualType, changePanelType]);

  console.log('🎨 Panel 렌더링:', {
    areaId,
    providedType: type,
    actualType,
    configFound: true
  });

  // 패널이 마운트되거나 areaId 변경 시 포커스 설정
  useEffect(() => {
    if (areaId) {
      setFocusedArea(areaId);
    }

    return () => {
      if (areaId && useLayoutStore.getState().focusedAreaId === areaId) {
        setFocusedArea(null);
      }
    };
  }, [areaId, setFocusedArea]);

  const onSplitPanel = React.useCallback((direction: 'horizontal' | 'vertical', newPanelType: PanelType) => {
    console.log('🔀 패널 분할 요청:', { areaId, direction, newPanelType });
    handleSplitPanel(direction, newPanelType);
    setIsActionsOpen(false);
  }, [handleSplitPanel, areaId]);

  return (
    <motion.div
      className={`neu-panel ${className}`}
      initial={{ opacity: 1, scale: 1 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      style={{
        contain: 'layout style',
        willChange: 'auto'
      }}
      onClick={() => areaId && setFocusedArea(areaId)}
    >
      <PanelHeader
        type={actualType}
        isActionsOpen={isActionsOpen}
        setIsActionsOpen={setIsActionsOpen}
        canRemove={canRemove}
        onCover={handleCoverPanel}
        onTypeChange={handleTypeChange}
        titleButtonRef={titleButtonRef}
        actionsButtonRef={actionsButtonRef}
        coverButtonRef={undefined}
        onSplitPanel={onSplitPanel}
      />
      
      {/* Panel Content */}
      <PanelBody type={actualType} />
    </motion.div>
  );
};

// 🔧 성능 최적화: React.memo로 감싸서 불필요한 리렌더링 방지 + 더 정교한 비교
export const Panel = React.memo(PanelComponent, (prevProps, nextProps) => {
  // 🔧 패널 타입과 areaId가 같으면 리렌더링 방지
  const prevType = prevProps.type || (prevProps.areaId ? extractPanelType(prevProps.areaId) : 'empty');
  const nextType = nextProps.type || (nextProps.areaId ? extractPanelType(nextProps.areaId) : 'empty');
  
  return prevType === nextType && 
         prevProps.areaId === nextProps.areaId &&
         prevProps.className === nextProps.className;
});