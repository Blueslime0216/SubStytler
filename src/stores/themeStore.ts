import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeState {
  isDarkMode: boolean;
  toggleTheme: () => void;
  setTheme: (isDark: boolean) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      // Always dark mode - no light mode option
      isDarkMode: true,
      
      // Keep toggleTheme for compatibility but it does nothing
      toggleTheme: () => {
        // No-op: always stay in dark mode
        console.log('Light mode has been removed - staying in dark mode');
      },
      
      // Keep setTheme for compatibility but force dark mode
      setTheme: (isDark: boolean) => {
        // Always force dark mode regardless of input
        if (typeof document !== 'undefined') {
          document.documentElement.setAttribute('data-theme', 'dark');
        }
        return { isDarkMode: true };
      },
    }),
    {
      name: 'theme-storage',
    }
  )
);