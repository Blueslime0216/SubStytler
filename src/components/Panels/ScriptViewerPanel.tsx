import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useProjectStore } from '../../stores/projectStore';
import { useHistoryStore } from '../../stores/historyStore';
import { useTimelineStore } from '../../stores/timelineStore';
import { Clock, Edit, Check, X } from 'lucide-react';
import { SubtitleBlock } from '../../types/project';

// 개별 자막 항목 컴포넌트
interface ScriptItemProps {
  subtitle: SubtitleBlock;
  isEditing: boolean;
  onEdit: () => void;
  onSave: (text: string) => void;
  onCancel: () => void;
  formatTime: (ms: number) => string;
}

const ScriptItem: React.FC<ScriptItemProps> = ({ 
  subtitle, 
  isEditing, 
  onEdit, 
  onSave, 
  onCancel,
  formatTime
}) => {
  const [editText, setEditText] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { setCurrentTime } = useTimelineStore();
  
  // 편집 시작 시 텍스트 초기화
  useEffect(() => {
    if (isEditing) {
      setEditText(subtitle.spans.map(span => span.text || '').join(''));
      // 포커스 설정
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.select();
        }
      }, 10);
    }
  }, [isEditing, subtitle]);
  
  // 자막 시간으로 이동
  const jumpToTime = () => {
    setCurrentTime(subtitle.startTime);
  };
  
  return (
    <div className={`mb-2 rounded-md overflow-hidden ${isEditing ? 'ring-2 ring-primary-color' : 'hover:bg-mid-color'}`}>
      {/* 자막 시간 표시 */}
      <div 
        className="flex items-center text-xs text-text-secondary bg-dark-color px-2 py-1 cursor-pointer"
        onClick={jumpToTime}
      >
        <Clock className="w-3 h-3 mr-1" />
        <span>{formatTime(subtitle.startTime)} → {formatTime(subtitle.endTime)}</span>
      </div>
      
      {/* 자막 내용 */}
      {isEditing ? (
        <div className="p-2 bg-base-color">
          <textarea
            ref={inputRef}
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className="w-full text-sm resize-none bg-bg shadow-inset rounded text-text-primary p-2 focus:outline-none focus:ring-1 focus:ring-primary-color"
            rows={3}
          />
          <div className="flex justify-end mt-2 space-x-2">
            <button 
              className="flex items-center text-xs bg-error-color text-white px-2 py-1 rounded"
              onClick={onCancel}
            >
              <X className="w-3 h-3 mr-1" />
              취소
            </button>
            <button 
              className="flex items-center text-xs bg-primary-color text-white px-2 py-1 rounded"
              onClick={() => onSave(editText)}
            >
              <Check className="w-3 h-3 mr-1" />
              저장
            </button>
          </div>
        </div>
      ) : (
        <div 
          className="p-3 cursor-pointer flex items-start"
          onClick={onEdit}
        >
          <div className="flex-1 text-sm">
            {subtitle.spans.map(span => span.text || '').join('')}
          </div>
          <button className="text-text-secondary hover:text-text-primary ml-2">
            <Edit className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

// 스크립트 뷰어 패널 컴포넌트
export const ScriptViewerPanel: React.FC = () => {
  // Zustand 스토어에서 프로젝트와 수정 액션 참조
  const { currentProject, updateSubtitle } = useProjectStore();
  
  // 상태
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // 모든 트랙의 자막을 시간 순으로 정렬하여 메모이제이션
  const subtitles = useProjectStore(state => state.currentProject?.subtitles ?? []);
  
  const sortedSubtitles = useMemo(() => {
    return [...subtitles].sort((a, b) => a.startTime - b.startTime);
  }, [subtitles]);
  
  // 시간 포맷팅 함수
  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const milliseconds = Math.floor((ms % 1000) / 10);
    
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
  };
  
  // 편집 시작
  const handleEdit = (id: string) => {
    setEditingId(id);
  };
  
  // 편집 취소
  const handleCancel = () => {
    setEditingId(null);
  };
  
  // 편집 저장
  const handleSave = (id: string, newText: string) => {
    if (!currentProject) return;
    
    // 변경 전 상태 기록
    useHistoryStore.getState().record(
      { project: { subtitles: [...currentProject.subtitles] } },
      '자막 텍스트 편집 전',
      true
    );
    
    // 자막 찾기
    const subtitle = currentProject.subtitles.find(s => s.id === id);
    if (subtitle) {
      // 첫 span이 존재하면 재사용, 없으면 새로 생성
      const firstSpan = subtitle.spans[0] ?? {
        id: crypto.randomUUID(),
        text: '',
        startTime: subtitle.startTime,
        endTime: subtitle.endTime,
      };
      
      // 업데이트
      const updatedSpan = { ...firstSpan, text: newText };
      updateSubtitle(id, { spans: [updatedSpan] });
      
      // 변경 후 상태 기록
      setTimeout(() => {
        const { currentProject: projAfter } = useProjectStore.getState();
        if (projAfter) {
          useHistoryStore.getState().record(
            { project: { subtitles: projAfter.subtitles } },
            '자막 텍스트 편집 완료'
          );
        }
      }, 0);
    }
    
    // 편집 모드 종료
    setEditingId(null);
  };
  
  return (
    <div className="h-full w-full flex flex-col bg-surface-color text-text-primary">
      {/* 스크립트 목록 */}
      <div className="flex-1 overflow-y-auto p-3">
        {sortedSubtitles.length === 0 ? (
          <div className="flex items-center justify-center h-full text-text-secondary">
            <p>자막이 없습니다</p>
          </div>
        ) : (
          sortedSubtitles.map(subtitle => (
            <ScriptItem
              key={subtitle.id}
              subtitle={subtitle}
              isEditing={editingId === subtitle.id}
              onEdit={() => handleEdit(subtitle.id)}
              onSave={(text) => handleSave(subtitle.id, text)}
              onCancel={handleCancel}
              formatTime={formatTime}
            />
          ))
        )}
      </div>
      
      {/* 상태 표시 */}
      <div className="border-t border-border-color p-2 flex justify-between items-center text-xs text-text-secondary">
        <div>
          총 {sortedSubtitles.length}개 자막
        </div>
        <div>
          {editingId ? '편집 중...' : '준비됨'}
        </div>
      </div>
    </div>
  );
};