import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Lock, Unlock, Trash2 } from 'lucide-react';
import { SubtitleTrack } from '../../types/project';
import { useProjectStore } from '../../stores/projectStore';

interface TrackHeaderProps {
  track: SubtitleTrack;
  isActive: boolean;
  onSelect: () => void;
  onDelete: (id: string) => void;
  onRename: (id: string, name: string) => void;
  onToggleVisibility: (id: string, visible: boolean) => void;
  onToggleLock: (id: string, locked: boolean) => void;
}

export const TrackHeader: React.FC<TrackHeaderProps> = ({
  track,
  isActive,
  onSelect,
  onDelete,
  onRename,
  onToggleVisibility,
  onToggleLock,
}) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [nameValue, setNameValue] = React.useState(track.name);
  const inputRef = React.useRef<HTMLInputElement>(null);
  
  // Get current project to check track count
  const { currentProject } = useProjectStore();
  const isLastTrack = currentProject?.tracks.length === 1;

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
    
    if (window.confirm(`Delete track "${track.name}" and all its subtitles?`)) {
      onDelete(track.id);
    }
  };

  return (
    <motion.div 
      className={`neu-track-header-redesigned ${isActive ? 'active' : ''}`}
      onClick={onSelect}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Track Color Indicator */}
      <div className="track-color-indicator">
        <div className={`color-dot${track.visible ? '' : ' color-dot-inactive'}`} />
      </div>

      {/* Track Name Section */}
      <div className="track-name-section">
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={nameValue}
            onChange={(e) => setNameValue(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className="track-name-input"
            placeholder="Track name..."
          />
        ) : (
          <div className="track-name-display" onDoubleClick={handleDoubleClick}>
            <span className="track-name">{track.name}</span>
            <span className="track-language">{track.language.toUpperCase()}</span>
          </div>
        )}
      </div>

      {/* Track Controls - Always Visible */}
      <div className="track-controls">
        {/* Visibility Toggle */}
        <motion.button
          className={`track-control-btn visibility${track.visible ? ' active' : ''}`}
          onClick={() => onToggleVisibility(track.id, !track.visible)}
          title={track.visible ? "Hide track" : "Show track"}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {track.visible ? <Eye className="track-icon" /> : <EyeOff className="track-icon" />}
        </motion.button>

        {/* Lock Toggle */}
        <motion.button
          className={`track-control-btn lock${track.locked ? ' active' : ''}`}
          onClick={() => onToggleLock(track.id, !track.locked)}
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
  );
};

export default TrackHeader;