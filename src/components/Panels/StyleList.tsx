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

const StyleList: React.FC<StyleListProps> = ({ styles, selectedStyleId, onSelect, onDuplicate, onRemove }) => (
  <div className="flex-1 overflow-y-auto p-2 space-y-2">
    {styles.map((style) => (
      <motion.div
        key={style.id}
        className={`neu-card cursor-pointer transition-all ${selectedStyleId === style.id ? 'neu-shadow-inset' : ''}`}
        onClick={() => onSelect(style.id)}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="font-medium neu-text-primary text-sm">{style.name}</h3>
            <div className="flex items-center space-x-2 mt-1">
              <div
                className="w-3 h-3 rounded neu-shadow-inset"
                style={{ backgroundColor: style.fc }}
              />
              <span className="text-xs neu-text-secondary">{style.fs}</span>
              <span className="text-xs neu-text-secondary">{style.sz}</span>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <motion.button
              onClick={e => { e.stopPropagation(); onDuplicate(style); }}
              className="neu-btn-icon p-1"
            >
              <Copy className="w-3 h-3" />
            </motion.button>
            {style.id !== 'default' && (
              <motion.button
                onClick={e => { e.stopPropagation(); onRemove(style.id); }}
                className="neu-btn-icon p-1"
                style={{ color: 'var(--neu-error)' }}
              >
                <Trash2 className="w-3 h-3" />
              </motion.button>
            )}
          </div>
        </div>
        {/* Preview */}
        <div className="mt-2 neu-card-small text-center text-xs">
          <span
            style={{
              color: style.fc,
              backgroundColor: style.bc + '80',
              fontFamily: style.fs,
              fontSize: style.sz === '100%' ? '12px' : style.sz === '125%' ? '14px' : '10px'
            }}
          >
            Sample Text
          </span>
        </div>
      </motion.div>
    ))}
  </div>
);

export default StyleList; 