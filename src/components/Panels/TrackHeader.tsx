import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Lock, Unlock, Trash2 } from 'lucide-react';
import { SubtitleTrack } from '../../types/project';

interface TrackHeaderProps {
  track: SubtitleTrack;
  isActive: boolean;
  onDelete: (id: string) => void;
  onRename: (id: string, name: string) => void;
  onToggleVisibility: (id: string, visible: boolean) => void;
  onToggleLock: (id: string, locked: boolean) => void;
}

export const TrackHeader: React.FC<TrackHeaderProps> = ({
  track,
  isActive,
  onDelete,
  onRename,
  onToggleVisibility,
  onToggleLock,
}) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [nameValue, setNameValue] = React.useState(track.name);
  const inputRef = React.useRef<HTMLInputElement>(null);

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
    if (window.confirm(`Delete track "${track.name}" and all its subtitles?`)) {
      onDelete(track.id);
    }
  };

  return (
    <motion.div 
      className={`neu-track-header-redesigned ${isActive ? 'active' : ''}`}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Track Color Indicator */}
      <div className="track-color-indicator">
        <div className="color-dot" style={{ backgroundColor: track.visible ? 'var(--neu-primary)' : 'var(--neu-text-muted)' }} />
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
          className={`track-control-btn visibility ${track.visible ? 'active' : ''}`}
          onClick={() => onToggleVisibility(track.id, !track.visible)}
          title={track.visible ? "Hide track" : "Show track"}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {track.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
        </motion.button>

        {/* Lock Toggle */}
        <motion.button
          className={`track-control-btn lock ${track.locked ? 'active' : ''}`}
          onClick={() => onToggleLock(track.id, !track.locked)}
          title={track.locked ? "Unlock track" : "Lock track"}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {track.locked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
        </motion.button>

        {/* Delete Button */}
        <motion.button
          className="track-control-btn delete"
          onClick={handleDelete}
          title="Delete track"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </motion.button>
      </div>

      {/* Active Track Indicator */}
      {isActive && (
        <motion.div 
          className="active-indicator"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.3 }}
        />
      )}
    </motion.div>
  );
};

export default TrackHeader;