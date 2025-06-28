import { useCallback } from 'react';
import { useProjectStore } from '../stores/projectStore';
import { useToast } from './useToast';
import { saveProjectToFile, loadProjectFromFile, SaveResult } from '../utils/projectFileUtils';

export const useProjectSave = () => {
  const { currentProject, loadProject, saveProject: updateProjectTimestamp } = useProjectStore();
  const { success, error, info } = useToast();

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

      const result = await saveProjectToFile(currentProject);

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
  }, [currentProject, updateProjectTimestamp, success, error, info]);

  const loadProjectFromFileSystem = useCallback(async () => {
    try {
      info({
        title: 'Loading Project',
        message: 'Please select a project file to load...',
        duration: 3000
      });

      const result = await loadProjectFromFile();

      if (result.success && result.project) {
        loadProject(result.project);
        success({
          title: 'Project Loaded',
          message: `"${result.project.name}" loaded successfully`
        });
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

  return {
    saveProjectToFileSystem,
    loadProjectFromFileSystem,
    canSave: !!currentProject
  };
};