import React from 'react';
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
  onToggleLock
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

  return (
    <div className={`neu-track-header ${isActive ? 'neu-track-header-active' : ''}`}>
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={nameValue}
          onChange={(e) => setNameValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="bg-transparent outline-none border-none w-full text-white"
        />
      ) : (
        <div className="neu-track-name flex-1" onDoubleClick={handleDoubleClick} title="Double-click to rename">
          {track.name}
        </div>
      )}

      <div className="neu-track-controls">
        <button 
          className="neu-track-control-btn" 
          title={track.visible ? "Hide track" : "Show track"} 
          onClick={() => onToggleVisibility(track.id, !track.visible)}
        >
          <span className="material-icons text-base">
            {track.visible ? 'visibility' : 'visibility_off'}
          </span>
        </button>

        <button 
          className="neu-track-control-btn" 
          title={track.locked ? "Unlock track" : "Lock track"} 
          onClick={() => onToggleLock(track.id, !track.locked)}
        >
          <span className="material-icons text-base">
            {track.locked ? 'lock' : 'lock_open'}
          </span>
        </button>

        <button 
          className="neu-track-control-btn text-red-400" 
          title="Delete track" 
          onClick={() => {
            if (window.confirm(`Delete track "${track.name}" and all its subtitles?`)) {
              onDelete(track.id);
            }
          }}
        >
          <span className="material-icons text-base">delete</span>
        </button>
      </div>
    </div>
  );
};

export default TrackHeader; 