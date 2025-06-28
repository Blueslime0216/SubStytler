import { useState, useRef, useEffect } from 'react';

interface UseVideoControllerVisibilityProps {
  parentRef?: React.RefObject<HTMLElement>;
  isPinned: boolean;
  isInteracting: boolean;
}

export const useVideoControllerVisibility = ({
  parentRef,
  isPinned,
  isInteracting
}: UseVideoControllerVisibilityProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const hideTimeoutRef = useRef<number | null>(null);
  const controllerRef = useRef<HTMLDivElement | null>(null);

  // Set controller ref
  const setControllerReference = (ref: HTMLDivElement | null) => {
    controllerRef.current = ref;
  };

  // 마우스 진입 시 컨트롤러 표시
  const handleMouseEnter = () => {
    setIsVisible(true);
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  };

  // 마우스 떠날 때 컨트롤러 숨기기 (지연 처리)
  const handleMouseLeave = () => {
    if (isInteracting || isPinned) return;
    
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
    
    hideTimeoutRef.current = window.setTimeout(() => {
      if(!isPinned) setIsVisible(false);
      hideTimeoutRef.current = null;
    }, 100); // 0.1초 후 사라짐
  };

  // 부모 영역(비디오 영역) 호버 감지
  useEffect(() => {
    if (!parentRef?.current) return;
    const el = parentRef.current;
    
    const handleEnter = () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = null;
      }
      setIsVisible(true);
    };
    
    const handleLeave = () => {
      if (isInteracting || isPinned) return;
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = window.setTimeout(() => {
        if(!isPinned) setIsVisible(false);
        hideTimeoutRef.current = null;
      }, 100);
    };
    
    el.addEventListener('mouseenter', handleEnter);
    el.addEventListener('mouseleave', handleLeave);
    
    return () => {
      el.removeEventListener('mouseenter', handleEnter);
      el.removeEventListener('mouseleave', handleLeave);
    };
  }, [parentRef, isInteracting, isPinned]);

  // 글로벌 마우스 위치 기반 가드 – 커서가 비디오 영역이나 컨트롤러 위에 있으면 항상 보이도록
  useEffect(() => {
    const handleGlobalMove = (e: MouseEvent) => {
      if (!parentRef?.current || !controllerRef.current) return;
      const insideParent = parentRef.current.contains(e.target as Node);
      const insideController = controllerRef.current.contains(e.target as Node);
      if (insideParent || insideController) {
        if (hideTimeoutRef.current) {
          clearTimeout(hideTimeoutRef.current);
          hideTimeoutRef.current = null;
        }
        setIsVisible(true);
      }
    };
    
    document.addEventListener('mousemove', handleGlobalMove);
    return () => document.removeEventListener('mousemove', handleGlobalMove);
  }, [parentRef]);
      
  // 클린업 함수
  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, []);

  // Force visibility when pinned
  useEffect(() => {
    if (isPinned) {
      setIsVisible(true);
    }
  }, [isPinned]);

  return {
    isVisible,
    setIsVisible,
    handleMouseEnter,
    handleMouseLeave,
    controllerRef: setControllerReference
  };
};