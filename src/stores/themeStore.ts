import { create } from 'zustand';

interface ThemeState {
  isDarkMode: boolean;
  toggleTheme: () => void;
  setTheme: (isDark: boolean) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  // 다크 모드를 기본값으로 설정
  isDarkMode: true,
  
  toggleTheme: () => set((state) => ({ 
    isDarkMode: !state.isDarkMode 
  })),
  
  setTheme: (isDark: boolean) => set({ 
    isDarkMode: isDark 
  })
}));