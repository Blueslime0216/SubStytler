import React from 'react';
import { motion } from 'framer-motion';
import { Copy, Trash2 } from 'lucide-react';
import { SubtitleStyle } from '../../types/project';

interface StyleListProps {
  styles: SubtitleStyle[];
  selectedStyleId: string | null;
  onSelect: (id: string) => void;
  onDuplicate: (style: SubtitleStyle) => void;
  onRemove: (id: string) => void;
}

const StyleList: React.FC<StyleListProps> = ({ styles, selectedStyleId, onSelect, onDuplicate, onRemove }) => {
  const getFontFamilyName = (value?: string) => {
    switch (value) {
      case '1': return 'Courier New';
      case '2': return 'Times New Roman';
      case '3': return 'Lucida Console';
      case '4': return 'Roboto';
      case '5': return 'Comic Sans MS';
      case '6': return 'Monotype Corsiva';
      case '7': return 'Arial';
      default: return 'Roboto';
    }
  };

  const getOutlineStyleName = (value?: number) => {
    switch (value) {
      case 1: return 'Hard Shadow';
      case 2: return 'Bevel';
      case 3: return 'Glow/Outline';
      case 4: return 'Soft Shadow';
      default: return 'None';
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      {styles.map((style) => (
        <motion.div
          key={style.id}
          className={`bg-surface rounded-lg p-3 cursor-pointer transition-all ${selectedStyleId === style.id ? 'shadow-inset' : 'shadow-outset'}`}
          onClick={() => onSelect(style.id)}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="font-medium text-text-primary text-sm">{style.name}</h3>
              <div className="flex items-center space-x-2 mt-1">
                <div
                  className="w-3 h-3 rounded shadow-inset"
                  style={{ backgroundColor: style.fc || '#FFFFFF' }}
                />
                <span className="text-xs text-text-secondary">{getFontFamilyName(style.fs)}</span>
                <span className="text-xs text-text-secondary">{style.sz || '100%'}</span>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <motion.button
                onClick={e => { e.stopPropagation(); onDuplicate(style); }}
                className="p-1 bg-surface shadow-outset rounded"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Copy className="w-3.5 h-3.5 text-text-secondary" />
              </motion.button>
              {style.id !== 'default' && (
                <motion.button
                  onClick={e => { e.stopPropagation(); onRemove(style.id); }}
                  className="p-1 bg-surface shadow-outset rounded"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Trash2 className="w-3.5 h-3.5 text-error" />
                </motion.button>
              )}
            </div>
          </div>
          
          {/* Preview */}
          <div className="mt-2 bg-black rounded p-2 text-center">
            <span
              style={{
                color: style.fc || '#FFFFFF',
                backgroundColor: style.bc ? `${style.bc}${Math.round((style.bo !== undefined ? style.bo : 0.5) * 255).toString(16).padStart(2, '0')}` : 'transparent',
                fontFamily: getFontFamilyName(style.fs),
                fontSize: style.sz === '100%' ? '12px' : style.sz === '125%' ? '14px' : style.sz === '150%' ? '16px' : style.sz === '200%' ? '18px' : '10px',
                textShadow: style.et 
                  ? style.et === 1 ? `2px 2px 0 ${style.ec || '#000000'}` 
                  : style.et === 2 ? `1px 1px 0 ${style.ec || '#000000'}, -1px -1px 0 ${(style.ec || '#000000').replace('#', '#66')}` 
                  : style.et === 3 ? `0 0 3px ${style.ec || '#000000'}, 0 0 3px ${style.ec || '#000000'}, 0 0 3px ${style.ec || '#000000'}, 0 0 3px ${style.ec || '#000000'}` 
                  : `2px 2px 4px ${style.ec || '#000000'}`
                  : 'none',
                padding: '0.25em 0.5em',
                display: 'inline-block',
              }}
            >
              Sample Text
            </span>
          </div>
          
          {/* Style Details */}
          <div className="mt-2 grid grid-cols-2 gap-x-2 gap-y-1">
            <div className="text-xs text-text-secondary">
              <span className="font-medium">Outline:</span> {getOutlineStyleName(style.et)}
            </div>
            <div className="text-xs text-text-secondary">
              <span className="font-medium">Align:</span> {style.ju === 1 ? 'Left' : style.ju === 2 ? 'Right' : 'Center'}
            </div>
            <div className="text-xs text-text-secondary">
              <span className="font-medium">Direction:</span> {style.pd === '20' ? 'Vertical RTL' : style.pd === '21' ? 'Vertical LTR' : style.pd === '30' ? 'Rotated LTR' : style.pd === '31' ? 'Rotated RTL' : 'Horizontal'}
            </div>
            <div className="text-xs text-text-secondary">
              <span className="font-medium">Anchor:</span> {style.ap === 0 ? 'Top-L' : style.ap === 1 ? 'Top-C' : style.ap === 2 ? 'Top-R' : style.ap === 3 ? 'Mid-L' : style.ap === 4 ? 'Center' : style.ap === 5 ? 'Mid-R' : style.ap === 6 ? 'Bot-L' : style.ap === 7 ? 'Bot-C' : 'Bot-R'}
            </div>
          </div>
        </motion.div>
      ))}
      
      {styles.length === 0 && (
        <div className="flex items-center justify-center h-full text-text-secondary">
          <p className="text-sm">No styles defined</p>
        </div>
      )}
    </div>
  );
};

export default StyleList;