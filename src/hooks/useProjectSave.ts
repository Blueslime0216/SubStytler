import { useCallback, useRef } from 'react';
import { useProjectStore } from '../stores/projectStore';
import { useToast } from './useToast';
import { saveProjectToFile, loadProjectFromFile, SaveResult, LoadResult } from '../utils/projectFileUtils';
import { VideoInfo } from '../utils/videoUtils';

export const useProjectSave = () => {
  const { currentProject, loadProject, saveProject: updateProjectTimestamp } = useProjectStore();
  const { success, error, info } = useToast();
  const videoElementRef = useRef<HTMLVideoElement | null>(null);

  // Get reference to video element for thumbnail capture
  const getVideoElement = useCallback((): HTMLVideoElement | null => {
    if (videoElementRef.current) {
      return videoElementRef.current;
    }
    
    // Try to find video element in DOM
    const videoElement = document.querySelector('video');
    if (videoElement) {
      videoElementRef.current = videoElement;
      return videoElement;
    }
    
    return null;
  }, []);

  const saveProjectToFileSystem = useCallback(async (): Promise<SaveResult> => {
    if (!currentProject) {
      const result = {
        success: false,
        message: 'No project to save'
      };
      
      error({
        title: 'Save Failed',
        message: result.message
      });
      
      return result;
    }

    try {
      info({
        title: 'Saving Project',
        message: 'Please choose a location to save your project...',
        duration: 3000
      });

      // Get video element for thumbnail capture
      const videoElement = getVideoElement();

      const result = await saveProjectToFile(currentProject, {}, videoElement);

      if (result.success) {
        // Update the project's timestamp to mark it as saved
        updateProjectTimestamp();
        
        success({
          title: 'Project Saved',
          message: result.filePath 
            ? `Project saved as "${result.filePath}"` 
            : 'Project saved successfully'
        });
      } else {
        error({
          title: 'Save Failed',
          message: result.message
        });
      }

      return result;
    } catch (err) {
      const result = {
        success: false,
        message: err instanceof Error ? err.message : 'Unknown error occurred'
      };

      error({
        title: 'Save Error',
        message: result.message
      });

      return result;
    }
  }, [currentProject, updateProjectTimestamp, success, error, info, getVideoElement]);

  const loadProjectFromFileSystem = useCallback(async (): Promise<LoadResult> => {
    try {
      info({
        title: 'Loading Project',
        message: 'Please select a project file to load...',
        duration: 3000
      });

      const result = await loadProjectFromFile();

      if (result.success && result.project) {
        // Don't load the project immediately if it has video info
        // Let the caller handle the video reupload dialog
        if (!result.videoInfo) {
          loadProject(result.project);
          success({
            title: 'Project Loaded',
            message: `"${result.project.name}" loaded successfully`
          });
        }
      } else if (result.message !== 'File selection was cancelled') {
        error({
          title: 'Load Failed',
          message: result.message
        });
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      
      error({
        title: 'Load Error',
        message: errorMessage
      });

      return {
        success: false,
        message: errorMessage
      };
    }
  }, [loadProject, success, error, info]);

  const loadProjectWithVideo = useCallback((project: any, videoFile?: File) => {
    if (videoFile) {
      // Create video metadata from the new file
      const videoMeta = {
        filename: videoFile.name,
        duration: project.videoMeta?.duration || 0,
        fps: project.videoMeta?.fps || 30,
        width: project.videoMeta?.width || 0,
        height: project.videoMeta?.height || 0,
        file: videoFile
      };
      
      project.videoMeta = videoMeta;
    } else {
      // Remove video metadata if no file provided
      delete project.videoMeta;
    }

    loadProject(project);
    success({
      title: 'Project Loaded',
      message: `"${project.name}" loaded successfully${videoFile ? ' with video' : ''}`
    });
  }, [loadProject, success]);

  return {
    saveProjectToFileSystem,
    loadProjectFromFileSystem,
    loadProjectWithVideo,
    canSave: !!currentProject
  };
};