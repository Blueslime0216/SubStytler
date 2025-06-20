import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { Plus, ZoomIn, ZoomOut, Grid, Layers, Film } from 'lucide-react';
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
          text: 'New scene',
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
          <div className="w-px h-6 bg-cinematic-gold" />
          <span className="caption-cinematic font-mono mt-3 text-cinematic-silver">
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
          className="absolute w-px h-full bg-border-subtle opacity-30"
          style={{ 
            left: x,
            transition: 'none'
          }}
        />
      );
    }
    
    return lines;
  };

  return (
    <div className="h-full flex flex-col timeline-cinematic">
      {/* 시네마틱 툴바 */}
      <div className="timeline-ruler-cinematic flex items-center justify-between p-6">
        <div className="flex items-center space-x-6">
          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={addNewSubtitle}
            className="btn-cinematic-primary flex items-center space-x-3 hover-cinematic"
          >
            <Plus className="w-5 h-5" />
            <span className="body-cinematic-primary">Add Scene</span>
          </motion.button>
          
          <div className="flex items-center space-x-3">
            <Grid className="w-5 h-5 text-cinematic-gold" />
            <span className="caption-cinematic text-cinematic-silver">Frame Grid</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-3">
            <Film className="w-5 h-5 text-cinematic-gold" />
            <span className="caption-cinematic text-cinematic-silver">Track 1</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleZoom('out')}
              className="btn-cinematic-icon"
            >
              <ZoomOut className="w-5 h-5" />
            </motion.button>
            
            <div className="px-4 py-2 rounded-lg bg-cinematic-panel border-2 border-cinematic-gold caption-cinematic font-mono text-cinematic-gold">
              {zoom.toFixed(1)}x
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleZoom('in')}
              className="btn-cinematic-icon"
            >
              <ZoomIn className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col">
        {/* 시네마틱 타임 룰러 */}
        <div className="h-20 timeline-ruler-cinematic relative overflow-hidden border-b-2 border-cinematic-gold">
          {renderTimeRuler()}
        </div>
        
        {/* 시네마틱 트랙 영역 */}
        <div className="timeline-track flex-1 relative overflow-hidden bg-bg-secondary">
          <div
            ref={containerRef}
            className="h-full relative cursor-pointer"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {renderFrameGrid()}
            
            {/* 시네마틱 자막들 */}
            {currentProject?.subtitles.map((subtitle) => {
              const left = timeToPixel(subtitle.startTime);
              const width = timeToPixel(subtitle.endTime) - left;
              
              if (left + width < 0 || left > (containerRef.current?.clientWidth || 0)) {
                return null;
              }
              
              return (
                <motion.div
                  key={subtitle.id}
                  className="subtitle-block-cinematic absolute h-12 cursor-move flex items-center px-5"
                  style={{
                    left: Math.max(0, left),
                    width: Math.max(32, width),
                    top: 80,
                    transition: 'none'
                  }}
                  whileHover={{ y: -3, scale: 1.02 }}
                  drag="x"
                  dragConstraints={{ 
                    left: -left, 
                    right: (containerRef.current?.clientWidth || 0) - left - width 
                  }}
                  dragTransition={{ power: 0, timeConstant: 0 }}
                >
                  <div className="body-cinematic-primary text-black font-semibold truncate">
                    {subtitle.spans[0]?.text || 'Empty scene'}
                  </div>
                </motion.div>
              );
            })}
            
            {/* 시네마틱 플레이헤드 */}
            <motion.div
              className="absolute top-0 w-1 h-full pointer-events-none z-20"
              style={{ 
                left: timeToPixel(currentTime),
                background: 'var(--gradient-gold)',
                transition: 'none'
              }}
              animate={{ opacity: [0.8, 1, 0.8] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div 
                className="absolute -top-4 -left-4 w-8 h-8 rotate-45 bg-cinematic-gold shadow-cinematic-glow"
                style={{ transition: 'none' }}
              />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};