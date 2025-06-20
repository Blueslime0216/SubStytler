import { create } from 'zustand';

interface ThemeState {
  isDarkMode: boolean;
  toggleTheme: () => void;
  setTheme: (isDark: boolean) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  // 다크 모드 고정 - 항상 true
  isDarkMode: true,
  
  // 토글 기능 비활성화 - 항상 다크 모드 유지
  toggleTheme: () => {
    // 아무것도 하지 않음 - 다크 모드 고정
  },
  
  // 테마 설정 비활성화 - 항상 다크 모드 유지
  setTheme: (isDark: boolean) => {
    // 아무것도 하지 않음 - 다크 모드 고정
  }
}));