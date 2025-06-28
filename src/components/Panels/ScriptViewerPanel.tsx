import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Edit, Trash2, Clock } from 'lucide-react';
import { useProjectStore } from '../../stores/projectStore';
import { useTimelineStore } from '../../stores/timelineStore';
import { useHistoryStore } from '../../stores/historyStore';

export const ScriptViewerPanel: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubtitleId, setSelectedSubtitleId] = useState<string | null>(null);
  
  const { currentProject, updateSubtitle, deleteSubtitle } = useProjectStore();
  const { setCurrentTime } = useTimelineStore();

  const filteredSubtitles = currentProject?.subtitles.filter(subtitle =>
    subtitle.spans.some(span => 
      span.text.toLowerCase().includes(searchTerm.toLowerCase())
    )
  ) || [];

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const milliseconds = Math.floor((ms % 1000) / 10);
    
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
  };

  const jumpToSubtitle = (startTime: number) => {
    setCurrentTime(startTime);
  };

  const handleTextEdit = (subtitleId: string, newText: string) => {
    // 🆕 Record state before editing
    const { currentProject } = useProjectStore.getState();
    if (currentProject) {
      useHistoryStore.getState().record(
        { 
          project: {
            subtitles: [...currentProject.subtitles],
            selectedSubtitleId
          }
        },
        'Before editing subtitle text in script viewer',
        true // Mark as internal
      );
    }
    
    const subtitle = currentProject?.subtitles.find(s => s.id === subtitleId);
    if (subtitle) {
      const updatedSpans = [...subtitle.spans];
      if (updatedSpans[0]) {
        updatedSpans[0] = {
          ...updatedSpans[0],
          text: newText
        };
      }
      updateSubtitle(subtitleId, { spans: updatedSpans });
      
      // 🆕 Record state after editing
      setTimeout(() => {
        const { currentProject } = useProjectStore.getState();
        if (currentProject) {
          useHistoryStore.getState().record(
            { 
              project: {
                subtitles: currentProject.subtitles,
                selectedSubtitleId
              }
            },
            'Edited subtitle text in script viewer'
          );
        }
      }, 0);
    }
  };

  const handleTimeEdit = (subtitleId: string, field: 'start' | 'end', value: string) => {
    // 🆕 Record state before editing
    const { currentProject } = useProjectStore.getState();
    if (currentProject) {
      useHistoryStore.getState().record(
        { 
          project: {
            subtitles: [...currentProject.subtitles],
            selectedSubtitleId
          }
        },
        'Before editing subtitle timing in script viewer',
        true // Mark as internal
      );
    }
    
    const subtitle = currentProject?.subtitles.find(s => s.id === subtitleId);
    if (subtitle) {
      const [minutes, rest] = value.split(':');
      const [seconds, milliseconds] = rest ? rest.split('.') : ['0', '0'];
      
      const timeMs = (parseInt(minutes) * 60 + parseInt(seconds)) * 1000 + parseInt(milliseconds) * 10;
      
      if (field === 'start') {
        updateSubtitle(subtitleId, { 
          startTime: timeMs,
          spans: subtitle.spans.map(span => ({ ...span, startTime: timeMs }))
        });
      } else {
        updateSubtitle(subtitleId, { 
          endTime: timeMs,
          spans: subtitle.spans.map(span => ({ ...span, endTime: timeMs }))
        });
      }
      
      // 🆕 Record state after editing
      setTimeout(() => {
        const { currentProject } = useProjectStore.getState();
        if (currentProject) {
          useHistoryStore.getState().record(
            { 
              project: {
                subtitles: currentProject.subtitles,
                selectedSubtitleId
              }
            },
            `Adjusted subtitle ${field === 'start' ? 'start' : 'end'} time in script viewer`
          );
        }
      }, 0);
    }
  };

  const handleDeleteSubtitle = (subtitleId: string) => {
    // 🆕 Record state before deleting
    const { currentProject } = useProjectStore.getState();
    if (currentProject) {
      const subtitleToDelete = currentProject.subtitles.find(s => s.id === subtitleId);
      if (!subtitleToDelete) return;
      
      useHistoryStore.getState().record(
        { 
          project: {
            subtitles: [...currentProject.subtitles],
            selectedSubtitleId
          }
        },
        'Before deleting subtitle from script viewer',
        true // Mark as internal
      );
      
      deleteSubtitle(subtitleId);
      
      // 🆕 Record state after deleting
      setTimeout(() => {
        const { currentProject } = useProjectStore.getState();
        if (currentProject) {
          useHistoryStore.getState().record(
            { 
              project: {
                subtitles: currentProject.subtitles,
                selectedSubtitleId: null
              }
            },
            `Deleted subtitle at ${formatTime(subtitleToDelete.startTime)} from script viewer`
          );
        }
      }, 0);
    }
  };

  const getStyledText = (subtitle: any) => {
    const span = subtitle.spans[0] || { text: '' };
    const text = span.text || '';
    const isBold = span.isBold || false;
    const isItalic = span.isItalic || false;
    const isUnderline = span.isUnderline || false;
    
    return (
      <span 
        style={{
          fontWeight: isBold ? 'bold' : 'normal',
          fontStyle: isItalic ? 'italic' : 'normal',
          textDecoration: isUnderline ? 'underline' : 'none'
        }}
      >
        {text}
      </span>
    );
  };

  return (
    <div className="neu-script-viewer-panel h-full flex flex-col">
      {/* Search Bar */}
      <div className="neu-panel-header">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 neu-text-secondary" />
          <input
            type="text"
            placeholder="Search subtitles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 neu-input text-xs"
          />
        </div>
      </div>

      {/* Subtitle List */}
      <div className="flex-1 overflow-y-auto">
        {filteredSubtitles.length === 0 ? (
          <div className="h-full flex items-center justify-center neu-text-secondary">
            <p className="text-sm">No subtitles found</p>
          </div>
        ) : (
          <div className="p-2 space-y-2">
            {filteredSubtitles.map((subtitle, index) => (
              <motion.div
                key={subtitle.id}
                className="neu-card p-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    {/* Timing */}
                    <div className="flex items-center space-x-2 text-xs">
                      <Clock className="w-3 h-3 neu-text-secondary" />
                      <input
                        type="text"
                        value={formatTime(subtitle.startTime)}
                        onChange={(e) => handleTimeEdit(subtitle.id, 'start', e.target.value)}
                        className="neu-input text-xs w-16"
                      />
                      <span className="neu-text-secondary">→</span>
                      <input
                        type="text"
                        value={formatTime(subtitle.endTime)}
                        onChange={(e) => handleTimeEdit(subtitle.id, 'end', e.target.value)}
                        className="neu-input text-xs w-16"
                      />
                      <motion.button
                        onClick={() => jumpToSubtitle(subtitle.startTime)}
                        className="neu-btn-small px-2 py-1 text-xs"
                      >
                        Jump
                      </motion.button>
                    </div>
                    
                    {/* Text */}
                    <textarea
                      value={subtitle.spans[0]?.text || ''}
                      onChange={(e) => handleTextEdit(subtitle.id, e.target.value)}
                      className="w-full neu-input text-xs resize-none"
                      rows={2}
                      style={{
                        fontWeight: subtitle.spans[0]?.isBold ? 'bold' : 'normal',
                        fontStyle: subtitle.spans[0]?.isItalic ? 'italic' : 'normal',
                        textDecoration: subtitle.spans[0]?.isUnderline ? 'underline' : 'none'
                      }}
                    />
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center space-x-1 ml-3">
                    <motion.button
                      onClick={() => setSelectedSubtitleId(
                        selectedSubtitleId === subtitle.id ? null : subtitle.id
                      )}
                      className="neu-btn-icon p-1"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </motion.button>
                    
                    <motion.button
                      onClick={() => handleDeleteSubtitle(subtitle.id)}
                      className="neu-btn-icon p-1"
                      style={{ color: 'var(--neu-error)' }}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};