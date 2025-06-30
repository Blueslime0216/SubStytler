import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useThemeStore } from '../../../stores/themeStore';

export const ThemeToggle: React.FC = () => {
  const { isDarkMode, toggleTheme } = useThemeStore();

  return (
    <button 
      onClick={toggleTheme}
      className="btn-icon w-7 h-7 flex items-center justify-center"
      title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDarkMode ? <Sun size={14} /> : <Moon size={14} />}
    </button>
  );
};