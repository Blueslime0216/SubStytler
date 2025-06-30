import React from 'react';
import { AppLogo } from './Header/AppLogo';
import { ProjectTitle } from './Header/ProjectTitle';
import { MainMenuButtons } from './Header/MainMenuButtons';
import { HistoryControls } from './Header/HistoryControls';
import { ThemeToggle } from './Header/ThemeToggle';
import { MoreOptionsButton } from './Header/MoreOptionsButton';

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
  return (
    <header className="h-16 flex items-center px-4 bg-surface border-b border-border-color shadow-sm">
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
        <MoreOptionsButton />
      </div>
    </header>
  );
};