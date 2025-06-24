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

  // 🔧 성능 최적화: 메모이제이션된 이벤트 핸들러
  const handlePanelChange = useCallback((newPanelType: PanelType) => {
    console.log('🔄 패널 변경 시도:', { areaId, currentType: type, newType: newPanelType });
    
    if (areaId && newPanelType !== type) {
      changePanelType(areaId, newPanelType);
      console.log('✅ 패널 변경 완료:', newPanelType);
    } else {
      console.warn('⚠️ 패널 변경 실패:', { areaId, newPanelType, currentType: type });
    }
    
    setIsDropdownOpen(false);
  }, [areaId, type, changePanelType, setIsDropdownOpen]);

  const handleSplitPanel = useCallback((direction: 'horizontal' | 'vertical', newPanelType: PanelType) => {
    console.log('🔀 패널 분할 시도:', { areaId, direction, newPanelType });
    
    if (areaId) {
      splitArea(areaId, direction, newPanelType);
      console.log('✅ 패널 분할 완료');
    } else {
      console.warn('⚠️ areaId가 없어서 분할할 수 없습니다');
    }
    
    setIsActionsOpen(false);
  }, [areaId, splitArea, setIsActionsOpen]);

  const handleRemovePanel = useCallback(() => {
    console.log('🗑️ 패널 제거 시도:', { areaId, canRemove });
    
    if (!canRemove) {
      console.warn('⚠️ 마지막 패널은 제거할 수 없습니다');
      setShowRemoveConfirm(false);
      return;
    }

    if (areaId) {
      removeArea(areaId);
      console.log('✅ 패널 제거 완료');
    }
    
    setIsActionsOpen(false);
    setShowRemoveConfirm(false);
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