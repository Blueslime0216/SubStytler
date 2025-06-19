import { PanelType, AreaConfig } from '../types/project';
import { useLayoutStore } from '../stores/layoutStore';
import { panelConfig } from '../config/panelConfig';
import { countPanels } from '../utils/layoutUtils';

export const usePanelActions = (
  areaId: string | undefined,
  type: PanelType,
  areas: AreaConfig[],
  setIsDropdownOpen: (open: boolean) => void,
  setIsActionsOpen: (open: boolean) => void,
  setShowRemoveConfirm: (show: boolean) => void
) => {
  const { changePanelType, splitArea, removeArea } = useLayoutStore();

  const totalPanels = countPanels(areas);
  const canRemove = totalPanels > 1;

  const availablePanels = Object.entries(panelConfig).filter(([panelType]) => panelType !== type);

  const handlePanelChange = (newPanelType: PanelType) => {
    if (areaId && newPanelType !== type) {
      changePanelType(areaId, newPanelType);
    }
    setIsDropdownOpen(false);
  };

  const handleSplitPanel = (direction: 'horizontal' | 'vertical', newPanelType: PanelType) => {
    if (areaId) {
      splitArea(areaId, direction, newPanelType);
    }
    setIsActionsOpen(false);
  };

  const handleRemovePanel = () => {
    if (!canRemove) {
      setShowRemoveConfirm(false);
      return;
    }

    if (areaId) {
      removeArea(areaId);
    }
    setIsActionsOpen(false);
    setShowRemoveConfirm(false);
  };

  const handleRemoveClick = () => {
    if (!canRemove) {
      return;
    }
    
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