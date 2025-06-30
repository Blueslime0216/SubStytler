import React from 'react';
import { AppLogo } from './Header/AppLogo';
import { ProjectTitle } from './Header/ProjectTitle';
import { MainMenuButtons } from './Header/MainMenuButtons';
import { HistoryControls } from './Header/HistoryControls';
import { ThemeToggle } from './Header/ThemeToggle';
import { MoreOptionsButton } from './Header/MoreOptionsButton';
import { ContextMenu } from '../UI/ContextMenu/ContextMenu';
import { ContextMenuItem } from '../UI/ContextMenu/ContextMenuItem';
import { useThemeStore } from '../../stores/themeStore';
import { useAutoSave } from '../../hooks/useAutoSave';

interface AppHeaderProps {
  titleValue: string;
  setTitleValue: (value: string) => void;
  isEditingTitle: boolean;
  setIsEditingTitle: (value: boolean) => void;
  titleInputRef: React.RefObject<HTMLInputElement>;
  onLoadProject: () => Promise<void>;
  onNewProject: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  titleValue,
  setTitleValue,
  isEditingTitle,
  setIsEditingTitle,
  titleInputRef,
  onLoadProject,
  onNewProject
}) => {
  // 컨텍스트 메뉴 상태
  const [menu, setMenu] = React.useState<{ open: boolean; x: number; y: number }>({ open: false, x: 0, y: 0 });

  // 테마 및 자동 저장 상태
  const { isDarkMode, toggleTheme } = useThemeStore();
  const { isEnabled: isAutoSaveEnabled, toggleAutoSave } = useAutoSave();

  // 우클릭 핸들러
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setMenu({ open: true, x: e.clientX, y: e.clientY });
  };

  // 메뉴 닫기 핸들러
  const handleMenuClose = () => setMenu(m => ({ ...m, open: false }));

  return (
    <header
      className="h-16 flex items-center px-4 bg-surface border-b border-border-color shadow-sm cursor-pointer"
      onContextMenu={handleContextMenu}
      style={{ userSelect: 'none' }}
    >
      {/* Left Section - Logo and Main Menu */}
      <div className="flex items-center space-x-4">
        {/* App Logo */}
        <AppLogo />

        {/* Divider */}
        <div className="h-10 w-px bg-border-color mx-2"></div>

        {/* Main Menu Items */}
        <MainMenuButtons 
          onLoadProject={onLoadProject}
          onNewProject={onNewProject}
        />
      </div>

      {/* Center Section - Project Title */}
      <ProjectTitle
        titleValue={titleValue}
        setTitleValue={setTitleValue}
        isEditingTitle={isEditingTitle}
        setIsEditingTitle={setIsEditingTitle}
        titleInputRef={titleInputRef}
      />

      {/* Right Section - Tools and Theme Toggle */}
      <div className="flex items-center space-x-3">
        {/* History Controls */}
        <HistoryControls />
        
        {/* Theme Toggle */}
        <ThemeToggle />
        
        {/* More Options Menu */}
        <MoreOptionsButton setIsEditingTitle={setIsEditingTitle} />
      </div>

      {/* 공용 컨텍스트 메뉴 사용 */}
      <ContextMenu
        x={menu.x}
        y={menu.y}
        isOpen={menu.open}
        onClose={handleMenuClose}
      >
        <ContextMenuItem onClick={() => { setIsEditingTitle(true); handleMenuClose(); }}>
          Rename Project
        </ContextMenuItem>
        <ContextMenuItem onClick={() => { toggleTheme(); handleMenuClose(); }}>
          {isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        </ContextMenuItem>
        <ContextMenuItem onClick={() => { toggleAutoSave(); handleMenuClose(); }}>
          {isAutoSaveEnabled ? 'Disable Auto Save' : 'Enable Auto Save'}
        </ContextMenuItem>
      </ContextMenu>
    </header>
  );
};