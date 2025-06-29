import { Project } from '../types/project';
import { VideoInfo, extractVideoInfo } from './videoUtils';
import { useTimelineStore } from '../stores/timelineStore';
import { useLayoutStore } from '../stores/layoutStore';
import { Area } from '../types/area';

export interface SaveResult {
  success: boolean;
  message: string;
  filePath?: string;
}

export interface LoadResult {
  success: boolean;
  project?: Project;
  videoInfo?: VideoInfo;
  message: string;
  layout?: Area[];
}

export interface SaveOptions {
  filePath?: string;
  createDirectories?: boolean;
  overwrite?: boolean;
  saveLayoutOnly?: boolean;
}

/**
 * Validates a file path for saving project files
 */
export const validateSavePath = (filePath: string, extension = '.ssp'): { valid: boolean; error?: string } => {
  if (!filePath || filePath.trim() === '') {
    return { valid: false, error: 'File path cannot be empty' };
  }

  // Check for invalid characters in filename
  const invalidChars = /[<>:"|?*\x00-\x1f]/;
  const fileName = filePath.split(/[/\\]/).pop() || '';
  
  if (invalidChars.test(fileName)) {
    return { valid: false, error: 'File name contains invalid characters' };
  }

  // Ensure correct extension
  if (!filePath.toLowerCase().endsWith(extension)) {
    return { valid: false, error: `File must have ${extension} extension` };
  }

  // Check filename length (most filesystems have 255 char limit)
  if (fileName.length > 255) {
    return { valid: false, error: 'File name is too long (max 255 characters)' };
  }

  return { valid: true };
};

/**
 * Sanitizes project data for serialization with enhanced video info and timeline state
 */
export const sanitizeProjectForSave = async (
  project: Project, 
  videoElement?: HTMLVideoElement,
  saveLayoutOnly: boolean = false
): Promise<any> => {
  if (saveLayoutOnly) {
    // Only save layout data
    const layout = useLayoutStore.getState().areas;
    return { layout };
  }

  const sanitized = { ...project };

  // Save layout state
  sanitized.layout = useLayoutStore.getState().areas;

  // 🆕 Capture current timeline state from the timeline store
  const timelineState = useTimelineStore.getState();
  sanitized.timeline = {
    ...sanitized.timeline,
    currentTime: timelineState.currentTime,
    zoom: timelineState.zoom,
    viewStart: timelineState.viewStart,
    viewEnd: timelineState.viewEnd,
    // 🆕 Save additional timeline state for complete restoration
    isPlaying: timelineState.isPlaying,
    fps: timelineState.fps
  };

  // Handle File objects in videoMeta - convert to comprehensive video info
  if (sanitized.videoMeta?.file) {
    const { file, ...videoMetaWithoutFile } = sanitized.videoMeta;
    
    try {
      // Extract comprehensive video information including thumbnail
      const videoInfo = await extractVideoInfo(file, videoElement);
      
      sanitized.videoMeta = {
        ...videoMetaWithoutFile,
        // Store comprehensive video information
        videoInfo: {
          title: videoInfo.title,
          filename: videoInfo.filename,
          duration: videoInfo.duration,
          width: videoInfo.width,
          height: videoInfo.height,
          fps: videoInfo.fps,
          size: videoInfo.size,
          type: videoInfo.type,
          lastModified: videoInfo.lastModified,
          thumbnail: videoInfo.thumbnail
        }
      };
    } catch (error) {
      console.warn('Failed to extract video info:', error);
      // Fallback to basic file metadata
      sanitized.videoMeta = {
        ...videoMetaWithoutFile,
        videoInfo: {
          title: file.name.replace(/\.[^/.]+$/, ''),
          filename: file.name,
          duration: sanitized.videoMeta.duration || 0,
          width: sanitized.videoMeta.width || 0,
          height: sanitized.videoMeta.height || 0,
          fps: sanitized.videoMeta.fps || 30,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified
        }
      };
    }
  }

  // Ensure all required fields are present
  if (!sanitized.id) {
    sanitized.id = crypto.randomUUID();
  }

  if (!sanitized.createdAt) {
    sanitized.createdAt = Date.now();
  }

  sanitized.updatedAt = Date.now();

  // Ensure all subtitles have styling flags
  if (sanitized.subtitles) {
    sanitized.subtitles = sanitized.subtitles.map(subtitle => ({
      ...subtitle,
      spans: subtitle.spans.map(span => ({
        ...span,
        isBold: span.isBold || false,
        isItalic: span.isItalic || false,
        isUnderline: span.isUnderline || false,
        styleId: span.styleId || 'default'
      }))
    }));
  }

  // Ensure all tracks have required properties
  if (sanitized.tracks) {
    sanitized.tracks = sanitized.tracks.map(track => ({
      ...track,
      detail: track.detail || '',
      visible: track.visible !== undefined ? track.visible : true,
      locked: track.locked || false
    }));
  }

  // Ensure all styles have required properties
  if (sanitized.styles) {
    sanitized.styles = sanitized.styles.map(style => ({
      ...style,
      name: style.name || 'Unnamed Style',
      fc: style.fc || '#FFFFFF',
      fo: style.fo !== undefined ? style.fo : 1,
      bc: style.bc || '#000000',
      bo: style.bo !== undefined ? style.bo : 0.5
    }));
  }

  return sanitized;
};

/**
 * Creates the project file content as a JSON string with video info and timeline state
 */
export const createProjectFileContent = async (
  project: Project, 
  options: SaveOptions = {},
  videoElement?: HTMLVideoElement
): Promise<string> => {
  try {
    const sanitizedProject = await sanitizeProjectForSave(project, videoElement, options.saveLayoutOnly);
    
    // Create the file structure with metadata
    const fileContent = {
      version: '1.0.0',
      format: options.saveLayoutOnly ? 'Sub-Stytler Layout' : 'Sub-Stytler Project',
      encoding: 'UTF-8',
      createdBy: 'Sub-Stytler',
      savedAt: new Date().toISOString(),
      project: options.saveLayoutOnly ? undefined : sanitizedProject,
      layout: options.saveLayoutOnly ? sanitizedProject.layout : undefined
    };

    // Pretty print with 2-space indentation for readability
    return JSON.stringify(fileContent, null, 2);
  } catch (error) {
    throw new Error(`Failed to serialize project data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Saves a project to a file using the File System Access API (modern browsers)
 */
export const saveProjectToFile = async (
  project: Project, 
  options: SaveOptions = {},
  videoElement?: HTMLVideoElement
): Promise<SaveResult> => {
  try {
    // Validate project data
    if (!project && !options.saveLayoutOnly) {
      return {
        success: false,
        message: 'No project data provided'
      };
    }

    if (!options.saveLayoutOnly && (!project.name || project.name.trim() === '')) {
      return {
        success: false,
        message: 'Project must have a name'
      };
    }

    // Determine file extension
    const fileExtension = options.saveLayoutOnly ? '.ssl' : '.ssp';

    // Check if File System Access API is supported
    if (!('showSaveFilePicker' in window)) {
      return await saveProjectFallback(project, { ...options, fileExtension }, videoElement);
    }

    try {
      // Generate default filename
      const defaultFileName = options.saveLayoutOnly 
        ? `layout_${new Date().toISOString().replace(/[:.]/g, '-')}.ssl`
        : `${project.name.replace(/[<>:"|?*\x00-\x1f]/g, '_')}.ssp`;

      // Show save file picker
      const fileHandle = await (window as any).showSaveFilePicker({
        suggestedName: defaultFileName,
        types: [{
          description: options.saveLayoutOnly ? 'Sub-Stytler Layout Files' : 'Sub-Stytler Project Files',
          accept: {
            'application/json': [fileExtension]
          }
        }]
      });

      // Validate the chosen path
      const validation = validateSavePath(fileHandle.name, fileExtension);
      if (!validation.valid) {
        return {
          success: false,
          message: validation.error || 'Invalid file path'
        };
      }

      // Create file content with video info and timeline state
      const fileContent = await createProjectFileContent(project, options, videoElement);

      // Create writable stream and write content
      const writable = await fileHandle.createWritable();
      await writable.write(new Blob([fileContent], { type: 'application/json' }));
      await writable.close();

      return {
        success: true,
        message: options.saveLayoutOnly ? 'Layout saved successfully' : 'Project saved successfully',
        filePath: fileHandle.name
      };

    } catch (error: any) {
      // Handle user cancellation
      if (error.name === 'AbortError') {
        return {
          success: false,
          message: 'Save operation was cancelled'
        };
      }

      // Handle permission errors and cross-origin restrictions
      if (error.name === 'NotAllowedError' || error.name === 'SecurityError') {
        console.warn('File System Access API blocked, falling back to download method:', error.message);
        return await saveProjectFallback(project, options, videoElement);
      }

      // Handle cross-origin subframe restrictions
      if (error.message && error.message.includes('Cross origin sub frames')) {
        console.warn('Cross-origin file picker blocked, falling back to download method');
        return await saveProjectFallback(project, options, videoElement);
      }

      throw error;
    }

  } catch (error) {
    console.error('Error saving project:', error);
    return {
      success: false,
      message: `Failed to save project: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
};

/**
 * Fallback save method for browsers that don't support File System Access API
 */
export const saveProjectFallback = async (
  project: Project, 
  options: SaveOptions = {},
  videoElement?: HTMLVideoElement
): Promise<SaveResult> => {
  try {
    // Determine file extension
    const fileExtension = options.saveLayoutOnly ? '.ssl' : '.ssp';
    
    // Generate filename
    const fileName = options.filePath || (options.saveLayoutOnly 
      ? `layout_${new Date().toISOString().replace(/[:.]/g, '-')}${fileExtension}`
      : `${project.name.replace(/[<>:"|?*\x00-\x1f]/g, '_')}${fileExtension}`);
    
    // Validate filename
    const validation = validateSavePath(fileName, fileExtension);
    if (!validation.valid) {
      return {
        success: false,
        message: validation.error || 'Invalid file name'
      };
    }

    // Create file content with video info and timeline state
    const fileContent = await createProjectFileContent(project, options, videoElement);

    // Create blob and download
    const blob = new Blob([fileContent], { 
      type: 'application/json;charset=utf-8' 
    });

    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up
    URL.revokeObjectURL(url);

    return {
      success: true,
      message: options.saveLayoutOnly ? 'Layout download initiated' : 'Project download initiated',
      filePath: fileName
    };

  } catch (error) {
    console.error('Error in fallback save:', error);
    return {
      success: false,
      message: `Failed to save project: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
};

/**
 * Loads a project from a file with video info and timeline state
 */
export const loadProjectFromFile = async (options: { layoutOnly?: boolean } = {}): Promise<LoadResult> => {
  try {
    const fileExtension = options.layoutOnly ? '.ssl' : '.ssp';
    
    // Check if File System Access API is supported
    if ('showOpenFilePicker' in window) {
      try {
        const [fileHandle] = await (window as any).showOpenFilePicker({
          types: [{
            description: options.layoutOnly ? 'Sub-Stytler Layout Files' : 'Sub-Stytler Project Files',
            accept: {
              'application/json': [fileExtension]
            }
          }]
        });

        const file = await fileHandle.getFile();
        const content = await file.text();
        
        return parseProjectFile(content, options);
      } catch (error: any) {
        if (error.name === 'AbortError') {
          return {
            success: false,
            message: 'File selection was cancelled'
          };
        }
        throw error;
      }
    } else {
      // Fallback: use input element
      return new Promise((resolve) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = fileExtension;
        
        input.onchange = async (e) => {
          const file = (e.target as HTMLInputElement).files?.[0];
          if (!file) {
            resolve({
              success: false,
              message: 'No file selected'
            });
            return;
          }

          try {
            const content = await file.text();
            resolve(parseProjectFile(content, options));
          } catch (error) {
            resolve({
              success: false,
              message: `Failed to read file: ${error instanceof Error ? error.message : 'Unknown error'}`
            });
          }
        };

        input.click();
      });
    }
  } catch (error) {
    return {
      success: false,
      message: `Failed to load project: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
};

/**
 * Parses project file content with video info and timeline state extraction
 */
export const parseProjectFile = (content: string, options: { layoutOnly?: boolean } = {}): LoadResult => {
  try {
    const parsed = JSON.parse(content);
    
    // Check if this is a layout-only file
    if (parsed.format === 'Sub-Stytler Layout' || options.layoutOnly) {
      if (!parsed.layout || !Array.isArray(parsed.layout)) {
        return {
          success: false,
          message: 'Invalid layout file format'
        };
      }
      
      return {
        success: true,
        layout: parsed.layout,
        message: 'Layout loaded successfully'
      };
    }
    
    // Validate file format for project files
    if (!parsed.project) {
      return {
        success: false,
        message: 'Invalid project file format'
      };
    }

    const project = parsed.project as Project;

    // Validate required fields
    if (!project.id || !project.name) {
      return {
        success: false,
        message: 'Project file is missing required fields'
      };
    }

    // Ensure arrays exist
    if (!Array.isArray(project.tracks)) {
      project.tracks = [];
    }
    if (!Array.isArray(project.subtitles)) {
      project.subtitles = [];
    }
    if (!Array.isArray(project.styles)) {
      project.styles = [];
    }

    // 🆕 Ensure timeline state exists with defaults
    if (!project.timeline) {
      project.timeline = {
        currentTime: 0,
        zoom: 1,
        viewStart: 0,
        viewEnd: 60000
      };
    }

    // Extract layout if available
    const layout = project.layout || parsed.layout;

    // Extract video info if available
    let videoInfo: VideoInfo | undefined;
    if (project.videoMeta?.videoInfo) {
      videoInfo = project.videoMeta.videoInfo as VideoInfo;
    }

    return {
      success: true,
      project,
      videoInfo,
      layout,
      message: 'Project loaded successfully'
    };

  } catch (error) {
    return {
      success: false,
      message: `Failed to parse project file: ${error instanceof Error ? error.message : 'Invalid JSON'}`
    };
  }
};