import React from 'react';
import { ZoomOut } from 'lucide-react';
import { ContextMenu, ContextMenuItem } from './index';

interface TimelineContentContextMenuProps {
  isOpen: boolean;
  x: number;
  y: number;
  onClose: () => void;
  onResetZoom: () => void;
}

export const TimelineContentContextMenu: React.FC<TimelineContentContextMenuProps> = ({
  isOpen,
  x,
  y,
  onClose,
  onResetZoom
}) => {
  if (!isOpen) return null;

  return (
    <ContextMenu
      isOpen={isOpen}
      x={x}
      y={y}
      onClose={onClose}
    >
      <ContextMenuItem 
        icon={<ZoomOut />}
        onClick={() => { onResetZoom(); onClose(); }}
      >
        Reset Zoom
      </ContextMenuItem>
    </ContextMenu>
  );
};