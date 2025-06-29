import React from 'react';
import { Copy } from 'lucide-react';

interface SubtitlePreviewFooterProps {
  onCopyOriginal: () => void;
}

/**
 * 자막 미리보기 패널 하단에 위치할 푸터 컴포넌트입니다.
 * 버튼 하나(원문 복사)만 제공하며, 다른 아이콘이나 요소는 포함하지 않습니다.
 */
export const SubtitlePreviewFooter: React.FC<SubtitlePreviewFooterProps> = ({ onCopyOriginal }) => {
  return (
    <div className="p-3 border-t border-t-[#3b4252] bg-surface flex justify-end">
      <button
        onClick={onCopyOriginal}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded bg-surface border border-[#3b4252] shadow-outset-subtle transition-all duration-200 hover:bg-mid-color hover:shadow-outset hover:transform hover:-translate-y-0.5 active:shadow-pressed active:transform active:translate-y-0"
        title="Copy original text"
      >
        <Copy className="w-3.5 h-3.5 text-text-secondary" />
        <span>Copy Original</span>
      </button>
    </div>
  );
}; 