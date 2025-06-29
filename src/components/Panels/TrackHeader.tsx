import React, { forwardRef, useImperativeHandle } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Lock, Unlock, Trash2 } from 'lucide-react';
import { SubtitleTrack } from '../../types/project';
import { useProjectStore } from '../../stores/projectStore';
import { useHistoryStore } from '../../stores/historyStore';
import { TrackDeleteConfirmationModal } from '../UI/TrackDeleteConfirmationModal';

export interface TrackHeaderRef {
  startEditingName: () => void;
  startEditingDetail: () => void;
}

interface TrackHeaderProps {
  track: SubtitleTrack;
  isActive: boolean;
  onSelect: () => void;
  onDelete: (id: string) => void;
  onRename: (id: string, name: string) => void;
  onUpdateDetail: (id: string, detail: string) => void;
  onToggleVisibility: (id: string, visible: boolean) => void;
  onToggleLock: (id: string, locked: boolean) => void;
}

export const TrackHeader = forwardRef<TrackHeaderRef, TrackHeaderProps>(({
  track,
  isActive,
  onSelect,
  onDelete,
  onRename,
  onUpdateDetail,
  onToggleVisibility,
  onToggleLock,
}, ref) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [nameValue, setNameValue] = React.useState(track.name);
  const [isEditingDetail, setIsEditingDetail] = React.useState(false);
  const [detailValue, setDetailValue] = React.useState(track.detail);
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const detailInputRef = React.useRef<HTMLInputElement>(null);
  
  // Get current project to check track count
  const { currentProject } = useProjectStore();
  const isLastTrack = currentProject?.tracks.length === 1;

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    startEditingName: () => {
      if (!track.locked) {
        setIsEditing(true);
      }
    },
    startEditingDetail: () => {
      if (!track.locked) {
        setIsEditingDetail(true);
      }
    }
  }));

  const handleDoubleClick = () => {
    if (!track.locked) {
      setIsEditing(true);
    }
  };

  React.useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onRename(track.id, nameValue);
      setIsEditing(false);
    } else if (e.key === 'Escape') {
      setNameValue(track.name);
      setIsEditing(false);
    }
  };

  const handleBlur = () => {
    onRename(track.id, nameValue);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (isLastTrack) {
      // Show a more user-friendly message
      alert('Cannot delete the last remaining track. At least one track must exist.');
      return;
    }
    
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    onDelete(track.id);
    setShowDeleteConfirm(false);
  };

  const handleDetailDoubleClick = () => {
    if (!track.locked) {
      setIsEditingDetail(true);
    }
  };

  const handleDetailKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onUpdateDetail(track.id, detailValue);
      setIsEditingDetail(false);
    } else if (e.key === 'Escape') {
      setDetailValue(track.detail);
      setIsEditingDetail(false);
    }
  };

  const handleDetailBlur = () => {
    onUpdateDetail(track.id, detailValue);
    setIsEditingDetail(false);
  };

  React.useEffect(() => {
    if (isEditingDetail && detailInputRef.current) {
      detailInputRef.current.focus();
      detailInputRef.current.select();
    }
  }, [isEditingDetail]);

  // Handle visibility toggle with history recording
  const handleToggleVisibility = () => {
    onToggleVisibility(track.id, !track.visible);
  };

  // Handle lock toggle with history recording
  const handleToggleLock = () => {
    onToggleLock(track.id, !track.locked);
  };

  return (
    <>
      <motion.div 
        className={`neu-track-header-redesigned ${isActive ? 'active' : ''}`}
        onClick={onSelect}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        data-track-id={track.id}
      >
        {/* Track Name Section */}
        <div className="track-name-section">
          <div className="track-name-display">
            {isEditing ? (
              <input
                ref={inputRef}
                type="text"
                value={nameValue}
                onChange={(e) => setNameValue(e.target.value)}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                className="track-name-input"
                placeholder="Name"
              />
            ) : (
              <span className="track-name" onDoubleClick={handleDoubleClick}>
                {track.name || '\u00A0' /* Non-breaking space to maintain height */}
              </span>
            )}

            {isEditingDetail ? (
              <input
                ref={detailInputRef}
                type="text"
                value={detailValue}
                onChange={(e) => setDetailValue(e.target.value)}
                onBlur={handleDetailBlur}
                onKeyDown={handleDetailKeyDown}
                className="track-detail-input"
                placeholder="Detail"
              />
            ) : (
              <span className="track-detail" onDoubleClick={handleDetailDoubleClick}>
                {track.detail}
              </span>
            )}
          </div>
        </div>

        {/* Track Controls - Always Visible */}
        <div className="track-controls">
          {/* Visibility Toggle */}
          <motion.button
            className={`track-control-btn visibility${track.visible ? ' active' : ''}`}
            onClick={handleToggleVisibility}
            title={track.visible ? "Hide track" : "Show track"}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {track.visible ? <Eye className="track-icon" /> : <EyeOff className="track-icon" />}
          </motion.button>

          {/* Lock Toggle */}
          <motion.button
            className={`track-control-btn lock${track.locked ? ' active' : ''}`}
            onClick={handleToggleLock}
            title={track.locked ? "Unlock track" : "Lock track"}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {track.locked ? <Lock className="track-icon" /> : <Unlock className="track-icon" />}
          </motion.button>

          {/* Delete Button - Disabled if last track */}
          <motion.button
            className={`track-control-btn delete ${isLastTrack ? 'disabled' : ''}`}
            onClick={handleDelete}
            title={isLastTrack ? "Cannot delete the last track" : "Delete track"}
            whileHover={!isLastTrack ? { scale: 1.05 } : {}}
            whileTap={!isLastTrack ? { scale: 0.95 } : {}}
            disabled={isLastTrack}
            style={{ 
              opacity: isLastTrack ? 0.5 : 1,
              cursor: isLastTrack ? 'not-allowed' : 'pointer'
            }}
          >
            <Trash2 className="track-icon" />
          </motion.button>
        </div>
      </motion.div>

      {/* Delete Confirmation Modal */}
      <TrackDeleteConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleConfirmDelete}
        track={track}
      />
    </>
  );
});

TrackHeader.displayName = 'TrackHeader';

export default TrackHeader;