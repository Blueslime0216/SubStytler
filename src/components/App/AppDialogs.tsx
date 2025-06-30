import React from 'react';
import { VideoReuploadDialog } from '../UI/VideoReuploadDialog';
import { NewProjectDialog } from '../UI/NewProjectDialog';
import { VideoInfo } from '../../utils/videoUtils';

interface AppDialogsProps {
  showVideoDialog: boolean;
  pendingVideoInfo: VideoInfo | null;
  handleVideoSelected: (videoFile: File) => void;
  handleSkipVideo: () => void;
  handleCloseVideoDialog: () => void;
  isNewProjectDialogOpen: boolean;
  setIsNewProjectDialogOpen: (isOpen: boolean) => void;
}

export const AppDialogs: React.FC<AppDialogsProps> = ({
  showVideoDialog,
  pendingVideoInfo,
  handleVideoSelected,
  handleSkipVideo,
  handleCloseVideoDialog,
  isNewProjectDialogOpen,
  setIsNewProjectDialogOpen
}) => {
  return (
    <>
      {/* Video Reupload Dialog */}
      {showVideoDialog && pendingVideoInfo && (
        <VideoReuploadDialog
          isOpen={showVideoDialog}
          onClose={handleCloseVideoDialog}
          videoInfo={pendingVideoInfo}
          onVideoSelected={handleVideoSelected}
          onSkip={handleSkipVideo}
        />
      )}

      {/* New Project Dialog */}
      <NewProjectDialog
        isOpen={isNewProjectDialogOpen}
        onClose={() => setIsNewProjectDialogOpen(false)}
      />
    </>
  );
};