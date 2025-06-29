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
      isDarkMode: true,
      
      toggleTheme: () => {
        set((state) => {
          const newIsDarkMode = !state.isDarkMode;
          
          // Update DOM
          if (typeof document !== 'undefined') {
            document.documentElement.setAttribute(
              'data-theme', 
              newIsDarkMode ? 'dark' : 'light'
            );
          }
          
          return { isDarkMode: newIsDarkMode };
        });
      },
      
      setTheme: (isDark: boolean) => {
        // Update DOM
        if (typeof document !== 'undefined') {
          document.documentElement.setAttribute(
            'data-theme', 
            isDark ? 'dark' : 'light'
          );
        }
        
        return set({ isDarkMode: isDark });
      },
    }),
    {
      name: 'theme-storage',
    }
  )
);