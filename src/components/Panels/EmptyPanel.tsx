import React from 'react';
import logoDark from '../../assets/logo.svg';
import logoLight from '../../assets/logo_light.svg';
import { useThemeStore } from '../../stores/themeStore';

export const EmptyPanel: React.FC = () => {
  const { isDarkMode } = useThemeStore();
  const logoSrc = isDarkMode ? logoDark : logoLight;
  
  return (
    <div className="h-full w-full flex flex-col items-center justify-center text-text-secondary">
      <div className="flex flex-col items-center">
        <img 
          src={logoSrc} 
          alt="Sub-Stytler Logo" 
          className="w-16 h-16 mb-4 opacity-40"
        />
        <p className="text-sm">Select a panel type to begin</p>
      </div>
    </div>
  );
};