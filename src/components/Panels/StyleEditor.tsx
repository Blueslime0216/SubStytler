import React from 'react';
import { SubtitleStyle } from '../../types/project';
import { useHistoryStore } from '../../stores/historyStore';
import { useProjectStore } from '../../stores/projectStore';

interface StyleEditorProps {
  style: SubtitleStyle;
  onUpdate: (id: string, patch: Partial<SubtitleStyle>) => void;
}

const StyleEditor: React.FC<StyleEditorProps> = ({ style, onUpdate }) => {
  // Record initial state before making changes
  const recordBeforeUpdate = () => {
    const { currentProject } = useProjectStore.getState();
    if (currentProject) {
      useHistoryStore.getState().record(
        { 
          project: {
            styles: [...currentProject.styles],
            selectedStyleId: style.id
          }
        },
        'Before updating style properties',
        true // Mark as internal
      );
    }
  };

  // Record final state after making changes
  const recordAfterUpdate = (property: string) => {
    const { currentProject } = useProjectStore.getState();
    if (currentProject) {
      let description = 'Updated style properties';
      
      switch (property) {
        case 'name':
          description = `Renamed style to "${style.name}"`;
          break;
        case 'fc':
        case 'bc':
        case 'ec':
          description = 'Changed style colors';
          break;
        case 'fo':
        case 'bo':
          description = 'Adjusted style opacity';
          break;
        case 'fs':
          description = 'Changed font family';
          break;
        case 'sz':
          description = 'Changed font size';
          break;
        case 'ju':
          description = 'Changed text alignment';
          break;
        case 'et':
          description = 'Changed outline style';
          break;
        case 'pd':
          description = 'Changed text direction';
          break;
        case 'ap':
          description = 'Changed anchor point';
          break;
      }
      
      useHistoryStore.getState().record(
        { 
          project: {
            styles: currentProject.styles,
            selectedStyleId: style.id
          }
        },
        description
      );
    }
  };

  const handleColorChange = (property: 'fc' | 'bc' | 'ec', value: string) => {
    recordBeforeUpdate();
    onUpdate(style.id, { [property]: value });
    recordAfterUpdate(property);
  };

  const handleOpacityChange = (property: 'fo' | 'bo', value: number) => {
    recordBeforeUpdate();
    onUpdate(style.id, { [property]: value });
    recordAfterUpdate(property);
  };

  const handleSelectChange = (property: string, value: any) => {
    recordBeforeUpdate();
    onUpdate(style.id, { [property]: value });
    recordAfterUpdate(property);
  };

  return (
    <div className="p-4 bg-surface shadow-inset-subtle">
      <h3 className="font-medium text-text-primary mb-3 text-sm">Edit Style</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">Name</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={style.name}
              onChange={(e) => {
                recordBeforeUpdate();
                onUpdate(style.id, { name: e.target.value });
                recordAfterUpdate('name');
              }}
              className="w-full bg-bg shadow-inset rounded p-2 text-xs text-text-primary"
            />
          </div>
        </div>
        
        {/* Text Color & Opacity */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Text Color</label>
            <div className="flex space-x-2">
              <input
                type="color"
                value={style.fc || '#FFFFFF'}
                onChange={e => handleColorChange('fc', e.target.value)}
                className="w-8 h-8 rounded shadow-inset border-none"
              />
              <input
                type="text"
                value={style.fc || '#FFFFFF'}
                onChange={e => handleColorChange('fc', e.target.value)}
                className="flex-1 bg-bg shadow-inset rounded p-1 text-xs text-text-primary"
              />
            </div>
            <div className="mt-1">
              <label className="block text-xs font-medium text-text-secondary mb-1">
                Opacity: {Math.round((style.fo !== undefined ? style.fo : 1) * 100)}%
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={style.fo !== undefined ? style.fo : 1}
                onChange={e => handleOpacityChange('fo', parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
          
          {/* Background Color & Opacity */}
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Background Color</label>
            <div className="flex space-x-2">
              <input
                type="color"
                value={style.bc || '#000000'}
                onChange={e => handleColorChange('bc', e.target.value)}
                className="w-8 h-8 rounded shadow-inset border-none"
              />
              <input
                type="text"
                value={style.bc || '#000000'}
                onChange={e => handleColorChange('bc', e.target.value)}
                className="flex-1 bg-bg shadow-inset rounded p-1 text-xs text-text-primary"
              />
            </div>
            <div className="mt-1">
              <label className="block text-xs font-medium text-text-secondary mb-1">
                Opacity: {Math.round((style.bo !== undefined ? style.bo : 0.5) * 100)}%
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={style.bo !== undefined ? style.bo : 0.5}
                onChange={e => handleOpacityChange('bo', parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
        </div>
        
        {/* Outline Color & Type */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Outline Color</label>
            <div className="flex space-x-2">
              <input
                type="color"
                value={style.ec || '#000000'}
                onChange={e => handleColorChange('ec', e.target.value)}
                className="w-8 h-8 rounded shadow-inset border-none"
              />
              <input
                type="text"
                value={style.ec || '#000000'}
                onChange={e => handleColorChange('ec', e.target.value)}
                className="flex-1 bg-bg shadow-inset rounded p-1 text-xs text-text-primary"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Outline Style</label>
            <select
              value={style.et || 0}
              onChange={e => handleSelectChange('et', parseInt(e.target.value))}
              className="w-full bg-bg shadow-inset rounded p-2 text-xs text-text-primary"
            >
              <option value={0}>None</option>
              <option value={1}>Hard Shadow</option>
              <option value={2}>Bevel</option>
              <option value={3}>Glow/Outline</option>
              <option value={4}>Soft Shadow</option>
            </select>
          </div>
        </div>
        
        {/* Font Family & Size */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Font Family</label>
            <select
              value={style.fs || '0'}
              onChange={e => handleSelectChange('fs', e.target.value)}
              className="w-full bg-bg shadow-inset rounded p-2 text-xs text-text-primary"
            >
              <option value="0">Roboto (Default)</option>
              <option value="1">Courier New</option>
              <option value="2">Times New Roman</option>
              <option value="3">Lucida Console</option>
              <option value="4">Roboto</option>
              <option value="5">Comic Sans MS</option>
              <option value="6">Monotype Corsiva</option>
              <option value="7">Arial</option>
            </select>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Font Size</label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={style.sz || '100%'}
                onChange={e => handleSelectChange('sz', e.target.value)}
                className="flex-1 bg-bg shadow-inset rounded p-2 text-xs text-text-primary"
              />
              <select
                value={style.sz || '100%'}
                onChange={e => handleSelectChange('sz', e.target.value)}
                className="bg-bg shadow-inset rounded p-2 text-xs text-text-primary"
              >
                <option value="75%">75%</option>
                <option value="100%">100%</option>
                <option value="125%">125%</option>
                <option value="150%">150%</option>
                <option value="200%">200%</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Text Alignment & Direction */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Text Alignment</label>
            <select
              value={style.ju || 3}
              onChange={e => handleSelectChange('ju', parseInt(e.target.value))}
              className="w-full bg-bg shadow-inset rounded p-2 text-xs text-text-primary"
            >
              <option value={1}>Left</option>
              <option value={2}>Right</option>
              <option value={3}>Center (Default)</option>
            </select>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Text Direction</label>
            <select
              value={style.pd || '00'}
              onChange={e => handleSelectChange('pd', e.target.value)}
              className="w-full bg-bg shadow-inset rounded p-2 text-xs text-text-primary"
            >
              <option value="00">Horizontal LTR (Default)</option>
              <option value="20">Vertical RTL</option>
              <option value="21">Vertical LTR</option>
              <option value="30">Rotated 90° CCW, LTR</option>
              <option value="31">Rotated 90° CCW, RTL</option>
            </select>
          </div>
        </div>
        
        {/* Anchor Point */}
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">Anchor Point</label>
          <select
            value={style.ap || 4}
            onChange={e => handleSelectChange('ap', parseInt(e.target.value))}
            className="w-full bg-bg shadow-inset rounded p-2 text-xs text-text-primary"
          >
            <option value={0}>Top-Left</option>
            <option value={1}>Top-Center</option>
            <option value={2}>Top-Right</option>
            <option value={3}>Middle-Left</option>
            <option value={4}>Center (Default)</option>
            <option value={5}>Middle-Right</option>
            <option value={6}>Bottom-Left</option>
            <option value={7}>Bottom-Center</option>
            <option value={8}>Bottom-Right</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default StyleEditor;