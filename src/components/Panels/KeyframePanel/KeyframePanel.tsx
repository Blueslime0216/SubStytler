import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { useSelectedSubtitleStore } from '../../../stores/selectedSubtitleStore';
import { useProjectStore } from '../../../stores/projectStore';
import { useTimelineStore } from '../../../stores/timelineStore';
import { useSnapStore } from '../../../stores/snapStore';
import { useLayoutStore } from '../../../stores/layoutStore';
import { ContextMenu } from '../../UI/ContextMenu/ContextMenu';
import { ContextMenuItem } from '../../UI/ContextMenu/ContextMenuItem';
import { ContextMenuDivider } from '../../UI/ContextMenu/ContextMenuItem';
import TimelineRuler from '../TimelineRuler';
import { useTimelineInteraction } from '../../../hooks/useTimelineInteraction';
import { formatTime, snapToTimelineGrid } from '../../../utils/timeUtils';
import { Trash2, Plus, Copy, ArrowLeft, ArrowRight } from 'lucide-react';
import { shallow } from 'zustand/shallow';

const ROW_HEIGHT = 28;
const KEYFRAME_SIZE = 12;

// Helper to clamp value between min and max
const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

const KeyframePanel: React.FC = () => {
  const snapEnabled = useSnapStore((s) => s.enabled);
  const toggleSnap = useSnapStore((s) => s.toggle);

  // Context menu states
  const [menuState, setMenuState] = useState<{ open: boolean; x: number; y: number }>({ open: false, x: 0, y: 0 });
  const [kfMenu, setKfMenu] = useState<{
    open: boolean;
    x: number;
    y: number;
    property: string;
    time: number;
  } | null>(null);

  // Get selected subtitle data
  const subtitleId = useSelectedSubtitleStore((s) => s.selectedSubtitleId);
  const { selectedKeyframe, setSelectedKeyframe } = useSelectedSubtitleStore();
  const subtitles = useProjectStore((s) => s.currentProject?.subtitles, shallow);
  const subtitle = useMemo(() => {
    if (!subtitles || !subtitleId) return null;
    return subtitles.find((sub) => sub.id === subtitleId);
  }, [subtitles, subtitleId]);
  const animations = useMemo(() => {
    return subtitle?.spans[0]?.animations ?? [];
  }, [subtitle]);

  // Timeline store access
  const timeline = useTimelineStore();
  const {
    duration,
    fps,
    currentTime,
    setCurrentTime,
    isDragging,
    draggedSubtitleId,
    draggedSubtitleDelta,
  } = useTimelineStore();

  // Project store actions
  const moveKeyframeWithCollision = useProjectStore((s: any) => s.moveKeyframeWithCollision);
  const deleteKeyframe = useProjectStore((s: any) => s.deleteKeyframe);
  const replaceKeyframe = useProjectStore((s: any) => s.replaceKeyframe);

  // Container dimensions
  const [containerWidth, setContainerWidth] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Local zoom/view window
  const [localZoom, setLocalZoom] = useState(timeline.zoom);
  const [localViewStart, setLocalViewStart] = useState(timeline.viewStart);
  const [localViewEnd, setLocalViewEnd] = useState(timeline.viewEnd);

  // 선택된 키프레임 (Delete 키로 삭제하기 위함) - 로컬 상태 제거하고 전역 상태 사용

  // Update container dimensions on resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
        setContainerHeight(containerRef.current.clientHeight);
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    
    // Create a ResizeObserver to detect container size changes
    const resizeObserver = new ResizeObserver(updateDimensions);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      window.removeEventListener('resize', updateDimensions);
      resizeObserver.disconnect();
    };
  }, []);

  // Keep in sync with global timeline
  useEffect(() => {
    setLocalZoom(timeline.zoom);
    setLocalViewStart(timeline.viewStart);
    setLocalViewEnd(timeline.viewEnd);
  }, [timeline.zoom, timeline.viewStart, timeline.viewEnd]);

  // Helper setters that update both local and global
  const setViewRange = (s: number, e: number) => {
    setLocalViewStart(s);
    setLocalViewEnd(e);
    timeline.setViewRange(s, e);
  };

  const setZoom = (z: number) => {
    setLocalZoom(z);
    timeline.setZoom(z);
  };

  // Interaction hook for timeline navigation
  const { handleMouseDown, handleMouseMove, handleMouseUp, handleWheel } = useTimelineInteraction(containerRef, {
    zoom: localZoom,
    setZoom,
    viewStart: localViewStart,
    viewEnd: localViewEnd,
    setViewRange,
  });

  // Drag state for keyframes
  const dragRef = useRef<{ 
    property: string;
    originalTime: number;
    element: HTMLElement | null;
    startX: number;
    dragged: boolean;
    currentTime: number; // 드래그 중인 현재 시간
  } | null>(null);

  // Row highlight when dragging a curve over it
  const [highlightRow, setHighlightRow] = useState<string | null>(null);
  
  // Keyframe being created
  const [creatingKeyframe, setCreatingKeyframe] = useState<{property: string, time: number} | null>(null);
  
  // 드래그 중일 때 컴포넌트 리렌더링을 위한 상태
  const [dragUpdate, setDragUpdate] = useState(0);

  const getWidth = () => containerRef.current?.clientWidth || 0;

  const timeToPixel = useCallback((time: number): number => {
    const w = getWidth();
    if (!w) return 0;
    const viewDuration = localViewEnd - localViewStart;
    if (viewDuration === 0) return 0;
    return ((time - localViewStart) / viewDuration) * w;
  }, [localViewStart, localViewEnd]);

  // Helper to convert x position to time
  const pixelToTime = useCallback((pixel: number): number => {
    const w = getWidth();
    if (!w) return 0;
    const viewDuration = localViewEnd - localViewStart;
    return localViewStart + (pixel / w) * viewDuration;
  }, [localViewStart, localViewEnd]);

  // Handle keyframe drag start
  const handleKfMouseDown = (
    e: React.MouseEvent<HTMLDivElement>,
    property: string,
    time: number,
  ) => {
    e.stopPropagation();
    dragRef.current = { 
      property, 
      originalTime: time,
      element: e.currentTarget,
      startX: e.clientX,
      dragged: false,
      currentTime: time, // 초기 현재 시간 설정
    };
    
    // Add visual feedback class
    e.currentTarget.classList.add('dragging');

    // Set up global event listeners for dragging
    const onMouseMove = (ev: MouseEvent) => {
      if (!dragRef.current || !containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const relX = clamp(ev.clientX - rect.left, 0, rect.width);
      let newTime = pixelToTime(relX);
      
      if (snapEnabled && containerRef.current) {
        const width = containerRef.current.clientWidth;
        newTime = snapToTimelineGrid(newTime, localViewStart, localViewEnd, width, fps);
      }
      
      // Mark as dragged if moved more than 2px
      if (!dragRef.current.dragged && Math.abs(ev.clientX - dragRef.current.startX) > 2) {
        dragRef.current.dragged = true;
      }

      // 드래그 중인 현재 시간 업데이트
      dragRef.current.currentTime = newTime;

      // 드래그가 실제로 발생한 경우에만 style.left를 조작
      if (dragRef.current.dragged && dragRef.current.element) {
        dragRef.current.element.style.left = `${timeToPixel(newTime)}px`;
      }
      
      // 드래그 중일 때마다 컴포넌트 리렌더링을 위한 상태 업데이트
      if (dragRef.current.dragged) {
        setDragUpdate(prev => prev + 1);
      }
    };

    const onMouseUp = (ev: MouseEvent) => {
      if (!dragRef.current || !containerRef.current) return;
      
      // Remove visual feedback class 및 style.left 초기화
      if (dragRef.current.element) {
        dragRef.current.element.classList.remove('dragging');
        // 드래그 동안 style.left를 임시로 조작한 경우에만 원복
        if (dragRef.current.dragged) {
          dragRef.current.element.style.left = '';
        }
      }
      
      const rect = containerRef.current.getBoundingClientRect();
      const relX = clamp(ev.clientX - rect.left, 0, rect.width);
      let newTime = pixelToTime(relX);
      
      if (snapEnabled && containerRef.current) {
        const width = containerRef.current.clientWidth;
        newTime = snapToTimelineGrid(newTime, localViewStart, localViewEnd, width, fps);
      }

      if (dragRef.current.dragged && subtitleId && Math.abs(newTime - dragRef.current.originalTime) > 1) {
        // 충돌 처리 포함 이동을 단일 히스토리 단계로 처리
        moveKeyframeWithCollision(subtitleId, dragRef.current.property, dragRef.current.originalTime, newTime);
        // 키프레임 이동 후 연결선 재계산을 위한 강제 리렌더링
        setDragUpdate(prev => prev + 1);
      }

      dragRef.current = null;
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('contextmenu', onContextMenuCancel);
    };

    // 우클릭으로 드래그 취소
    const onContextMenuCancel = (ev: MouseEvent) => {
      ev.preventDefault();
      if (!dragRef.current) return;
      
      // 원래 위치로 되돌리기
      if (dragRef.current.element) {
        dragRef.current.element.classList.remove('dragging');
        dragRef.current.element.style.left = '';
      }
      
      dragRef.current = null;
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('contextmenu', onContextMenuCancel);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    document.addEventListener('contextmenu', onContextMenuCancel);
  };

  // Handle row click to add keyframe
  const handleRowClick = (e: React.MouseEvent, property: string) => {
    if (e.target !== e.currentTarget) return; // Only handle clicks on the row itself
    
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = e.clientX - rect.left;
    let time = pixelToTime(relX);
    
    if (snapEnabled && containerRef.current) {
      const width = containerRef.current.clientWidth;
      time = snapToTimelineGrid(time, localViewStart, localViewEnd, width, fps);
    }
    
    setCreatingKeyframe({property, time});
  };
  
  // Handle keyframe creation confirmation
  const handleAddKeyframe = () => {
    if (!creatingKeyframe || !subtitleId) return;
    
    const { property, time } = creatingKeyframe;
    
    // Get current value from subtitle (dynamic property access)
    const value = subtitle?.spans[0] ? (subtitle.spans[0] as any)[property] ?? 0 : 0;
    
    // 동일 위치 충돌 제거 + 추가를 단일 히스토리 단계로 처리
    replaceKeyframe(subtitleId, property, { time, value });
    
    // 키프레임 추가 후 연결선 재계산을 위한 강제 리렌더링
    setDragUpdate(prev => prev + 1);
    
    // Reset creation state
    setCreatingKeyframe(null);
  };
  
  // Cancel keyframe creation
  const handleCancelKeyframe = () => {
    setCreatingKeyframe(null);
  };

  // Delete 키 입력으로 선택된 키프레임 삭제
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' && selectedKeyframe && subtitleId) {
        deleteKeyframe(subtitleId, selectedKeyframe.property, selectedKeyframe.time);
        setSelectedKeyframe(null);
        // 키프레임 삭제 후 연결선 재계산을 위한 강제 리렌더링
        setDragUpdate(prev => prev + 1);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedKeyframe, subtitleId, deleteKeyframe]);

  // 전역 컨텍스트 메뉴 차단 (Hook 순서 보장을 위해 early return 전에 위치)
  useEffect(() => {
    const suppressContextMenu = (e: MouseEvent) => {
      if (dragRef.current) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    document.addEventListener('contextmenu', suppressContextMenu, true);
    return () => document.removeEventListener('contextmenu', suppressContextMenu, true);
  }, []);

  // Empty state when no subtitle is selected
  if (!subtitle) {
    return (
      <div className="h-full flex items-center justify-center text-sm text-text-secondary">
        Select a subtitle to see its keyframes
      </div>
    );
  }

  return (
    <div 
      className="h-full w-full flex flex-col"
      style={{ overflow: 'hidden' }}
      ref={containerRef}
      tabIndex={0}
      onFocus={() => {
        // 키프레임 패널에 포커스가 있을 때 레이아웃 스토어 업데이트
        useLayoutStore.getState().setFocusedArea('keyframe');
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onWheel={handleWheel}
      onContextMenu={(e) => {
        e.preventDefault();
        setMenuState({ open: true, x: e.clientX, y: e.clientY });
      }}
    >
      {/* Ruler component */}
      <TimelineRuler 
        viewStart={localViewStart}
        viewEnd={localViewEnd}
        fps={fps}
        timeToPixel={timeToPixel}
        containerWidth={getWidth()}
      />

      {/* Main content area with keyframes */}
      <div 
        className="flex-1 overflow-auto relative"
        ref={contentRef}
        style={{ background: 'var(--color-bg, #111)' }}
      >
        {animations.map((anim: any, idx: number) => (
          <div
            key={anim.property}
            className="keyframe-row"
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: idx * ROW_HEIGHT,
              height: ROW_HEIGHT,
              borderBottom: '1px solid rgba(255,255,255,0.05)',
              background: highlightRow === anim.property ? 'rgba(0,202,255,0.08)' : undefined,
              cursor: 'pointer',
            }}
            onClick={(e) => handleRowClick(e, anim.property)}
            onDragOver={(e)=>{
              // 텍스트 속성은 이징 적용 불가
              if (anim.property === 'text') return;
              if (!e.dataTransfer.types.includes('curve-id')) return;
              e.preventDefault();
              e.dataTransfer.dropEffect = 'copy';
              setHighlightRow(anim.property);
            }}
            onDragLeave={()=>{
              setHighlightRow((prev)=> prev===anim.property ? null : prev);
            }}
            onDrop={(e)=>{
              // 텍스트 속성은 이징 적용 불가
              if (anim.property === 'text') return;
              const curveId = e.dataTransfer.getData('curve-id');
              if (!curveId || !subtitleId) return;
              setHighlightRow(null);
              
              // Determine drop location time
              const rect = e.currentTarget.getBoundingClientRect();
              const relX = clamp(e.clientX - rect.left, 0, rect.width);
              const dropTime = pixelToTime(relX);
              
              // Find closest keyframe in this animation
              let closestKf = anim.keyframes[0];
              let minDist = Math.abs(closestKf.time - dropTime);
              
              for (const k of anim.keyframes) {
                const d = Math.abs(k.time - dropTime);
                if (d < minDist) {
                  minDist = d;
                  closestKf = k;
                }
              }
              
              // Threshold: apply only if within 400ms window
              if (minDist < 400) {
                useProjectStore.getState().setKeyframeEasing(subtitleId, anim.property, closestKf.time, curveId);
              }
            }}
          >
            {/* Property label */}
            <div className="keyframe-property-label" style={{ 
              position: 'absolute', 
              left: 4, 
              top: 4, 
              fontSize: 10, 
              color: '#aaa',
              pointerEvents: 'none'
            }}>
              {anim.property}
            </div>

            {/* Keyframes */}
            {anim.keyframes.map((kf: any, kfIdx: number) => {
              // 드래그 중인 자막의 키프레임 위치를 실시간으로 계산
              let displayTime = kf.time;
              if (isDragging && draggedSubtitleId === subtitleId) {
                displayTime = Math.max(0, kf.time + draggedSubtitleDelta);
              }
              
              // 키프레임 드래그 중인 경우 실시간 위치 계산
              if (dragRef.current && dragRef.current.property === anim.property && dragRef.current.originalTime === kf.time) {
                displayTime = dragRef.current.currentTime;
              }
              
              const isText = anim.property === 'text';
              return (
                <div
                  key={`${kf.time}-${kfIdx}`}
                  className="keyframe-diamond"
                  title={`${displayTime}ms - ${formatTime(displayTime, fps, 'seconds')} - Value: ${kf.value}`}
                  style={{
                    position: 'absolute',
                    top: ROW_HEIGHT / 2,
                    left: timeToPixel(displayTime),
                    width: KEYFRAME_SIZE,
                    height: KEYFRAME_SIZE,
                  background: isText ? '#9999ff' : (kf.easingId && kf.easingId !== 'linear' ? '#00d4aa' : '#ffcc00'),
                  border: selectedKeyframe && selectedKeyframe.property === anim.property && selectedKeyframe.time === kf.time ? '2px solid #ffffff' : '1px solid rgba(0,0,0,0.3)',
                  transform: isText ? 'translate(-50%, -50%)' : 'translate(-50%, -50%) rotate(45deg)',
                  borderRadius: isText ? 3 : undefined,
                  cursor: 'pointer',
                  zIndex: 2,
                  transition: dragRef.current && dragRef.current.property === anim.property && dragRef.current.originalTime === kf.time ? 'none' : 'transform 0.1s ease',
                }}
                onMouseDown={(e) => {
                  handleKfMouseDown(e, anim.property, kf.time);
                }}
                onClick={() => {
                  setSelectedKeyframe({ property: anim.property, time: kf.time });
                }}
                onDragOver={(e) => {
                  // 텍스트 키프레임은 이징 드롭 비활성화
                  if (isText) return;
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'copy';
                }}
                onDrop={(e) => {
                  if (isText) return;
                  const curveId = e.dataTransfer.getData('curve-id');
                  if (curveId && subtitleId) {
                    useProjectStore.getState().setKeyframeEasing(subtitleId, anim.property, kf.time, curveId);
                  }
                }}
                onContextMenu={(e)=>{
                  e.preventDefault();
                  e.stopPropagation();
                  
                  // 드래그 중이면 컨텍스트 메뉴 표시하지 않음
                  if (dragRef.current) {
                    return;
                  }
                  
                  setKfMenu({
                    open: true, 
                    x: e.clientX, 
                    y: e.clientY, 
                    property: anim.property, 
                    time: kf.time
                  });
                }}
              />
              );
            })}
            
            {/* Keyframe connections - 값이 변할 때만 표시 */}
            {(() => {
              // 키프레임들의 표시 위치 계산 (드래그/자막 이동 고려)
              const kfsDisp = anim.keyframes.map((k: any) => {
                let t = k.time;
                if (isDragging && draggedSubtitleId === subtitleId) {
                  t = Math.max(0, t + draggedSubtitleDelta);
                }
                if (
                  dragRef.current &&
                  dragRef.current.property === anim.property &&
                  dragRef.current.originalTime === k.time
                ) {
                  t = dragRef.current.currentTime;
                }
                return { ...k, displayTime: t };
              });

              // 표시 시간을 기준으로 정렬
              kfsDisp.sort((a, b) => a.displayTime - b.displayTime);

              return kfsDisp.slice(0, -1).map((kf, idx) => {
                const next = kfsDisp[idx + 1];
                if (!next) return null;
                if (kf.value === next.value) return null;

                const x1 = timeToPixel(kf.displayTime);
                const x2 = timeToPixel(next.displayTime);
                if (Math.abs(x2 - x1) < 2) return null;

                return (
                  <div
                    key={`conn-${idx}-${dragUpdate}`}
                    className="keyframe-connection"
                    style={{
                      position: 'absolute',
                      top: ROW_HEIGHT / 2,
                      left: x1,
                      width: x2 - x1,
                      height: 2,
                      background: kf.easingId && kf.easingId !== 'linear' ? '#00d4aa' : '#ffcc00',
                      opacity: 0.5,
                      zIndex: 1,
                      transform: 'translateY(-50%)',
                    }}
                  />
                );
              });
            })()}
            
            {/* Creating keyframe indicator */}
            {creatingKeyframe && creatingKeyframe.property === anim.property && (
              <div
                className="keyframe-creating"
                style={{
                  position: 'absolute',
                  top: ROW_HEIGHT / 2,
                  left: timeToPixel(creatingKeyframe.time),
                  width: KEYFRAME_SIZE,
                  height: KEYFRAME_SIZE,
                  background: 'rgba(0, 202, 255, 0.5)',
                  border: '1px dashed #00caff',
                  borderRadius: '50%',
                  transform: 'translate(-50%, -50%)',
                  zIndex: 3,
                }}
              />
            )}
          </div>
        ))}

        {/* Enhanced Playhead */}
        <div 
          className="neu-playhead"
          style={{ 
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: timeToPixel(timeline.currentTime),
            width: 1,
            background: 'red',
            pointerEvents: 'none',
          }}
        >
          <div className="neu-playhead-head" style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: 9,
            height: 9,
            background: 'red',
            borderRadius: '0 0 50% 50%',
            transform: 'translateX(-4px)',
          }} />
        </div>
      </div>
      
      {/* Keyframe creation controls */}
      {creatingKeyframe && (
        <div className="keyframe-creation-controls" style={{
          position: 'absolute',
          bottom: 10,
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'var(--color-bg-elevated)',
          borderRadius: 4,
          padding: '4px 8px',
          display: 'flex',
          gap: 8,
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          zIndex: 100,
        }}>
          <span style={{ fontSize: 12, color: 'var(--color-text)' }}>
            Add keyframe at {formatTime(creatingKeyframe.time, fps, 'seconds')} for {creatingKeyframe.property}?
          </span>
          <button 
            className="btn btn-sm btn-primary"
            onClick={handleAddKeyframe}
            style={{ padding: '2px 6px', fontSize: 12 }}
          >
            <Plus size={12} /> Add
          </button>
          <button 
            className="btn btn-sm"
            onClick={handleCancelKeyframe}
            style={{ padding: '2px 6px', fontSize: 12 }}
          >
            Cancel
          </button>
        </div>
      )}

      {/* Context menus */}
      <ContextMenu
        x={menuState.x}
        y={menuState.y}
        isOpen={menuState.open}
        onClose={() => setMenuState({ ...menuState, open: false })}
      >
        <ContextMenuItem onClick={toggleSnap}>
          {snapEnabled ? 'Disable Snap' : 'Enable Snap'}
        </ContextMenuItem>
        <ContextMenuDivider />
        <ContextMenuItem onClick={() => {
          // Reset zoom and view
          setZoom(1);
          setViewRange(0, duration);
        }}>
          Reset View
        </ContextMenuItem>
      </ContextMenu>

      {kfMenu?.open && (
        <ContextMenu
          x={kfMenu.x}
          y={kfMenu.y}
          isOpen={kfMenu.open}
          onClose={() => setKfMenu(null)}
        >
          <ContextMenuItem
            onClick={() => {
              // Copy keyframe value to clipboard
              const kf = subtitle?.spans[0]?.animations
                ?.find((a: any) => a.property === kfMenu.property)
                ?.keyframes.find((k: any) => k.time === kfMenu.time);
                
              if (kf) {
                navigator.clipboard.writeText(String(kf.value));
              }
              setKfMenu(null);
            }}
          >
            <Copy size={14} /> Copy Value
          </ContextMenuItem>
          
          <ContextMenuItem
            onClick={() => {
              // Navigate to previous keyframe
              const anim = subtitle?.spans[0]?.animations?.find((a: any) => a.property === kfMenu.property);
              if (anim) {
                const kfIndex = anim.keyframes.findIndex((k: any) => k.time === kfMenu.time);
                if (kfIndex > 0) {
                  const prevKf = anim.keyframes[kfIndex - 1];
                  setCurrentTime(prevKf.time);
                }
              }
              setKfMenu(null);
            }}
          >
            <ArrowLeft size={14} /> Previous Keyframe
          </ContextMenuItem>
          
          <ContextMenuItem
            onClick={() => {
              // Navigate to next keyframe
              const anim = subtitle?.spans[0]?.animations?.find((a: any) => a.property === kfMenu.property);
              if (anim) {
                const kfIndex = anim.keyframes.findIndex((k: any) => k.time === kfMenu.time);
                if (kfIndex < anim.keyframes.length - 1) {
                  const nextKf = anim.keyframes[kfIndex + 1];
                  setCurrentTime(nextKf.time);
                }
              }
              setKfMenu(null);
            }}
          >
            <ArrowRight size={14} /> Next Keyframe
          </ContextMenuItem>
          
          <ContextMenuDivider />
          
          <ContextMenuItem
            onClick={() => {
              const sid = subtitleId ?? '';
              if (sid) {
                deleteKeyframe(sid, kfMenu.property, kfMenu.time);
                // 키프레임 삭제 후 연결선 재계산을 위한 강제 리렌더링
                setDragUpdate(prev => prev + 1);
              }
              setKfMenu(null);
            }}
            danger
          >
            <Trash2 size={14} /> Delete Keyframe
          </ContextMenuItem>
        </ContextMenu>
      )}
    </div>
  );
};

export default KeyframePanel; 