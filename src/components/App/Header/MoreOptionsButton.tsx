import React, { useState, useRef } from 'react';
import { Menu, Edit, Sun, Moon, Save, ToggleLeft, ToggleRight } from 'lucide-react';
import { ContextMenu, ContextMenuItem, ContextMenuDivider } from '../../UI/ContextMenu';
import { useThemeStore } from '../../../stores/themeStore';
import { useAutoSave } from '../../../hooks/useAutoSave';
import { useProjectStore } from '../../../stores/projectStore';

interface MoreOptionsButtonProps {
  setIsEditingTitle?: (value: boolean) => void;
}

export const MoreOptionsButton: React.FC<MoreOptionsButtonProps> = ({ 
  setIsEditingTitle 
}) => {
  const [contextMenu, setContextMenu] = useState<{
    isOpen: boolean;
    x: number;
    y: number;
  }>({
    isOpen: false,
    x: 0,
    y: 0
  });

  const buttonRef = useRef<HTMLButtonElement>(null);
  const { isDarkMode, toggleTheme } = useThemeStore();
  const { isEnabled, toggleAutoSave } = useAutoSave();
  const { currentProject } = useProjectStore();

  const handleButtonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (contextMenu.isOpen) {
      setContextMenu({ ...contextMenu, isOpen: false });
    } else {
      const rect = buttonRef.current?.getBoundingClientRect();
      if (rect) {
        setContextMenu({
          isOpen: true,
          x: rect.left,
          y: rect.bottom + 5
        });
      }
    }
  };

  const handleRenameProject = () => {
    if (setIsEditingTitle && currentProject) {
      setIsEditingTitle(true);
      setContextMenu({ ...contextMenu, isOpen: false });
    }
  };

  const handleToggleTheme = () => {
    toggleTheme();
    setContextMenu({ ...contextMenu, isOpen: false });
  };

  const handleToggleAutoSave = () => {
    toggleAutoSave();
    setContextMenu({ ...contextMenu, isOpen: false });
  };

  return (
    <>
      <button 
        ref={buttonRef}
        className="btn-icon w-7 h-7 flex items-center justify-center ml-1"
        onClick={handleButtonClick}
      >
        <Menu size={14} />
      </button>

      {/* Context Menu */}
      <ContextMenu
        isOpen={contextMenu.isOpen}
        x={contextMenu.x}
        y={contextMenu.y}
        onClose={() => setContextMenu({ ...contextMenu, isOpen: false })}
      >
        <ContextMenuItem 
          icon={<Edit />}
          onClick={handleRenameProject}
          disabled={!currentProject}
        >
          프로젝트 이름 변경
        </ContextMenuItem>
        
        <ContextMenuDivider />
        
        <ContextMenuItem 
          icon={isDarkMode ? <Sun /> : <Moon />}
          onClick={handleToggleTheme}
        >
          {isDarkMode ? '라이트 모드로 변경' : '다크 모드로 변경'}
        </ContextMenuItem>
        
        <ContextMenuItem 
          icon={isEnabled ? <ToggleRight /> : <ToggleLeft />}
          onClick={handleToggleAutoSave}
        >
          자동 저장 {isEnabled ? '끄기' : '켜기'}
        </ContextMenuItem>
      </ContextMenu>
    </>
  );
};