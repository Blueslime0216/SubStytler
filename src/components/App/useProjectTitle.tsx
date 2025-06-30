import { useState, useEffect } from 'react';
import { useProjectStore } from '../../stores/projectStore';

export const useProjectTitle = () => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState('');
  
  const { currentProject } = useProjectStore();
  
  // Update title value when project changes
  useEffect(() => {
    if (currentProject) {
      setTitleValue(currentProject.name);
    }
  }, [currentProject]);
  
  return {
    isEditingTitle,
    setIsEditingTitle,
    titleValue,
    setTitleValue
  };
};