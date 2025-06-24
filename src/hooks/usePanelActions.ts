import { PanelType, AreaConfig } from '../types/project';
import { useLayoutStore } from '../stores/layoutStore';
import { panelConfig } from '../config/panelConfig';

export const usePanelActions = (
  areaId: string | undefined,
  type: PanelType,
  areas: any[], // Area 시스템 사용
  setIsDropdownOpen: (open: boolean) => void,
  setIsActionsOpen: (open: boolean) => void,
  setShowRemoveConfirm: (show: boolean) => void
) => {
  const { changePanelType, splitArea, removeArea } = useLayoutStore();

  const totalPanels = areas.length; // Area 시스템에서는 단순히 배열 길이
  const canRemove = totalPanels > 1;

  // 현재 패널 타입을 제외한 모든 패널 (빈 패널 포함)
  const availablePanels = Object.entries(panelConfig).filter(([panelType]) => panelType !== type);

  const handlePanelChange = (newPanelType: PanelType) => {
    console.log('🔄 패널 변경 시도:', { areaId, currentType: type, newType: newPanelType });
    
    if (areaId && newPanelType !== type) {
      changePanelType(areaId, newPanelType);
      console.log('✅ 패널 변경 완료:', newPanelType);
    } else {
      console.warn('⚠️ 패널 변경 실패:', { areaId, newPanelType, currentType: type });
    }
    
    setIsDropdownOpen(false);
  };

  const handleSplitPanel = (direction: 'horizontal' | 'vertical', newPanelType: PanelType) => {
    console.log('🔀 패널 분할 시도:', { areaId, direction, newPanelType });
    
    if (areaId) {
      splitArea(areaId, direction, newPanelType);
      console.log('✅ 패널 분할 완료');
    } else {
      console.warn('⚠️ areaId가 없어서 분할할 수 없습니다');
    }
    
    setIsActionsOpen(false);
  };

  const handleRemovePanel = () => {
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
  };

  const handleRemoveClick = () => {
    if (!canRemove) {
      console.warn('⚠️ 제거 불가능한 패널');
      return;
    }
    
    console.log('🗑️ 패널 제거 확인 대화상자 표시');
    setShowRemoveConfirm(true);
    setTimeout(() => setShowRemoveConfirm(false), 3000);
  };

  return {
    canRemove,
    availablePanels,
    handlePanelChange,
    handleSplitPanel,
    handleRemovePanel,
    handleRemoveClick
  };
};