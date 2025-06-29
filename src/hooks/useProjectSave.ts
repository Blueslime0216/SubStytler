import { useCallback, useRef } from 'react';
import { useProjectStore } from '../stores/projectStore';
import { useTimelineStore } from '../stores/timelineStore';
import { useLayoutStore } from '../stores/layoutStore';
import { useToast } from './useToast';
import { saveProjectToFile, loadProjectFromFile, SaveResult, LoadResult } from '../utils/projectFileUtils';
import { VideoInfo } from '../utils/videoUtils';

export const useProjectSave = () => {
  const { setVideoMeta, currentProject, loadProject, saveProject: updateProjectTimestamp } = useProjectStore();
  const { setCurrentTime, setDuration, setFPS, setZoom, setViewRange, setPlaying } = useTimelineStore();
  const { setAreas } = useLayoutStore();
  const { success, error, info, warning } = useToast();
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

  const saveProjectToFileSystem = useCallback(async (options = { saveLayoutOnly: false }): Promise<SaveResult> => {
    if (!currentProject && !options.saveLayoutOnly) {
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
        title: options.saveLayoutOnly ? 'Saving Layout' : 'Saving Project',
        message: 'Please choose a location to save...',
        duration: 3000
      });

      // Get video element for thumbnail capture
      const videoElement = getVideoElement();

      const result = await saveProjectToFile(currentProject!, options, videoElement);

      if (result.success) {
        // Update the project's timestamp to mark it as saved
        if (!options.saveLayoutOnly) {
          updateProjectTimestamp();
        }
        
        success({
          title: options.saveLayoutOnly ? 'Layout Saved' : 'Project Saved',
          message: result.filePath 
            ? `${options.saveLayoutOnly ? 'Layout' : 'Project'} saved as "${result.filePath}"` 
            : `${options.saveLayoutOnly ? 'Layout' : 'Project'} saved successfully`
        });
      } else {
        error({
          title: options.saveLayoutOnly ? 'Layout Save Failed' : 'Save Failed',
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
        title: options.saveLayoutOnly ? 'Layout Save Error' : 'Save Error',
        message: result.message
      });

      return result;
    }
  }, [currentProject, updateProjectTimestamp, success, error, info, getVideoElement]);

  const saveLayoutToFileSystem = useCallback(async (): Promise<SaveResult> => {
    return saveProjectToFileSystem({ saveLayoutOnly: true });
  }, [saveProjectToFileSystem]);

  const loadProjectFromFileSystem = useCallback(async (options = { layoutOnly: false }): Promise<LoadResult> => {
    try {
      info({
        title: options.layoutOnly ? 'Loading Layout' : 'Loading Project',
        message: `Please select a ${options.layoutOnly ? 'layout' : 'project'} file to load...`,
        duration: 3000
      });

      const result = await loadProjectFromFile(options);

      if (result.success) {
        if (options.layoutOnly && result.layout) {
          // Only load the layout
          setAreas(result.layout);
          success({
            title: 'Layout Loaded',
            message: 'Layout configuration loaded successfully'
          });
        } else if (!options.layoutOnly && result.project) {
          // 🆕 Always return the result without loading the project here
          // Let the caller handle the video dialog logic
          if (!result.videoInfo) {
            // Only show success message for projects without video info
            // Projects with video info will show success after video is handled
            success({
              title: 'Project Loaded',
              message: `"${result.project.name}" loaded successfully`
            });
          }
        } else if (result.message !== 'File selection was cancelled') {
          error({
            title: 'Load Failed',
            message: options.layoutOnly 
              ? 'Invalid layout file format' 
              : 'Invalid project file format'
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
  }, [success, error, info, setAreas]);

  const loadLayoutFromFileSystem = useCallback(async (): Promise<LoadResult> => {
    return loadProjectFromFileSystem({ layoutOnly: true });
  }, [loadProjectFromFileSystem]);

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

    // 🆕 Restore timeline state from saved project
    if (project.timeline) {
      // Set timeline duration and FPS first (if video metadata exists)
      if (project.videoMeta?.duration) {
        setDuration(project.videoMeta.duration);
      }
      if (project.videoMeta?.fps || project.timeline.fps) {
        setFPS(project.videoMeta?.fps || project.timeline.fps || 30);
      }

      // Restore timeline position and view state
      if (typeof project.timeline.currentTime === 'number') {
        setCurrentTime(project.timeline.currentTime);
      }
      if (typeof project.timeline.zoom === 'number') {
        setZoom(project.timeline.zoom);
      }
      if (typeof project.timeline.viewStart === 'number' && typeof project.timeline.viewEnd === 'number') {
        setViewRange(project.timeline.viewStart, project.timeline.viewEnd);
      }
      
      // 🆕 Restore playback state (but don't auto-play)
      if (typeof project.timeline.isPlaying === 'boolean') {
        // Always start paused when loading a project for safety
        setPlaying(false);
      }
    }

    // 🆕 Restore layout if available
    if (project.layout && Array.isArray(project.layout)) {
      setAreas(project.layout);
    }

    // Load the project into the store
    loadProject(project);
    
    success({
      title: 'Project Loaded',
      message: `"${project.name}" loaded successfully${videoFile ? ' with video' : ''}`
    });
  }, [loadProject, success, setCurrentTime, setDuration, setFPS, setZoom, setViewRange, setPlaying, setAreas]);

  return {
    saveProjectToFileSystem,
    saveLayoutToFileSystem,
    loadProjectFromFileSystem,
    loadLayoutFromFileSystem,
    loadProjectWithVideo,
    canSave: !!currentProject
  };
};