import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Copy } from 'lucide-react';
import { useProjectStore } from '../../stores/projectStore';
import { SubtitleStyle } from '../../types/project';

export const StyleManagerPanel: React.FC = () => {
  const [selectedStyleId, setSelectedStyleId] = useState<string | null>(null);
  const { currentProject, addStyle, updateStyle, deleteStyle } = useProjectStore();

  const createNewStyle = () => {
    const newStyle: SubtitleStyle = {
      id: crypto.randomUUID(),
      name: `Style ${(currentProject?.styles.length || 0) + 1}`,
      fc: '#FFFFFF',
      fo: 1,
      bc: '#000000',
      bo: 0.8,
      fs: 'sans-serif',
      sz: '100%',
      ju: 2,
      ap: 6
    };
    addStyle(newStyle);
    setSelectedStyleId(newStyle.id);
  };

  const duplicateStyle = (style: SubtitleStyle) => {
    const newStyle: SubtitleStyle = {
      ...style,
      id: crypto.randomUUID(),
      name: `${style.name} Copy`
    };
    addStyle(newStyle);
  };

  const removeStyle = (styleId: string) => {
    if (styleId === 'default') return;
    deleteStyle(styleId);
    if (selectedStyleId === styleId) {
      setSelectedStyleId(null);
    }
  };

  const selectedStyle = currentProject?.styles.find(s => s.id === selectedStyleId);

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="neu-panel-header">
        <motion.button
          onClick={createNewStyle}
          className="neu-btn-primary flex items-center space-x-2"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="text-xs">New Style</span>
        </motion.button>
      </div>

      {/* Style List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {currentProject?.styles.map((style) => (
          <motion.div
            key={style.id}
            className={`neu-card cursor-pointer transition-all ${
              selectedStyleId === style.id ? 'neu-shadow-inset' : ''
            }`}
            onClick={() => setSelectedStyleId(style.id)}
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
                  onClick={(e) => {
                    e.stopPropagation();
                    duplicateStyle(style);
                  }}
                  className="neu-btn-icon p-1"
                >
                  <Copy className="w-3 h-3" />
                </motion.button>
                
                {style.id !== 'default' && (
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeStyle(style.id);
                    }}
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

      {/* Style Editor */}
      {selectedStyle && (
        <div className="neu-panel-header p-3">
          <h3 className="font-medium neu-text-primary mb-3 text-sm">Edit Style</h3>
          
          <div className="space-y-3">
            <div>
              <label className="block text-xs neu-text-secondary mb-1">Name</label>
              <input
                type="text"
                value={selectedStyle.name}
                onChange={(e) => updateStyle(selectedStyle.id, { name: e.target.value })}
                className="w-full neu-input text-xs"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs neu-text-secondary mb-1">Text Color</label>
                <input
                  type="color"
                  value={selectedStyle.fc}
                  onChange={(e) => updateStyle(selectedStyle.id, { fc: e.target.value })}
                  className="w-full h-6 rounded neu-shadow-inset border-none"
                />
              </div>
              
              <div>
                <label className="block text-xs neu-text-secondary mb-1">Background</label>
                <input
                  type="color"
                  value={selectedStyle.bc}
                  onChange={(e) => updateStyle(selectedStyle.id, { bc: e.target.value })}
                  className="w-full h-6 rounded neu-shadow-inset border-none"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-xs neu-text-secondary mb-1">Font Family</label>
              <select
                value={selectedStyle.fs}
                onChange={(e) => updateStyle(selectedStyle.id, { fs: e.target.value })}
                className="w-full neu-select text-xs"
              >
                <option value="sans-serif">Sans Serif</option>
                <option value="serif">Serif</option>
                <option value="monospace">Monospace</option>
                <option value="casual">Casual</option>
                <option value="cursive">Cursive</option>
                <option value="small-caps">Small Caps</option>
              </select>
            </div>
            
            <div>
              <label className="block text-xs neu-text-secondary mb-1">Font Size</label>
              <select
                value={selectedStyle.sz}
                onChange={(e) => updateStyle(selectedStyle.id, { sz: e.target.value })}
                className="w-full neu-select text-xs"
              >
                <option value="50%">50%</option>
                <option value="75%">75%</option>
                <option value="100%">100%</option>
                <option value="125%">125%</option>
                <option value="150%">150%</option>
                <option value="200%">200%</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};