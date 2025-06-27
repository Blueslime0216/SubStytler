import React from 'react';
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
    <div className={`track-header ${isActive ? 'active' : ''}`}>
      <div className="flex items-center flex-1 min-w-0">
        <div className="w-3 h-3 rounded-full bg-blue-500 mr-3 flex-shrink-0" />
        
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <input
              ref={inputRef}
              type="text"
              value={nameValue}
              onChange={(e) => setNameValue(e.target.value)}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              className="input input-sm w-full"
              placeholder="Track name..."
            />
          ) : (
            <div onDoubleClick={handleDoubleClick} className="cursor-pointer">
              <div className="track-name truncate">{track.name}</div>
              <div className="text-xs text-gray-500 uppercase">{track.language}</div>
            </div>
          )}
        </div>
      </div>

      <div className="track-controls">
        <button
          className={`track-control-btn ${track.visible ? 'active' : ''}`}
          onClick={() => onToggleVisibility(track.id, !track.visible)}
          title={track.visible ? "Hide track" : "Show track"}
        >
          {track.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
        </button>

        <button
          className={`track-control-btn ${track.locked ? 'active' : ''}`}
          onClick={() => onToggleLock(track.id, !track.locked)}
          title={track.locked ? "Unlock track" : "Lock track"}
        >
          {track.locked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
        </button>

        <button
          className="track-control-btn text-red-600"
          onClick={handleDelete}
          title="Delete track"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

export default TrackHeader;