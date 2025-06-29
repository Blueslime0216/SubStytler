import React from 'react';
import { motion } from 'framer-motion';

interface ContextMenuItemProps {
  icon?: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  danger?: boolean;
}

export const ContextMenuItem: React.FC<ContextMenuItemProps> = ({
  icon,
  onClick,
  disabled = false,
  children,
  danger = false
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!disabled) {
      onClick();
    }
  };

  return (
    <motion.div
      className={`context-menu-item ${disabled ? 'disabled' : ''}`}
      onClick={handleClick}
      style={{
        color: danger ? 'var(--error-color)' : undefined
      }}
      whileHover={{ x: 2 }}
      whileTap={{ scale: 0.98 }}
    >
      {icon && <span className="context-menu-item-icon">{icon}</span>}
      <span>{children}</span>
    </motion.div>
  );
};

export const ContextMenuDivider: React.FC = () => {
  return <div className="context-menu-divider" />;
};

export const ContextMenuSectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <div className="context-menu-section-title">{children}</div>;
};