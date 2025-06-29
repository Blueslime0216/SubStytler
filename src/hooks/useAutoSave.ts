import { useState, useEffect, useCallback } from 'react';
import { useProjectStore } from '../stores/projectStore';
import { useLayoutStore } from '../stores/layoutStore';
import { useTimelineStore } from '../stores/timelineStore';
import { useToast } from './useToast';

interface AutoSaveBackup {
  timestamp: string;
  projectName: string;
  data: string;
  size: number;
}

const AUTO_SAVE_KEY = 'sub-stytler-auto-save';
const AUTO_SAVE_SETTINGS_KEY = 'sub-stytler-auto-save-settings';

export const useAutoSave = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [interval, setInterval] = useState(15000); // Default: 15 seconds
  const [maxBackups, setMaxBackups] = useState(5); // Default: 5 backups
  const [backups, setBackups] = useState<AutoSaveBackup[]>([]);
  const [totalStorageUsed, setTotalStorageUsed] = useState(0);
  const [lastSaveTime, setLastSaveTime] = useState(0);
  
  const { currentProject } = useProjectStore();
  const { areas } = useLayoutStore();
  const timelineState = useTimelineStore();
  const { success, error, info } = useToast();
  
  // Load settings from localStorage
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem(AUTO_SAVE_SETTINGS_KEY);
      if (savedSettings) {
        const { isEnabled, interval, maxBackups } = JSON.parse(savedSettings);
        setIsEnabled(isEnabled);
        setInterval(interval);
        setMaxBackups(maxBackups);
      }
    } catch (err) {
      console.error('Failed to load auto-save settings:', err);
    }
    
    // Load existing backups
    loadBackups();
  }, []);
  
  // Save settings when they change
  useEffect(() => {
    try {
      localStorage.setItem(AUTO_SAVE_SETTINGS_KEY, JSON.stringify({
        isEnabled,
        interval,
        maxBackups
      }));
    } catch (err) {
      console.error('Failed to save auto-save settings:', err);
    }
  }, [isEnabled, interval, maxBackups]);
  
  // Load existing backups
  const loadBackups = useCallback(() => {
    try {
      let totalSize = 0;
      const backupList: AutoSaveBackup[] = [];
      
      // Iterate through localStorage to find all backups
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(AUTO_SAVE_KEY)) {
          const backupData = localStorage.getItem(key);
          if (backupData) {
            try {
              const backup = JSON.parse(backupData);
              const size = new Blob([backupData]).size;
              totalSize += size;
              
              backupList.push({
                timestamp: key.replace(`${AUTO_SAVE_KEY}-`, ''),
                projectName: backup.project?.name || 'Untitled',
                data: backupData,
                size
              });
            } catch (parseErr) {
              console.error('Failed to parse backup:', parseErr);
            }
          }
        }
      }
      
      // Sort by timestamp (newest first)
      backupList.sort((a, b) => parseInt(b.timestamp) - parseInt(a.timestamp));
      
      setBackups(backupList);
      setTotalStorageUsed(totalSize);
    } catch (err) {
      console.error('Failed to load backups:', err);
    }
  }, []);
  
  // Auto-save timer
  useEffect(() => {
    if (!isEnabled || !currentProject || interval === 0) return;
    
    const now = Date.now();
    if (now - lastSaveTime < interval) return;
    
    const timerId = setTimeout(() => {
      saveBackup();
    }, interval);
    
    return () => clearTimeout(timerId);
  }, [isEnabled, currentProject, interval, lastSaveTime]);
  
  // Real-time auto-save (on every action)
  useEffect(() => {
    if (!isEnabled || !currentProject || interval !== 0) return;
    
    // Debounce to prevent too frequent saves
    const timerId = setTimeout(() => {
      saveBackup();
    }, 500);
    
    return () => clearTimeout(timerId);
  }, [isEnabled, currentProject, interval, areas, timelineState.currentTime]);
  
  // Save backup
  const saveBackup = useCallback(() => {
    if (!currentProject) return;
    
    try {
      // Prepare data for saving
      const backupData = {
        version: '1.0.0',
        timestamp: Date.now(),
        project: currentProject,
        layout: areas,
        timeline: {
          currentTime: timelineState.currentTime,
          zoom: timelineState.zoom,
          viewStart: timelineState.viewStart,
          viewEnd: timelineState.viewEnd,
          isPlaying: timelineState.isPlaying,
          fps: timelineState.fps
        }
      };
      
      // Convert to string
      const backupString = JSON.stringify(backupData);
      
      // Save to localStorage
      const timestamp = Date.now().toString();
      localStorage.setItem(`${AUTO_SAVE_KEY}-${timestamp}`, backupString);
      
      // Update last save time
      setLastSaveTime(Date.now());
      
      // Reload backups to update the list and storage usage
      loadBackups();
      
      // Enforce max backups limit
      enforceMaxBackups();
    } catch (err) {
      console.error('Failed to auto-save:', err);
      
      // If it's a storage quota error, show a warning
      if (err instanceof DOMException && err.name === 'QuotaExceededError') {
        error({
          title: 'Auto-Save Failed',
          message: 'Storage quota exceeded. Try reducing the number of backups.'
        });
      }
    }
  }, [currentProject, areas, timelineState, loadBackups]);
  
  // Enforce max backups limit
  const enforceMaxBackups = useCallback(() => {
    if (backups.length <= maxBackups) return;
    
    // Remove oldest backups
    const backupsToRemove = backups.slice(maxBackups);
    backupsToRemove.forEach(backup => {
      localStorage.removeItem(`${AUTO_SAVE_KEY}-${backup.timestamp}`);
    });
    
    // Reload backups
    loadBackups();
  }, [backups, maxBackups, loadBackups]);
  
  // Toggle auto-save
  const toggleAutoSave = useCallback(() => {
    setIsEnabled(prev => !prev);
    
    if (!isEnabled) {
      // If enabling, save immediately
      saveBackup();
      success({
        title: 'Auto-Save Enabled',
        message: 'Your work will be automatically saved'
      });
    } else {
      info({
        title: 'Auto-Save Disabled',
        message: 'Automatic saving has been turned off'
      });
    }
  }, [isEnabled, saveBackup, success, info]);
  
  // Restore backup
  const restoreBackup = useCallback((timestamp: string) => {
    try {
      const backupData = localStorage.getItem(`${AUTO_SAVE_KEY}-${timestamp}`);
      if (!backupData) {
        error({
          title: 'Restore Failed',
          message: 'Backup not found'
        });
        return;
      }
      
      const backup = JSON.parse(backupData);
      
      // Restore project
      if (backup.project) {
        useProjectStore.getState().loadProject(backup.project);
      }
      
      // Restore layout
      if (backup.layout) {
        useLayoutStore.getState().setAreas(backup.layout);
      }
      
      // Restore timeline state
      if (backup.timeline) {
        const { currentTime, zoom, viewStart, viewEnd, fps } = backup.timeline;
        useTimelineStore.getState().setCurrentTime(currentTime);
        useTimelineStore.getState().setZoom(zoom);
        useTimelineStore.getState().setViewRange(viewStart, viewEnd);
        if (fps) useTimelineStore.getState().setFPS(fps);
      }
      
      success({
        title: 'Backup Restored',
        message: `Project restored from ${new Date(parseInt(timestamp)).toLocaleString()}`
      });
    } catch (err) {
      console.error('Failed to restore backup:', err);
      error({
        title: 'Restore Failed',
        message: err instanceof Error ? err.message : 'Unknown error occurred'
      });
    }
  }, [error, success]);
  
  // Clear all backups
  const clearAllBackups = useCallback(() => {
    try {
      // Remove all backups
      backups.forEach(backup => {
        localStorage.removeItem(`${AUTO_SAVE_KEY}-${backup.timestamp}`);
      });
      
      // Reload backups
      loadBackups();
      
      info({
        title: 'Backups Cleared',
        message: 'All auto-save backups have been removed'
      });
    } catch (err) {
      console.error('Failed to clear backups:', err);
      error({
        title: 'Clear Failed',
        message: err instanceof Error ? err.message : 'Unknown error occurred'
      });
    }
  }, [backups, loadBackups, info, error]);
  
  return {
    isEnabled,
    toggleAutoSave,
    interval,
    setInterval,
    maxBackups,
    setMaxBackups,
    backups,
    totalStorageUsed,
    restoreBackup,
    clearAllBackups
  };
};