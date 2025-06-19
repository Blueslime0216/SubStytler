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
    if (styleId === 'default') return; // Can't delete default style
    deleteStyle(styleId);
    if (selectedStyleId === styleId) {
      setSelectedStyleId(null);
    }
  };

  const selectedStyle = currentProject?.styles.find(s => s.id === selectedStyleId);

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="p-3 bg-gray-800 border-b border-gray-700">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={createNewStyle}
          className="flex items-center space-x-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span className="text-sm">New Style</span>
        </motion.button>
      </div>

      {/* Style List */}
      <div className="flex-1 overflow-y-auto">
        {currentProject?.styles.map((style) => (
          <motion.div
            key={style.id}
            className={`p-3 border-b border-gray-700 cursor-pointer transition-colors ${
              selectedStyleId === style.id ? 'bg-blue-900/30' : 'hover:bg-gray-800'
            }`}
            onClick={() => setSelectedStyleId(style.id)}
            whileHover={{ scale: 1.01 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="font-medium text-white">{style.name}</h3>
                <div className="flex items-center space-x-2 mt-1">
                  <div
                    className="w-4 h-4 rounded border border-gray-600"
                    style={{ backgroundColor: style.fc }}
                  />
                  <span className="text-xs text-gray-400">{style.fs}</span>
                  <span className="text-xs text-gray-400">{style.sz}</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-1">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    duplicateStyle(style);
                  }}
                  className="p-1 rounded hover:bg-gray-700 transition-colors"
                >
                  <Copy className="w-3 h-3 text-gray-400" />
                </motion.button>
                
                {style.id !== 'default' && (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      removeStyle(style.id);
                    }}
                    className="p-1 rounded hover:bg-red-600 transition-colors"
                  >
                    <Trash2 className="w-3 h-3 text-gray-400" />
                  </motion.button>
                )}
              </div>
            </div>
            
            {/* Preview */}
            <div className="mt-2 p-2 rounded bg-gray-800 text-center text-sm">
              <span
                style={{
                  color: style.fc,
                  backgroundColor: style.bc + '80',
                  fontFamily: style.fs,
                  fontSize: style.sz === '100%' ? '14px' : style.sz === '125%' ? '16px' : '12px'
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
        <div className="border-t border-gray-700 p-4 bg-gray-800">
          <h3 className="font-medium text-white mb-3">Edit Style</h3>
          
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Name</label>
              <input
                type="text"
                value={selectedStyle.name}
                onChange={(e) => updateStyle(selectedStyle.id, { name: e.target.value })}
                className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Text Color</label>
                <input
                  type="color"
                  value={selectedStyle.fc}
                  onChange={(e) => updateStyle(selectedStyle.id, { fc: e.target.value })}
                  className="w-full h-8 rounded border border-gray-600"
                />
              </div>
              
              <div>
                <label className="block text-xs text-gray-400 mb-1">Background</label>
                <input
                  type="color"
                  value={selectedStyle.bc}
                  onChange={(e) => updateStyle(selectedStyle.id, { bc: e.target.value })}
                  className="w-full h-8 rounded border border-gray-600"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-xs text-gray-400 mb-1">Font Family</label>
              <select
                value={selectedStyle.fs}
                onChange={(e) => updateStyle(selectedStyle.id, { fs: e.target.value })}
                className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm"
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
              <label className="block text-xs text-gray-400 mb-1">Font Size</label>
              <select
                value={selectedStyle.sz}
                onChange={(e) => updateStyle(selectedStyle.id, { sz: e.target.value })}
                className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm"
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