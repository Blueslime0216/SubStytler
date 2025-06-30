import React, { useState, ReactNode } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface CollapsibleSectionProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  icon?: ReactNode;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  children,
  defaultOpen = false,
  className = '',
  headerClassName = '',
  contentClassName = '',
  icon
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const toggleOpen = () => setIsOpen(!isOpen);

  return (
    <div className={`collapsible-section mb-3 ${className}`}>
      <button
        onClick={toggleOpen}
        className={`flex items-center w-full p-2 rounded-lg text-left hover:bg-bg-hover transition-colors ${headerClassName}`}
      >
        {isOpen ? (
          <ChevronDown className="w-4 h-4 mr-1 text-text-secondary flex-shrink-0" />
        ) : (
          <ChevronRight className="w-4 h-4 mr-1 text-text-secondary flex-shrink-0" />
        )}
        
        {icon && <span className="mr-2">{icon}</span>}
        
        <span className="text-sm font-medium text-text-primary">{title}</span>
      </button>
      
      {isOpen && (
        <div className={`pt-2 pl-7 ${contentClassName}`}>
          {children}
        </div>
      )}
    </div>
  );
};

export default CollapsibleSection; 