import React from 'react';
import { useProjectStore } from '../../../stores/projectStore';

interface ProjectTitleProps {
  isEditingTitle: boolean;
  titleValue: string;
  setTitleValue: (value: string) => void;
  setIsEditingTitle: (value: boolean) => void;
  titleInputRef: React.RefObject<HTMLInputElement>;
}

export const ProjectTitle: React.FC<ProjectTitleProps> = ({
  isEditingTitle,
  titleValue,
  setTitleValue,
  setIsEditingTitle,
  titleInputRef
}) => {
  const { currentProject, updateProject } = useProjectStore();

  // Handle title double click
  const handleTitleDoubleClick = () => {
    if (!currentProject) return;
    setIsEditingTitle(true);
  };

  // Handle title input blur
  const handleTitleBlur = () => {
    // 이름 변경 취소: 입력값을 원래 이름으로 되돌리고 편집 모드 종료
    setTitleValue(currentProject?.name || 'Untitled Project');
    setIsEditingTitle(false);
  };

  // Handle title input key down
  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (!currentProject) return;
      updateProject({ name: titleValue });
      setIsEditingTitle(false);
    } else if (e.key === 'Escape') {
      setTitleValue(currentProject?.name || 'Untitled Project');
      setIsEditingTitle(false);
    }
  };

  // 편집 모드 진입 시 input에 포커스
  React.useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle, titleInputRef]);

  return (
    <div className="flex-1 flex justify-center">
      {isEditingTitle ? (
        <input
          ref={titleInputRef}
          type="text"
          value={titleValue}
          onChange={(e) => setTitleValue(e.target.value)}
          onBlur={handleTitleBlur}
          onKeyDown={handleTitleKeyDown}
          className="text-base bg-bg shadow-inset rounded px-2 py-1 text-text-primary w-64 text-center"
        />
      ) : (
        <div 
          className="text-base opacity-80 font-medium cursor-pointer hover:opacity-100 transition-opacity duration-200"
          onDoubleClick={handleTitleDoubleClick}
          title="Double-click to edit project name"
        >
          {currentProject?.name || "Untitled Project"}
        </div>
      )}
    </div>
  );
};