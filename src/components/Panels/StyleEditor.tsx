import React from 'react';
import { SubtitleStyle } from '../../types/project';

interface StyleEditorProps {
  style: SubtitleStyle;
  onUpdate: (id: string, patch: Partial<SubtitleStyle>) => void;
}

const StyleEditor: React.FC<StyleEditorProps> = ({ style, onUpdate }) => (
  <div className="neu-panel-header p-3">
    <h3 className="font-medium neu-text-primary mb-3 text-sm">Edit Style</h3>
    <div className="space-y-3">
      <div>
        <label className="block text-xs neu-text-secondary mb-1">Name</label>
        <input
          type="text"
          value={style.name}
          onChange={e => onUpdate(style.id, { name: e.target.value })}
          className="w-full neu-input text-xs"
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs neu-text-secondary mb-1">Text Color</label>
          <input
            type="color"
            value={style.fc}
            onChange={e => onUpdate(style.id, { fc: e.target.value })}
            className="w-full h-6 rounded neu-shadow-inset border-none"
          />
        </div>
        <div>
          <label className="block text-xs neu-text-secondary mb-1">Background</label>
          <input
            type="color"
            value={style.bc}
            onChange={e => onUpdate(style.id, { bc: e.target.value })}
            className="w-full h-6 rounded neu-shadow-inset border-none"
          />
        </div>
      </div>
      <div>
        <label className="block text-xs neu-text-secondary mb-1">Font Family</label>
        <select
          value={style.fs}
          onChange={e => onUpdate(style.id, { fs: e.target.value })}
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
          value={style.sz}
          onChange={e => onUpdate(style.id, { sz: e.target.value })}
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
);

export default StyleEditor; 