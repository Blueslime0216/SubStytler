import React from 'react';
import { motion } from 'framer-motion';
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';

interface TextEditorHeaderProps {
  toggleTextStyle: (style: 'bold' | 'italic' | 'underline') => void;
  isBold: boolean;
  isItalic: boolean;
  isUnderline: boolean;
  textAlignment: number;
  setTextAlignment: (value: number) => void;
}

const TextEditorHeader: React.FC<TextEditorHeaderProps> = ({
  toggleTextStyle,
  isBold,
  isItalic,
  isUnderline,
  textAlignment,
  setTextAlignment
}) => {
  return (
    <div className="p-3 border-b border-border-color bg-surface">
      {/* 텍스트 서식 툴바 */}
      <div className="flex items-center justify-between">
        {/* 왼쪽: 텍스트 스타일 버튼 */}
        <div className="flex space-x-1">
          <motion.button
            onClick={() => toggleTextStyle('bold')}
            className={`p-1.5 rounded-md ${isBold ? 'bg-primary text-white shadow-inset' : 'bg-bg hover:bg-bg-hover shadow-outset-subtle'}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="굵게"
          >
            <Bold className="w-4 h-4" />
          </motion.button>
          
          <motion.button
            onClick={() => toggleTextStyle('italic')}
            className={`p-1.5 rounded-md ${isItalic ? 'bg-primary text-white shadow-inset' : 'bg-bg hover:bg-bg-hover shadow-outset-subtle'}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="기울임"
          >
            <Italic className="w-4 h-4" />
          </motion.button>
          
          <motion.button
            onClick={() => toggleTextStyle('underline')}
            className={`p-1.5 rounded-md ${isUnderline ? 'bg-primary text-white shadow-inset' : 'bg-bg hover:bg-bg-hover shadow-outset-subtle'}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="밑줄"
          >
            <Underline className="w-4 h-4" />
          </motion.button>
        </div>
        
        {/* 오른쪽: 정렬 버튼 */}
        <div className="flex space-x-1">
          <motion.button
            onClick={() => setTextAlignment(1)}
            className={`p-1.5 rounded-md ${textAlignment === 1 ? 'bg-primary text-white shadow-inset' : 'bg-bg hover:bg-bg-hover shadow-outset-subtle'}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="왼쪽 정렬"
          >
            <AlignLeft className="w-4 h-4" />
          </motion.button>
          
          <motion.button
            onClick={() => setTextAlignment(3)}
            className={`p-1.5 rounded-md ${textAlignment === 3 ? 'bg-primary text-white shadow-inset' : 'bg-bg hover:bg-bg-hover shadow-outset-subtle'}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="가운데 정렬"
          >
            <AlignCenter className="w-4 h-4" />
          </motion.button>
          
          <motion.button
            onClick={() => setTextAlignment(2)}
            className={`p-1.5 rounded-md ${textAlignment === 2 ? 'bg-primary text-white shadow-inset' : 'bg-bg hover:bg-bg-hover shadow-outset-subtle'}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="오른쪽 정렬"
          >
            <AlignRight className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default TextEditorHeader;