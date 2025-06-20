import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { Plus, ZoomIn, ZoomOut, Grid, Layers } from 'lucide-react';
import { useTimelineStore } from '../../stores/timelineStore';
import { useProjectStore } from '../../stores/projectStore';
import { formatTime } from '../../utils/timeUtils';
import { useTimelineInteraction } from '../../hooks/useTimelineInteraction';

export const SubtitleTimelinePanel: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { 
    currentTime, 
    duration, 
    fps, 
    zoom, 
    viewStart, 
    viewEnd,
    setZoom,
    setViewRange,
  } = useTimelineStore();
  
  const { currentProject, addSubtitle } = useProjectStore();
  const { isDragging, handleMouseDown, handleMouseMove, handleMouseUp } = useTimelineInteraction(containerRef);

  const handleZoom = (direction: 'in' | 'out') => {
    const newZoom = direction === 'in' ? zoom * 1.5 : zoom / 1.5;
    setZoom(newZoom);
    
    const center = currentTime;
    const currentViewDuration = viewEnd - viewStart;
    const newViewDuration = currentViewDuration / (direction === 'in' ? 1.5 : 1 / 1.5);
    
    const newStart = Math.max(0, center - newViewDuration / 2);
    const newEnd = Math.min(duration, center + newViewDuration / 2);
    
    setViewRange(newStart, newEnd);
  };

  const addNewSubtitle = () => {
    if (currentProject) {
      const newSubtitle = {
        id: crypto.randomUUID(),
        spans: [{
          id: crypto.randomUUID(),
          text: 'New subtitle',
          startTime: currentTime,
          endTime: currentTime + 2000
        }],
        startTime: currentTime,
        endTime: currentTime + 2000,
        trackId: 'default'
      };
      addSubtitle(newSubtitle);
    }
  };

  const timeToPixel = (time: number) => {
    if (!containerRef.current) return 0;
    const containerWidth = containerRef.current.clientWidth;
    const viewDuration = viewEnd - viewStart;
    return ((time - viewStart) / viewDuration) * containerWidth;
  };

  const renderTimeRuler = () => {
    const steps = [];
    const pixelsPerSecond = timeToPixel(viewStart + 1000) - timeToPixel(viewStart);
    const step = pixelsPerSecond < 50 ? 5000 : pixelsPerSecond < 100 ? 2000 : 1000;
    
    for (let time = Math.floor(viewStart / step) * step; time <= viewEnd; time += step) {
      const x = timeToPixel(time);
      if (x < 0 || x > (containerRef.current?.clientWidth || 0)) continue;
      
      steps.push(
        <div
          key={time}
          className="absolute flex flex-col items-center"
          style={{ left: x }}
        >
          <div className="w-px h-4 neu-text-secondary" />
          <span className="neu-caption font-mono mt-1">
            {formatTime(time, fps)}
          </span>
        </div>
      );
    }
    
    return steps;
  };

  const renderFrameGrid = () => {
    const lines = [];
    const frameDuration = 1000 / fps;
    const startFrame = Math.floor(viewStart / frameDuration);
    const endFrame = Math.ceil(viewEnd / frameDuration);
    
    for (let frame = startFrame; frame <= endFrame; frame++) {
      const time = frame * frameDuration;
      const x = timeToPixel(time);
      
      if (x < 0 || x > (containerRef.current?.clientWidth || 0)) continue;
      
      lines.push(
        <div
          key={frame}
          className="absolute w-px h-full neu-frame-grid-line"
          style={{ 
            left: x,
            background: 'var(--neu-text-muted)',
            transition: 'none'
          }}
        />
      );
    }
    
    return lines;
  };

  return (
    <div className="h-full flex flex-col neu-timeline">
      {/* Enhanced Toolbar */}
      <div className="neu-timeline-ruler flex items-center justify-between p-4">
        <div className="flex items-center space-x-4">
          <motion.button
            onClick={addNewSubtitle}
            className="neu-btn-primary flex items-center space-x-2 neu-interactive"
            title="Add new subtitle at current time"
          >
            <Plus className="w-4 h-4" />
            <span className="font-semibold">Add Subtitle</span>
          </motion.button>
          
          <div className="flex items-center space-x-3 neu-card-small px-3 py-2">
            <Grid className="w-4 h-4 neu-text-secondary" />
            <span className="neu-caption font-semibold">Frame Grid</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3 neu-card-small px-3 py-2">
            <Layers className="w-4 h-4 neu-text-secondary" />
            <span className="neu-caption font-semibold neu-clickable" title="Track settings">Track 1</span>
          </div>
          
          <div className="flex items-center space-x-3">
            <motion.button
              onClick={() => handleZoom('out')}
              className="neu-btn-icon p-2 neu-interactive"
              title="Zoom out timeline"
            >
              <ZoomOut className="w-4 h-4" />
            </motion.button>
            
            <div className="neu-card-small px-3 py-2 neu-caption font-mono font-semibold min-w-[60px] text-center">
              {zoom.toFixed(1)}x
            </div>
            
            <motion.button
              onClick={() => handleZoom('in')}
              className="neu-btn-icon p-2 neu-interactive"
              title="Zoom in timeline"
            >
              <ZoomIn className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col">
        {/* Time Ruler */}
        <div className="h-14 neu-timeline-ruler relative overflow-hidden">
          {renderTimeRuler()}
        </div>
        
        {/* Track Area */}
        <div className="neu-timeline-track flex-1 relative overflow-hidden">
          <div
            ref={containerRef}
            className="h-full relative cursor-pointer neu-interactive"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            title="Click to seek, drag to scrub"
          >
            {renderFrameGrid()}
            
            {/* Subtitles */}
            {currentProject?.subtitles.map((subtitle) => {
              const left = timeToPixel(subtitle.startTime);
              const width = timeToPixel(subtitle.endTime) - left;
              
              if (left + width < 0 || left > (containerRef.current?.clientWidth || 0)) {
                return null;
              }
              
              return (
                <motion.div
                  key={subtitle.id}
                  className="neu-subtitle-block absolute h-10 cursor-move flex items-center px-4 neu-interactive"
                  style={{
                    left: Math.max(0, left),
                    width: Math.max(32, width),
                    top: 60,
                    transition: 'none'
                  }}
                  drag="x"
                  dragConstraints={{ 
                    left: -left, 
                    right: (containerRef.current?.clientWidth || 0) - left - width 
                  }}
                  dragTransition={{ power: 0, timeConstant: 0 }}
                  title={`${subtitle.spans[0]?.text || 'Empty subtitle'} - Click and drag to move`}
                  tabIndex={0}
                >
                  <div className="text-sm text-white font-semibold truncate">
                    {subtitle.spans[0]?.text || 'Empty subtitle'}
                  </div>
                </motion.div>
              );
            })}
            
            {/* Enhanced Playhead */}
            <motion.div
              className="absolute top-0 w-1 h-full pointer-events-none z-20 neu-playhead"
              style={{ 
                left: timeToPixel(currentTime),
                background: 'var(--neu-primary)',
                transition: 'none'
              }}
              animate={{ opacity: [0.8, 1, 0.8] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div 
                className="absolute -top-3 -left-3 w-6 h-6 rotate-45 neu-shadow-1"
                style={{ 
                  background: 'var(--neu-primary)',
                  transition: 'none'
                }}
              />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};