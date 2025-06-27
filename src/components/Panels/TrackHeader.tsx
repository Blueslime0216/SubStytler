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
    <div className={`h-12 px-3 py-2 border-b border-border bg-surface-elevated flex items-center transition-colors ${
      isActive ? 'bg-primary bg-opacity-10 border-l-2 border-l-primary' : 'hover:bg-surface'
    }`}>
      <div className="flex items-center flex-1 min-w-0">
        <div className="w-3 h-3 rounded-full bg-primary mr-3 flex-shrink-0 shadow-outset" />
        
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <input
              ref={inputRef}
              type="text"
              value={nameValue}
              onChange={(e) => setNameValue(e.target.value)}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              className="w-full bg-surface border border-border rounded px-2 py-1 text-sm shadow-inset focus:border-primary focus:shadow-focus"
              placeholder="Track name..."
            />
          ) : (
            <div onDoubleClick={handleDoubleClick} className="cursor-pointer">
              <div className="text-sm font-medium text-text-primary truncate">{track.name}</div>
              <div className="text-xs text-text-secondary uppercase">{track.language}</div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 ml-2">
        <button
          className={`w-6 h-6 flex items-center justify-center rounded border border-border shadow-outset transition-all hover:shadow-hover ${
            track.visible ? 'bg-surface text-text-primary' : 'bg-surface text-text-muted'
          }`}
          onClick={() => onToggleVisibility(track.id, !track.visible)}
          title={track.visible ? "Hide track" : "Show track"}
        >
          {track.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
        </button>

        <button
          className={`w-6 h-6 flex items-center justify-center rounded border border-border shadow-outset transition-all hover:shadow-hover ${
            track.locked ? 'bg-warning text-white' : 'bg-surface text-text-primary'
          }`}
          onClick={() => onToggleLock(track.id, !track.locked)}
          title={track.locked ? "Unlock track" : "Lock track"}
        >
          {track.locked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
        </button>

        <button
          className="w-6 h-6 flex items-center justify-center rounded border border-border shadow-outset transition-all hover:shadow-hover bg-surface text-error hover:bg-error hover:text-white"
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