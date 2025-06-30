import React, { useState } from 'react';
import { Plus, Eye, EyeOff, Lock, Unlock, Trash2, Edit, Type, FileText, RefreshCw } from 'lucide-react';
import { ContextMenu, ContextMenuItem, ContextMenuDivider, ContextMenuSectionTitle } from '../../UI/ContextMenu';
import { useProjectStore } from '../../../stores/projectStore';
import { useHistoryStore } from '../../../stores/historyStore';
import { useTimelineStore } from '../../../stores/timelineStore';
import { useSnapStore } from '../../../stores/snapStore';
import { SubtitleTrack } from '../../../types/project';
import { TrackDeleteConfirmationModal } from '../../UI/TrackDeleteConfirmationModal';

interface TrackContextMenusProps {
  trackHeaderContextMenu: {
    isOpen: boolean;
    x: number;
    y: number;
    trackId: string | null;
  };
  trackContentContextMenu: {
    isOpen: boolean;
    x: number;
    y: number;
    trackId: string | null;
    subtitleId: string | null;
    time: number | null;
  };
  tracks: SubtitleTrack[];
  closeAllContextMenus: () => void;
  selectedTrackId: string | null;
  setSelectedTrackId: (id: string | null) => void;
  flashIds: (ids: string[], duration?: number) => void;
}

