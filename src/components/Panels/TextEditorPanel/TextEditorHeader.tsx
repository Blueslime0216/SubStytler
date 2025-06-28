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
    <>
      {/* Text Formatting */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-text-secondary mb-1">
          Text Formatting
        </label>
        <div className="flex space-x-2">
          <motion.button
            onClick={() => toggleTextStyle('bold')}
            className={`p-2 rounded-lg ${isBold ? 'bg-primary text-white shadow-inset' : 'bg-surface shadow-outset'}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Bold className="w-4 h-4" />
          </motion.button>
          
          <motion.button
            onClick={() => toggleTextStyle('italic')}
            className={`p-2 rounded-lg ${isItalic ? 'bg-primary text-white shadow-inset' : 'bg-surface shadow-outset'}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Italic className="w-4 h-4" />
          </motion.button>
          
          <motion.button
            onClick={() => toggleTextStyle('underline')}
            className={`p-2 rounded-lg ${isUnderline ? 'bg-primary text-white shadow-inset' : 'bg-surface shadow-outset'}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Underline className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
      
      {/* Text Alignment */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-text-secondary mb-1">
          Text Alignment
        </label>
        <div className="flex space-x-2">
          <motion.button
            onClick={() => setTextAlignment(1)}
            className={`p-2 rounded-lg ${textAlignment === 1 ? 'bg-primary text-white shadow-inset' : 'bg-surface shadow-outset'}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <AlignLeft className="w-4 h-4" />
          </motion.button>
          
          <motion.button
            onClick={() => setTextAlignment(3)}
            className={`p-2 rounded-lg ${textAlignment === 3 ? 'bg-primary text-white shadow-inset' : 'bg-surface shadow-outset'}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <AlignCenter className="w-4 h-4" />
          </motion.button>
          
          <motion.button
            onClick={() => setTextAlignment(2)}
            className={`p-2 rounded-lg ${textAlignment === 2 ? 'bg-primary text-white shadow-inset' : 'bg-surface shadow-outset'}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <AlignRight className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </>
  );
};

export default TextEditorHeader;