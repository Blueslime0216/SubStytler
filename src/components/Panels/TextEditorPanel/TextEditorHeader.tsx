import React from 'react';
import { motion } from 'framer-motion';
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';

interface TextEditorHeaderProps {
  applyTextStyle: (style: 'bold' | 'italic' | 'underline') => void;
  textAlignment: number;
  setTextAlignment: (value: number) => void;
}

const TextEditorHeader: React.FC<TextEditorHeaderProps> = ({
  applyTextStyle,
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
            onClick={() => applyTextStyle('bold')}
            className="p-2 bg-surface shadow-outset rounded-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Bold className="w-4 h-4 text-text-primary" />
          </motion.button>
          
          <motion.button
            onClick={() => applyTextStyle('italic')}
            className="p-2 bg-surface shadow-outset rounded-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Italic className="w-4 h-4 text-text-primary" />
          </motion.button>
          
          <motion.button
            onClick={() => applyTextStyle('underline')}
            className="p-2 bg-surface shadow-outset rounded-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Underline className="w-4 h-4 text-text-primary" />
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
            className={`p-2 rounded-lg ${textAlignment === 1 ? 'bg-primary text-white' : 'bg-surface shadow-outset'}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <AlignLeft className="w-4 h-4" />
          </motion.button>
          
          <motion.button
            onClick={() => setTextAlignment(3)}
            className={`p-2 rounded-lg ${textAlignment === 3 ? 'bg-primary text-white' : 'bg-surface shadow-outset'}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <AlignCenter className="w-4 h-4" />
          </motion.button>
          
          <motion.button
            onClick={() => setTextAlignment(2)}
            className={`p-2 rounded-lg ${textAlignment === 2 ? 'bg-primary text-white' : 'bg-surface shadow-outset'}`}
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