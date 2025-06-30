import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AutoSaveSettingsState {
  // Whether auto-save is on or off
  isEnabled: boolean;
  // Time between saves in ms. 0 means real-time (every action)
  interval: number;
  // How many backups to keep in localStorage
  maxBackups: number;

  // State mutators
  setIsEnabled: (enabled: boolean) => void;
  toggleAutoSave: () => void;
  setInterval: (interval: number) => void;
  setMaxBackups: (max: number) => void;
}

export const useAutoSaveStore = create<AutoSaveSettingsState>()(
  persist(
    (set, get) => ({
      // Default values match the previous implementation
      isEnabled: false,
      interval: 15000,
      maxBackups: 5,

      setIsEnabled: (enabled) => set({ isEnabled: enabled }),

      toggleAutoSave: () => {
        const currentlyEnabled = get().isEnabled;
        set({ isEnabled: !currentlyEnabled });
      },

      setInterval: (interval) => set({ interval }),
      setMaxBackups: (maxBackups) => set({ maxBackups }),
    }),
    {
      name: 'auto-save-settings', // localStorage key
    }
  )
); 