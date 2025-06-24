import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Copy } from 'lucide-react';
import { useProjectStore } from '../../stores/projectStore';
import { SubtitleStyle } from '../../types/project';
import StyleManagerToolbar from './StyleManagerToolbar';
import StyleList from './StyleList';
import StyleEditor from './StyleEditor';

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
    <div className="neu-style-manager-panel h-full flex flex-col">
      {/* Toolbar */}
      <StyleManagerToolbar onCreateNewStyle={createNewStyle} />

      {/* Style List */}
      <StyleList
        styles={currentProject?.styles || []}
        selectedStyleId={selectedStyleId}
        onSelect={setSelectedStyleId}
        onDuplicate={duplicateStyle}
        onRemove={removeStyle}
      />

      {/* Style Editor */}
      {selectedStyle && (
        <StyleEditor
          style={selectedStyle}
          onUpdate={updateStyle}
        />
      )}
    </div>
  );
};