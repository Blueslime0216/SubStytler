import { PanelType, AreaConfig } from '../types/project';
import { useLayoutStore } from '../stores/layoutStore';
import { panelConfig } from '../config/panelConfig';
import { useMemo, useCallback } from 'react';

export const usePanelActions = (
  areaId: string | undefined,
  type: PanelType,
  areas: any[], // Area 시스템 사용
  setIsDropdownOpen: (open: boolean) => void,
  setIsActionsOpen: (open: boolean) => void,
  setShowRemoveConfirm: (show: boolean) => void
) => {
  const { changePanelType, splitArea, removeArea } = useLayoutStore();

  // 🔧 성능 최적화: 메모이제이션된 계산
  const { totalPanels, canRemove, availablePanels } = useMemo(() => {
    const totalPanels = areas.length;
    const canRemove = totalPanels > 1;
    const availablePanels = Object.entries(panelConfig).filter(([panelType]) => panelType !== type);
    
    return { totalPanels, canRemove, availablePanels };
  }, [areas.length, type]);

  // 🔧 패널 변경 핸들러 - 완전히 수정
  const handlePanelChange = useCallback((newPanelType: PanelType) => {
    console.log('🔄 패널 변경 요청:', { areaId, currentType: type, newType: newPanelType });
    
    if (!areaId) {
      console.error('❌ areaId가 없습니다');
      return;
    }
    
    if (newPanelType === type) {
      console.log('⚠️ 동일한 패널 타입으로 변경 시도');
      setIsDropdownOpen(false);
      return;
    }
    
    try {
      changePanelType(areaId, newPanelType);
      console.log('✅ 패널 변경 성공:', newPanelType);
      setIsDropdownOpen(false);
    } catch (error) {
      console.error('❌ 패널 변경 실패:', error);
    }
  }, [areaId, type, changePanelType, setIsDropdownOpen]);

  // 🔧 패널 분할 핸들러 - 완전히 수정
  const handleSplitPanel = useCallback((direction: 'horizontal' | 'vertical', newPanelType: PanelType) => {
    console.log('🔀 패널 분할 요청:', { areaId, direction, newPanelType });
    
    if (!areaId) {
      console.error('❌ areaId가 없어서 분할할 수 없습니다');
      return;
    }
    
    try {
      splitArea(areaId, direction, newPanelType);
      console.log('✅ 패널 분할 성공');
      setIsActionsOpen(false);
    } catch (error) {
      console.error('❌ 패널 분할 실패:', error);
    }
  }, [areaId, splitArea, setIsActionsOpen]);

  const handleRemovePanel = useCallback(() => {
    console.log('🗑️ 패널 제거 시도:', { areaId, canRemove });
    
    if (!canRemove) {
      console.warn('⚠️ 마지막 패널은 제거할 수 없습니다');
      setShowRemoveConfirm(false);
      return;
    }

    if (!areaId) {
      console.error('❌ areaId가 없어서 제거할 수 없습니다');
      return;
    }

    try {
      removeArea(areaId);
      console.log('✅ 패널 제거 성공');
      setIsActionsOpen(false);
      setShowRemoveConfirm(false);
    } catch (error) {
      console.error('❌ 패널 제거 실패:', error);
    }
  }, [areaId, canRemove, removeArea, setIsActionsOpen, setShowRemoveConfirm]);

  const handleRemoveClick = useCallback(() => {
    if (!canRemove) {
      console.warn('⚠️ 제거 불가능한 패널');
      return;
    }
    
    console.log('🗑️ 패널 제거 확인 대화상자 표시');
    setShowRemoveConfirm(true);
    setTimeout(() => setShowRemoveConfirm(false), 3000);
  }, [canRemove, setShowRemoveConfirm]);

  return {
    canRemove,
    availablePanels,
    handlePanelChange,
    handleSplitPanel,
    handleRemovePanel,
    handleRemoveClick
  };
};