export const TrackContextMenus: React.FC<TrackContextMenusProps> = ({
  trackHeaderContextMenu,
  trackContentContextMenu,
  tracks,
  closeAllContextMenus,
  selectedTrackId,
  setSelectedTrackId,
  flashIds
}) => {
  const { addTrack, updateTrack, deleteTrack, addSubtitle, deleteSubtitle, currentProject } = useProjectStore();
  const { setCurrentTime, setZoom, setViewRange, duration } = useTimelineStore();
  const { enabled: snapEnabled, toggle: toggleSnap } = useSnapStore();
  
  // Delete confirmation modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [trackToDelete, setTrackToDelete] = useState<SubtitleTrack | null>(null);

  // Context menu action handlers
  const handleAddTrack = () => {
    const tracks = currentProject?.tracks || [];
    const trackNumber = tracks.length + 1;
    const trackId = addTrack(`Track ${trackNumber}`);
    if (trackId) {
      setSelectedTrackId(trackId);
    }
    closeAllContextMenus();
  };

  const handleAddSubtitle = (trackId: string) => {
    if (!trackId) return;
    const time = useTimelineStore.getState().currentTime;  // 재생 헤드 위치 사용
    
    // Check if the track is locked
    const track = tracks.find(t => t.id === trackId);
    if (track?.locked) {
      console.warn(`Cannot add subtitle to a locked track: "${track.name}"`);
      closeAllContextMenus();
      return;
    }

    // Record state before adding subtitle
    useHistoryStore.getState().record(
      { 
        project: {
          subtitles: [...(currentProject?.subtitles || [])],
          selectedSubtitleId: null
        }
      },
      'Before adding subtitle from context menu',
      true
    );
    
    const newStartTime = time;
    const newEndTime = time + 2000; // Default duration is 2s

    // Check for overlapping subtitles on the target track
    const overlapping = currentProject?.subtitles.find(
      (sub) =>
        sub.trackId === trackId && // Same track
        newStartTime < sub.endTime &&   // New sub starts before other ends
        newEndTime > sub.startTime      // New sub ends after other starts
    );

    if (overlapping) {
      // Flash highlight the overlapping subtitle
      flashIds([overlapping.id], 600);
      closeAllContextMenus();
      return; // do not add new subtitle
    }
    
    const newSubtitle = {
      id: crypto.randomUUID(),
      spans: [{
        id: crypto.randomUUID(),
        text: 'New subtitle',
        startTime: time,
        endTime: time + 2000
      }],
      startTime: time,
      endTime: time + 2000,
      trackId
    };
    
    addSubtitle(newSubtitle);
    
    // Record state after adding subtitle
    setTimeout(() => {
      useHistoryStore.getState().record(
        { 
          project: {
            subtitles: currentProject?.subtitles || [],
            selectedSubtitleId: newSubtitle.id
          }
        },
        `Added new subtitle at ${formatTimeForHistory(time)} from context menu`
      );
    }, 0);
    
    closeAllContextMenus();
  };

  const handleDeleteSubtitle = (subtitleId: string) => {
    if (!subtitleId) return;
    
    // Find the subtitle to delete
    const subtitleToDelete = currentProject?.subtitles.find(s => s.id === subtitleId);
    if (!subtitleToDelete) return;
    
    // Record state before deleting
    useHistoryStore.getState().record(
      { 
        project: {
          subtitles: [...(currentProject?.subtitles || [])],
          selectedSubtitleId: null
        }
      },
      'Before deleting subtitle from context menu',
      true
    );
    
    deleteSubtitle(subtitleId);
    
    // Record state after deleting
    setTimeout(() => {
      useHistoryStore.getState().record(
        { 
          project: {
            subtitles: currentProject?.subtitles || [],
            selectedSubtitleId: null
          }
        },
        `Deleted subtitle from context menu`
      );
    }, 0);
    
    closeAllContextMenus();
  };

  const handleToggleTrackVisibility = (trackId: string) => {
    if (!trackId) return;
    
    const track = tracks.find(t => t.id === trackId);
    if (!track) return;
    
    updateTrack(trackId, { visible: !track.visible });
    closeAllContextMenus();
  };

  const handleToggleTrackLock = (trackId: string) => {
    if (!trackId) return;
    
    const track = tracks.find(t => t.id === trackId);
    if (!track) return;
    
    updateTrack(trackId, { locked: !track.locked });
    closeAllContextMenus();
  };

  const handleDeleteTrackClick = (trackId: string) => {
    if (!trackId) return;
    
    const track = tracks.find(t => t.id === trackId);
    if (!track) return;
    
    if (tracks.length <= 1) {
      alert('Cannot delete the last remaining track. At least one track must exist.');
      closeAllContextMenus();
      return;
    }
    
    // Open the delete confirmation modal
    setTrackToDelete(track);
    setDeleteModalOpen(true);
    closeAllContextMenus();
  };
  
  const handleConfirmDeleteTrack = () => {
    if (!trackToDelete) return;
    
    deleteTrack(trackToDelete.id);
    setDeleteModalOpen(false);
    setTrackToDelete(null);
  };

  const handleRenameTrack = (trackId: string) => {
    if (!trackId) return;
    
    const trackHeader = document.querySelector(`[data-track-id="${trackId}"]`);
    if (trackHeader) {
      const trackNameElement = trackHeader.querySelector('.track-name');
      if (trackNameElement) {
        // Simulate double click to trigger inline editing
        const doubleClickEvent = new MouseEvent('dblclick', {
          bubbles: true,
          cancelable: true,
          view: window
        });
        trackNameElement.dispatchEvent(doubleClickEvent);
      }
    }
    
    closeAllContextMenus();
  };

  const handleChangeTrackDetail = (trackId: string) => {
    if (!trackId) return;
    
    const trackHeader = document.querySelector(`[data-track-id="${trackId}"]`);
    if (trackHeader) {
      const trackDetailElement = trackHeader.querySelector('.track-detail');
      if (trackDetailElement) {
        // Simulate double click to trigger inline editing
        const doubleClickEvent = new MouseEvent('dblclick', {
          bubbles: true,
          cancelable: true,
          view: window
        });
        trackDetailElement.dispatchEvent(doubleClickEvent);
      }
    }
    
    closeAllContextMenus();
  };

  // Reset zoom handler
  const handleResetZoom = () => {
    setZoom(1);
    setViewRange(0, duration);
    closeAllContextMenus();
  };

  // Snap toggle
  const handleToggleSnap = () => {
    toggleSnap();
    closeAllContextMenus();
  };

  // Helper function to format time for history descriptions
  const formatTimeForHistory = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <>
      {/* Track Header Context Menu */}
      <ContextMenu
        isOpen={trackHeaderContextMenu.isOpen}
        x={trackHeaderContextMenu.x}
        y={trackHeaderContextMenu.y}
        onClose={() => closeAllContextMenus()}
      >
        <ContextMenuItem 
          icon={<Plus />}
          onClick={handleAddTrack}
        >
          Add Track
        </ContextMenuItem>

        <ContextMenuItem
          onClick={handleToggleSnap}
        >
          {snapEnabled ? 'Disable Snapping' : 'Enable Snapping'}
        </ContextMenuItem>

        {trackHeaderContextMenu.trackId && (
          <>
            <ContextMenuDivider />
            <ContextMenuSectionTitle>Track Options</ContextMenuSectionTitle>
            
            {/* Track visibility toggle */}
            {(() => {
              const track = tracks.find(t => t.id === trackHeaderContextMenu.trackId);
              return (
                <ContextMenuItem 
                  icon={track?.visible ? <EyeOff /> : <Eye />}
                  onClick={() => handleToggleTrackVisibility(trackHeaderContextMenu.trackId!)}
                >
                  {track?.visible ? 'Hide Track' : 'Show Track'}
                </ContextMenuItem>
              );
            })()}
            
            {/* Track lock toggle */}
            {(() => {
              const track = tracks.find(t => t.id === trackHeaderContextMenu.trackId);
              return (
                <ContextMenuItem 
                  icon={track?.locked ? <Unlock /> : <Lock />}
                  onClick={() => handleToggleTrackLock(trackHeaderContextMenu.trackId!)}
                >
                  {track?.locked ? 'Unlock Track' : 'Lock Track'}
                </ContextMenuItem>
              );
            })()}
            
            <ContextMenuItem 
              icon={<Edit />}
              onClick={() => handleRenameTrack(trackHeaderContextMenu.trackId!)}
            >
              Rename Track
            </ContextMenuItem>
            
            <ContextMenuItem 
              icon={<FileText />}
              onClick={() => handleChangeTrackDetail(trackHeaderContextMenu.trackId!)}
            >
              Change Detail
            </ContextMenuItem>
            
            <ContextMenuItem 
              icon={<Trash2 />}
              onClick={() => handleDeleteTrackClick(trackHeaderContextMenu.trackId!)}
              danger
              disabled={tracks.length <= 1}
            >
              Delete Track
            </ContextMenuItem>
          </>
        )}
      </ContextMenu>

      {/* Track Content Context Menu */}
      <ContextMenu
        isOpen={trackContentContextMenu.isOpen}
        x={trackContentContextMenu.x}
        y={trackContentContextMenu.y}
        onClose={() => closeAllContextMenus()}
      >
        {trackContentContextMenu.trackId && trackContentContextMenu.time !== null && (
          <ContextMenuItem 
            icon={<Type />}
            onClick={() => handleAddSubtitle(trackContentContextMenu.trackId!)}
            disabled={tracks.find(t => t.id === trackContentContextMenu.trackId)?.locked}
          >
            Add Subtitle
          </ContextMenuItem>
        )}
        
        <ContextMenuItem 
          icon={<Plus />}
          onClick={handleAddTrack}
        >
          Add Track
        </ContextMenuItem>
        
        <ContextMenuItem
          onClick={handleToggleSnap}
        >
          {snapEnabled ? 'Disable Snapping' : 'Enable Snapping'}
        </ContextMenuItem>
        
        {/* 줌 초기화 - 자막 블록이 아닌 빈 공간을 클릭했을 때만 표시 */}
        {!trackContentContextMenu.subtitleId && (
          <ContextMenuItem 
            icon={<RefreshCw />}
            onClick={handleResetZoom}
          >
            줌 초기화
          </ContextMenuItem>
        )}
        
        {trackContentContextMenu.subtitleId && (
          <>
            <ContextMenuDivider />
            <ContextMenuSectionTitle>Subtitle Options</ContextMenuSectionTitle>
            <ContextMenuItem 
              icon={<Trash2 />}
              onClick={() => handleDeleteSubtitle(trackContentContextMenu.subtitleId!)}
              danger
            >
              Delete Subtitle
            </ContextMenuItem>
          </>
        )}
      </ContextMenu>
      
      {/* Delete Track Confirmation Modal */}
      <TrackDeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setTrackToDelete(null);
        }}
        onConfirm={handleConfirmDeleteTrack}
        track={trackToDelete}
      />
    </>
  );
};