import React from 'react';

interface TextEditorPreviewProps {
  selectedText: string;
  textColor: string;
  textOpacity: number;
  backgroundColor: string;
  backgroundOpacity: number;
  fontSize: string;
  fontFamily: string;
  textAlignment: number;
  outlineColor: string;
  outlineType: number;
  anchorPoint: number;
  printDirection: string;
}

const TextEditorPreview: React.FC<TextEditorPreviewProps> = ({
  selectedText,
  textColor,
  textOpacity,
  backgroundColor,
  backgroundOpacity,
  fontSize,
  fontFamily,
  textAlignment,
  outlineColor,
  outlineType,
  anchorPoint,
  printDirection
}) => {
  const getFontFamilyName = (value: string) => {
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

  const getOutlineStyleName = (value: number) => {
    switch (value) {
      case 1: return 'Hard Shadow';
      case 2: return 'Bevel';
      case 3: return 'Glow/Outline';
      case 4: return 'Soft Shadow';
      default: return 'None';
    }
  };

  const getAnchorPointName = (value: number) => {
    switch (value) {
      case 0: return 'Top-Left';
      case 1: return 'Top-Center';
      case 2: return 'Top-Right';
      case 3: return 'Middle-Left';
      case 4: return 'Center';
      case 5: return 'Middle-Right';
      case 6: return 'Bottom-Left';
      case 7: return 'Bottom-Center';
      case 8: return 'Bottom-Right';
      default: return 'Center';
    }
  };

  const getPrintDirectionName = (value: string) => {
    switch (value) {
      case '20': return 'Vertical RTL';
      case '21': return 'Vertical LTR';
      case '30': return 'Rotated 90° CCW, LTR';
      case '31': return 'Rotated 90° CCW, RTL';
      default: return 'Horizontal LTR';
    }
  };

  // Parse text for style tags
  const renderStyledText = (text: string) => {
    // Simple parsing for style tags - in a real app, you'd want a more robust parser
    let styledText = text;
    
    // Apply bold
    styledText = styledText.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
    
    // Apply italic
    styledText = styledText.replace(/\*(.*?)\*/g, '<i>$1</i>');
    
    // Apply underline
    styledText = styledText.replace(/__(.*?)__/g, '<u>$1</u>');
    
    return <span dangerouslySetInnerHTML={{ __html: styledText }} />;
  };

  return (
    <>
      {/* Preview */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-text-secondary mb-1">
          Preview
        </label>
        <div 
          className="bg-black p-4 rounded-lg shadow-inset-subtle"
          style={{
            display: 'flex',
            justifyContent: textAlignment === 1 ? 'flex-start' : textAlignment === 2 ? 'flex-end' : 'center',
            minHeight: '100px',
          }}
        >
          <div
            style={{
              display: 'inline-block',
              padding: '0.5em 1em',
              backgroundColor: `${backgroundColor}${Math.round(backgroundOpacity * 255).toString(16).padStart(2, '0')}`,
              color: `${textColor}${Math.round(textOpacity * 255).toString(16).padStart(2, '0')}`,
              fontFamily: getFontFamilyName(fontFamily),
              fontSize,
              textShadow: getOutlineStyleName(outlineType) !== 'None' 
                ? outlineType === 1 ? `2px 2px 0 ${outlineColor}` 
                : outlineType === 2 ? `1px 1px 0 ${outlineColor}, -1px -1px 0 ${outlineColor.replace('#', '#66')}` 
                : outlineType === 3 ? `0 0 3px ${outlineColor}, 0 0 3px ${outlineColor}, 0 0 3px ${outlineColor}, 0 0 3px ${outlineColor}` 
                : `2px 2px 4px ${outlineColor}`
                : 'none',
              writingMode: printDirection === '20' || printDirection === '21' 
                ? printDirection === '20' ? 'vertical-rl' : 'vertical-lr'
                : 'horizontal-tb',
              textOrientation: printDirection === '20' || printDirection === '21' ? 'upright' : 'mixed',
              transform: printDirection === '30' || printDirection === '31' ? 'rotate(-90deg)' : 'none',
              direction: printDirection === '31' ? 'rtl' : 'ltr',
              textAlign: textAlignment === 1 ? 'left' : textAlignment === 2 ? 'right' : 'center',
            }}
          >
            {renderStyledText(selectedText || 'Preview text will appear here')}
          </div>
        </div>
      </div>
      
      {/* Style Information */}
      <div className="bg-surface rounded-lg p-3 shadow-outset-subtle">
        <div className="text-xs text-text-secondary">
          <p className="mb-1"><strong>Font:</strong> {getFontFamilyName(fontFamily)}</p>
          <p className="mb-1"><strong>Size:</strong> {fontSize}</p>
          <p className="mb-1"><strong>Outline:</strong> {getOutlineStyleName(outlineType)}</p>
          <p className="mb-1"><strong>Anchor:</strong> {getAnchorPointName(anchorPoint)}</p>
          <p><strong>Direction:</strong> {getPrintDirectionName(printDirection)}</p>
        </div>
      </div>
    </>
  );
};

export default TextEditorPreview;