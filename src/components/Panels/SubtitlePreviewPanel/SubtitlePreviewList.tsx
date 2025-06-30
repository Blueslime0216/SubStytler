import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SubtitleBlock } from '../../../types/project';
import { generateYTTContent } from '../../../utils/yttGenerator';

// utils/yttGenerator 의 함수를 그대로 사용하여 YTT 문자 생성
const generateYtt = (subtitles: SubtitleBlock[]) => {
  return generateYTTContent({ subtitles } as any);
};

interface SubtitlePreviewListProps {
  subtitles: SubtitleBlock[];
}

export const SubtitlePreviewList: React.FC<SubtitlePreviewListProps> = ({ subtitles }) => {
  const yttContent = generateYtt(subtitles);
  const placeholder = 'Add subtitles to generate YTT preview.';
  const [copied, setCopied] = useState(false);

  // 클릭 시 복사 기능
  const handleCopy = () => {
    navigator.clipboard.writeText(yttContent || placeholder)
      .then(() => {
        // 복사 후 텍스트 선택 해제
        if (window.getSelection) {
          const sel = window.getSelection();
          if (sel) sel.removeAllRanges();
        }
        setCopied(true);
        setTimeout(() => setCopied(false), 800); // 0.8초로 단축
      })
      .catch(console.error);
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div
        className={`flex-1 min-h-0 overflow-y-auto bg-[#18181b] font-mono text-xs rounded-md border ${
          copied ? 'border-green-500 shadow-[0_0_0_1px_rgba(34,197,94,0.4)] select-none' : 'border-[#222] select-all'
        } shadow-inner transition-all duration-150 hover:bg-[#232326] hover:border-[#444] cursor-pointer whitespace-pre-wrap p-2`}
        title="Click to copy YTT code"
        onClick={handleCopy}
      >
        {yttContent || placeholder}
      </div>
      
      <AnimatePresence>
        {copied && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-[1px] flex items-center justify-center bg-[#18181b]/90 rounded-[5px] overflow-hidden pointer-events-none"
          >
            <span className="text-green-400 font-medium">
              Copied to clipboard!
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};