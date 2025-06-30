import React, { useState, useEffect } from 'react';
import { useProjectStore } from '../../../stores/projectStore';
import { useTimelineStore } from '../../../stores/timelineStore';
import { useSelectedSubtitleStore } from '../../../stores/selectedSubtitleStore';
import { useHistoryStore } from '../../../stores/historyStore';
import TextEditorHeader from './TextEditorHeader';
import TextEditorContent from './TextEditorContent';
import TextEditorEmptyState from './TextEditorEmptyState';
import '../../../styles/components/text-editor-panel.css';

export const TextEditorPanel: React.FC = () => {
  // Style states
  const [selectedText, setSelectedText] = useState('');
  const [textColor, setTextColor] = useState('#FFFFFF');
  const [textOpacity, setTextOpacity] = useState(255);
  const [backgroundColor, setBackgroundColor] = useState('#000000');
  const [backgroundOpacity, setBackgroundOpacity] = useState(255);
  const [fontSize, setFontSize] = useState('100%');
  const [fontFamily, setFontFamily] = useState('0');
  const [textAlignment, setTextAlignment] = useState(3);
  const [outlineColor, setOutlineColor] = useState('#000000');
  const [outlineType, setOutlineType] = useState(0);
  const [anchorPoint, setAnchorPoint] = useState(4);
  const [positionX, setPositionX] = useState(50);
  const [positionY, setPositionY] = useState(50);
  const [printDirection, setPrintDirection] = useState('00');
  
  // Text format states
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  
  // Store hooks
  const { currentProject, updateSubtitle } = useProjectStore();
  const { currentTime } = useTimelineStore();
  const { selectedSubtitleId } = useSelectedSubtitleStore();

  // Current subtitle: priority to selected, otherwise by current time
  const currentSubtitle = selectedSubtitleId
    ? currentProject?.subtitles.find(sub => sub.id === selectedSubtitleId)
    : currentProject?.subtitles.find(sub => currentTime >= sub.startTime && currentTime <= sub.endTime);

  // Update state on subtitle change
  useEffect(() => {
    if (currentSubtitle) {
      const span = currentSubtitle.spans[0];
      if (span) {
        setSelectedText(span.text || '');
        
        // Style flags
        setIsBold(span.isBold || false);
        setIsItalic(span.isItalic || false);
        setIsUnderline(span.isUnderline || false);
        
        // Style properties from span itself
        setTextColor((span as any).fc || '#FFFFFF');
        setTextOpacity((span as any).fo !== undefined ? (span as any).fo : 255);
        setBackgroundColor((span as any).bc || '#000000');
        setBackgroundOpacity((span as any).bo !== undefined ? (span as any).bo : 255);
        setFontSize((span as any).sz || '100%');
        setFontFamily((span as any).fs || '0');
        setTextAlignment((span as any).ju || 3);
        setOutlineColor((span as any).ec || '#000000');
        setOutlineType((span as any).et || 0);
        setAnchorPoint((span as any).ap || 4);
        setPositionX((span as any).ah ?? 50);
        setPositionY((span as any).av ?? 50);
        setPrintDirection((span as any).pd || '00');
      }
    }
  }, [currentSubtitle, currentProject]);

  // Text change handler
  const handleTextChange = (text: string) => {
    if (!currentSubtitle) return;
    
    // Record state before change
    const { currentProject } = useProjectStore.getState();
    if (currentProject) {
      useHistoryStore.getState().record(
        { 
          project: {
            subtitles: [...currentProject.subtitles],
            selectedSubtitleId
          }
        },
        'Before editing subtitle text',
        true
      );
    }
    
    setSelectedText(text);
    if (currentSubtitle) {
      const updatedSpans = [...currentSubtitle.spans];
      if (updatedSpans[0]) {
        updatedSpans[0] = {
          ...updatedSpans[0],
          text
        };
      }
      updateSubtitle(currentSubtitle.id, { spans: updatedSpans }, false);
      
      // Record state after change
      if (currentProject) {
        setTimeout(() => {
          const { currentProject } = useProjectStore.getState();
          if (currentProject) {
            useHistoryStore.getState().record(
              { 
                project: {
                  subtitles: currentProject.subtitles,
                  selectedSubtitleId
                }
              },
              'Edited subtitle text'
            );
          }
        }, 0);
      }
    }
  };

  // Style change handler
  const handleStyleChange = (property: string, value: any) => {
    if (!currentSubtitle) return;

    // Record state before change
    const { currentProject } = useProjectStore.getState();
    if (currentProject) {
      useHistoryStore.getState().record(
        { project: { subtitles: [...currentProject.subtitles] } },
        `Before changing style (${property})`,
        true
      );
    }

    const updatedSpans = [...currentSubtitle.spans];
    if (updatedSpans[0]) {
      const newVal = (property === 'ah' || property === 'av') ? Math.round(value) : value;
      updatedSpans[0] = {
        ...updatedSpans[0],
        [property]: newVal,
      } as any;
    }
    updateSubtitle(currentSubtitle.id, { spans: updatedSpans }, false);

    // After 기록
    if (currentProject) {
      useHistoryStore.getState().record(
        { project: { subtitles: currentProject.subtitles } },
        `Changed style (${property})`
      );
    }
  };

  // Toggle text style
  const toggleTextStyle = (style: 'bold' | 'italic' | 'underline') => {
    if (!currentSubtitle) return;
    
    // Record state before change
    const { currentProject } = useProjectStore.getState();
    if (currentProject) {
      useHistoryStore.getState().record(
        { 
          project: {
            subtitles: [...currentProject.subtitles],
            selectedSubtitleId
          }
        },
        'Before applying text style',
        true
      );
    }
    
    let newState = false;
    
    switch (style) {
      case 'bold':
        newState = !isBold;
        setIsBold(newState);
        break;
      case 'italic':
        newState = !isItalic;
        setIsItalic(newState);
        break;
      case 'underline':
        newState = !isUnderline;
        setIsUnderline(newState);
        break;
    }
    
    // Update subtitle
    if (currentSubtitle) {
      const updatedSpans = [...currentSubtitle.spans];
      if (updatedSpans[0]) {
        updatedSpans[0] = {
          ...updatedSpans[0],
          [style === 'bold' ? 'isBold' : style === 'italic' ? 'isItalic' : 'isUnderline']: newState
        };
      }
      updateSubtitle(currentSubtitle.id, { spans: updatedSpans }, false);
      
      // Record state after change
      if (currentProject) {
        setTimeout(() => {
          const { currentProject } = useProjectStore.getState();
          if (currentProject) {
            useHistoryStore.getState().record(
              { 
                project: {
                  subtitles: currentProject.subtitles,
                  selectedSubtitleId
                }
              },
              newState ? `Applied ${style} style` : `Removed ${style} style`
            );
          }
        }, 0);
      }
    }
  };

  // Display empty state if no subtitle is selected
  if (!currentSubtitle) {
    return <TextEditorEmptyState />;
  }

  return (
    <div className="h-full flex flex-col bg-surface">
      {/* Header: Text formatting tools */}
      <TextEditorHeader 
        toggleTextStyle={toggleTextStyle}
        isBold={isBold}
        isItalic={isItalic}
        isUnderline={isUnderline}
        textAlignment={textAlignment}
        setTextAlignment={(value) => {
          setTextAlignment(value);
          handleStyleChange('ju', value);
        }}
      />
      
      <div className="flex flex-col flex-1 min-h-0 overflow-auto">
        <div className="flex-1 overflow-y-auto">
          {/* Content: Style editor */}
          <TextEditorContent
            selectedText={selectedText}
            handleTextChange={handleTextChange}
            textColor={textColor}
            textOpacity={textOpacity}
            backgroundColor={backgroundColor}
            backgroundOpacity={backgroundOpacity}
            fontSize={fontSize}
            fontFamily={fontFamily}
            outlineColor={outlineColor}
            outlineType={outlineType}
            anchorPoint={anchorPoint}
            printDirection={printDirection}
            positionX={positionX}
            positionY={positionY}
            setTextColor={(value) => {
              setTextColor(value);
              handleStyleChange('fc', value);
            }}
            setTextOpacity={(value) => {
              setTextOpacity(value);
              handleStyleChange('fo', value);
            }}
            setBackgroundColor={(value) => {
              setBackgroundColor(value);
              handleStyleChange('bc', value);
            }}
            setBackgroundOpacity={(value) => {
              setBackgroundOpacity(value);
              handleStyleChange('bo', value);
            }}
            setFontSize={(value) => {
              setFontSize(value);
              handleStyleChange('sz', value);
            }}
            setFontFamily={(value) => {
              setFontFamily(value);
              handleStyleChange('fs', value);
            }}
            setOutlineColor={(value) => {
              setOutlineColor(value);
              handleStyleChange('ec', value);
            }}
            setOutlineType={(value) => {
              setOutlineType(value);
              handleStyleChange('et', value);
            }}
            setAnchorPoint={(value) => {
              setAnchorPoint(value);
              handleStyleChange('ap', value);
            }}
            setPrintDirection={(value) => {
              setPrintDirection(value);
              handleStyleChange('pd', value);
            }}
            setPositionX={(value: number)=>{
              setPositionX(value);
              handleStyleChange('ah', value);
            }}
            setPositionY={(value: number)=>{
              setPositionY(value);
              handleStyleChange('av', value);
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default TextEditorPanel;