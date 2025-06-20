import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { Plus, ZoomIn, ZoomOut, Clock, Cog, Gauge } from 'lucide-react';
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
          <div className="w-px h-4 bg-copper-main" />
          <span className="font-mono text-xs text-muted mt-1">
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
          className="absolute w-px h-full bg-bronze-main opacity-20"
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
    <div className="h-full flex flex-col timeline-steampunk relative">
      {/* 장식용 기어들 */}
      <div className="absolute top-2 left-2 z-10">
        <Cog className="w-3 h-3 text-brass gear opacity-30" />
      </div>
      <div className="absolute top-1 right-4 z-10">
        <Cog className="w-2 h-2 text-copper gear-reverse opacity-25" />
      </div>
      
      {/* 툴바 */}
      <div className="timeline-ruler-steampunk flex items-center justify-between p-3 relative">
        {/* 파이프 장식 */}
        <div className="pipe-decoration top-0 left-8 w-16 h-1"></div>
        <div className="pipe-decoration bottom-0 right-12 w-12 h-1"></div>
        
        <div className="flex items-center space-x-3 relative z-10">
          <motion.button
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            onClick={addNewSubtitle}
            className="btn-steampunk-small flex items-center space-x-2"
          >
            <Plus className="w-3 h-3" />
            <span>Add Subtitle</span>
          </motion.button>
          
          <div className="flex items-center space-x-2">
            <Clock className="w-3 h-3 text-brass" />
            <span className="font-mono text-xs text-muted">Timeline</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-3 relative z-10">
          <div className="flex items-center space-x-2">
            <Gauge className="w-3 h-3 text-brass pressure-gauge" />
            <span className="font-mono text-xs text-muted">Track 1</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleZoom('out')}
              className="btn-steampunk-icon p-1"
            >
              <ZoomOut className="w-3 h-3" />
            </motion.button>
            
            <div className="px-2 py-1 rounded bg-surface border border-copper-main font-mono text-xs">
              {zoom.toFixed(1)}x
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleZoom('in')}
              className="btn-steampunk-icon p-1"
            >
              <ZoomIn className="w-3 h-3" />
            </motion.button>
          </div>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col">
        {/* 시간 눈금자 */}
        <div className="h-12 timeline-ruler-steampunk relative overflow-hidden">
          {renderTimeRuler()}
        </div>
        
        {/* 트랙 영역 */}
        <div className="flex-1 relative overflow-hidden bg-panel">
          <div
            ref={containerRef}
            className="h-full relative cursor-pointer"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {renderFrameGrid()}
            
            {/* 자막 블록들 */}
            {currentProject?.subtitles.map((subtitle) => {
              const left = timeToPixel(subtitle.startTime);
              const width = timeToPixel(subtitle.endTime) - left;
              
              if (left + width < 0 || left > (containerRef.current?.clientWidth || 0)) {
                return null;
              }
              
              return (
                <motion.div
                  key={subtitle.id}
                  className="subtitle-block-steampunk absolute h-8 cursor-move flex items-center px-3 relative overflow-hidden"
                  style={{
                    left: Math.max(0, left),
                    width: Math.max(24, width),
                    top: 40,
                    transition: 'none'
                  }}
                  whileHover={{ y: -2 }}
                  drag="x"
                  dragConstraints={{ 
                    left: -left, 
                    right: (containerRef.current?.clientWidth || 0) - left - width 
                  }}
                  dragTransition={{ power: 0, timeConstant: 0 }}
                >
                  <div className="font-body text-xs text-workshop font-medium truncate relative z-10">
                    {subtitle.spans[0]?.text || 'Empty subtitle'}
                  </div>
                  <div className="absolute inset-0 texture-metal opacity-20"></div>
                </motion.div>
              );
            })}
            
            {/* 플레이헤드 */}
            <motion.div
              className="absolute top-0 w-0.5 h-full pointer-events-none z-20 bg-brass-main"
              style={{ 
                left: timeToPixel(currentTime),
                transition: 'none',
                boxShadow: '0 0 8px rgba(218, 165, 32, 0.6)'
              }}
              animate={{ opacity: [0.8, 1, 0.8] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div 
                className="absolute -top-2 -left-2 w-4 h-4 rotate-45 bg-brass border border-brass-dark"
                style={{ transition: 'none' }}
              />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};