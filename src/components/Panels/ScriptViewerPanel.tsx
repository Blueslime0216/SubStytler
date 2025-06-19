import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Edit, Trash2, Clock } from 'lucide-react';
import { useProjectStore } from '../../stores/projectStore';
import { useTimelineStore } from '../../stores/timelineStore';

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
    const subtitle = currentProject?.subtitles.find(s => s.id === subtitleId);
    if (subtitle) {
      const updatedSpans = [...subtitle.spans];
      if (updatedSpans[0]) {
        updatedSpans[0].text = newText;
      }
      updateSubtitle(subtitleId, { spans: updatedSpans });
    }
  };

  const handleTimeEdit = (subtitleId: string, field: 'start' | 'end', value: string) => {
    const subtitle = currentProject?.subtitles.find(s => s.id === subtitleId);
    if (subtitle) {
      // Parse time string (mm:ss.ms format)
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
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Search Bar */}
      <div className="p-3 bg-gray-800 border-b border-gray-700">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search subtitles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Subtitle List */}
      <div className="flex-1 overflow-y-auto">
        {filteredSubtitles.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-400">
            <p>No subtitles found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-700">
            {filteredSubtitles.map((subtitle, index) => (
              <motion.div
                key={subtitle.id}
                className="p-4 hover:bg-gray-800 transition-colors"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    {/* Timing */}
                    <div className="flex items-center space-x-2 text-xs">
                      <Clock className="w-3 h-3 text-gray-400" />
                      <input
                        type="text"
                        value={formatTime(subtitle.startTime)}
                        onChange={(e) => handleTimeEdit(subtitle.id, 'start', e.target.value)}
                        className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-gray-300 w-20"
                      />
                      <span className="text-gray-500">→</span>
                      <input
                        type="text"
                        value={formatTime(subtitle.endTime)}
                        onChange={(e) => handleTimeEdit(subtitle.id, 'end', e.target.value)}
                        className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-gray-300 w-20"
                      />
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => jumpToSubtitle(subtitle.startTime)}
                        className="px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs transition-colors"
                      >
                        Jump
                      </motion.button>
                    </div>
                    
                    {/* Text */}
                    <textarea
                      value={subtitle.spans[0]?.text || ''}
                      onChange={(e) => handleTextEdit(subtitle.id, e.target.value)}
                      className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      rows={2}
                    />
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center space-x-1 ml-3">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setSelectedSubtitleId(
                        selectedSubtitleId === subtitle.id ? null : subtitle.id
                      )}
                      className="p-1 rounded hover:bg-gray-600 transition-colors"
                    >
                      <Edit className="w-4 h-4 text-gray-400" />
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => deleteSubtitle(subtitle.id)}
                      className="p-1 rounded hover:bg-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-gray-400" />
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