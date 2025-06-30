import React from 'react';
import { motion } from 'framer-motion';
import { Edit, Moon, Sun, Save, ToggleLeft, ToggleRight } from 'lucide-react';
import { ContextMenu, ContextMenuItem, ContextMenuDivider } from './index';
import { useThemeStore } from '../../../stores/themeStore';
import { useAutoSave } from '../../../hooks/useAutoSave';

interface HeaderContextMenuProps {
  isOpen: boolean;
  x: number;
  y: number;
  onClose: () => void;
  onEditTitle: () => void;
}

export const HeaderContextMenu: React.FC<HeaderContextMenuProps> = ({
  isOpen,
  x,
  y,
  onClose,
  onEditTitle
}) => {
  const { isDarkMode, toggleTheme } = useThemeStore();
  const { isEnabled, toggleAutoSave } = useAutoSave();

  if (!isOpen) return null;

  return (
    <ContextMenu
      isOpen={isOpen}
      x={x}
      y={y}
      onClose={onClose}
    >
      <ContextMenuItem 
        icon={<Edit />}
        onClick={() => { onEditTitle(); onClose(); }}
      >
        Rename Project
      </ContextMenuItem>
      
      <ContextMenuDivider />
      
      <ContextMenuItem 
        icon={isDarkMode ? <Sun /> : <Moon />}
        onClick={() => { toggleTheme(); onClose(); }}
      >
        Switch to {isDarkMode ? 'Light' : 'Dark'} Mode
      </ContextMenuItem>
      
      <ContextMenuItem 
        icon={isEnabled ? <ToggleRight /> : <ToggleLeft />}
        onClick={() => { toggleAutoSave(); onClose(); }}
      >
        {isEnabled ? 'Disable' : 'Enable'} Auto Save
      </ContextMenuItem>
    </ContextMenu>
  );
};