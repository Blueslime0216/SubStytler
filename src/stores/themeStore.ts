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
      toggleTheme: () => set((state) => {
        const newMode = !state.isDarkMode;
        if (typeof document !== 'undefined') {
          document.documentElement.setAttribute('data-theme', newMode ? 'dark' : 'light');
        }
        return { isDarkMode: newMode };
      }),
      setTheme: (isDark: boolean) => set(() => {
        if (typeof document !== 'undefined') {
          document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
        }
        return { isDarkMode: isDark };
      }),
    }),
    {
      name: 'theme-storage',
    }
  )
);