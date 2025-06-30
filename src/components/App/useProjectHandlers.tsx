import { useState, useRef, useCallback } from 'react';
import { useProjectStore } from '../../stores/projectStore';
import { useProjectSave } from '../../hooks/useProjectSave';
import { VideoInfo } from '../../utils/videoUtils';

export const useProjectHandlers = () => {
  const [showVideoDialog, setShowVideoDialog] = useState(false);
  const [pendingProject, setPendingProject] = useState<any>(null);
  const [pendingVideoInfo, setPendingVideoInfo] = useState<VideoInfo | null>(null);
  const [isNewProjectDialogOpen, setIsNewProjectDialogOpen] = useState(false);
  
  const titleInputRef = useRef<HTMLInputElement>(null);
  
  const { 
    saveProjectToFileSystem, 
    loadProjectFromFileSystem, 
    loadProjectWithVideo 
  } = useProjectSave();
  
  // 🆕 Auto-load project with video dialog when needed
  const handleProjectLoad = useCallback(async () => {
    const result = await loadProjectFromFileSystem();
    
    if (result.success && result.project) {
      if (result.videoInfo) {
        // Show video reupload dialog immediately
        setPendingProject(result.project);
        setPendingVideoInfo(result.videoInfo);
        setShowVideoDialog(true);
      } else {
        // Load project directly (no video info)
        loadProjectWithVideo(result.project);
      }
      return true;
    }
    return false;
  }, [loadProjectFromFileSystem, loadProjectWithVideo]);

  // 🆕 Handle video selection from dialog
  const handleVideoSelected = useCallback((videoFile: File) => {
    if (pendingProject) {
      loadProjectWithVideo(pendingProject, videoFile);
      setShowVideoDialog(false);
      setPendingProject(null);
      setPendingVideoInfo(null);
    }
  }, [pendingProject, loadProjectWithVideo]);

  // 🆕 Handle skipping video
  const handleSkipVideo = useCallback(() => {
    if (pendingProject) {
      loadProjectWithVideo(pendingProject);
      setShowVideoDialog(false);
      setPendingProject(null);
      setPendingVideoInfo(null);
    }
  }, [pendingProject, loadProjectWithVideo]);

  // 🆕 Handle closing video dialog
  const handleCloseVideoDialog = useCallback(() => {
    setShowVideoDialog(false);
    setPendingProject(null);
    setPendingVideoInfo(null);
  }, []);
  
  return {
    showVideoDialog,
    pendingVideoInfo,
    isNewProjectDialogOpen,
    setIsNewProjectDialogOpen,
    titleInputRef,
    handleProjectLoad,
    handleVideoSelected,
    handleSkipVideo,
    handleCloseVideoDialog
  };
};