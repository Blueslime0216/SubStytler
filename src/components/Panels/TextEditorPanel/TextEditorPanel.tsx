import React, { useState, useEffect } from 'react';
import { useProjectStore } from '../../../stores/projectStore';
import { useTimelineStore } from '../../../stores/timelineStore';
import { useSelectedSubtitleStore } from '../../../stores/selectedSubtitleStore';
import { useHistoryStore } from '../../../stores/historyStore';
import TextEditorHeader from './TextEditorHeader';
import TextEditorContent from './TextEditorContent';
import TextEditorPreview from './TextEditorPreview';
import TextEditorEmptyState from './TextEditorEmptyState';
import '../../../styles/components/text-editor-panel.css';

export const TextEditorPanel: React.FC = () => {
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
  
  // Text formatting states
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  
  const { currentProject, updateSubtitle } = useProjectStore();
  const { currentTime } = useTimelineStore();
  const { selectedSubtitleId } = useSelectedSubtitleStore();

  // Determine subtitle: prefer explicitly selected, fall back to one at playhead.
  const currentSubtitle = selectedSubtitleId
    ? currentProject?.subtitles.find(sub => sub.id === selectedSubtitleId)
    : currentProject?.subtitles.find(sub => currentTime >= sub.startTime && currentTime <= sub.endTime);

  useEffect(() => {
    if (currentSubtitle) {
      const span = currentSubtitle.spans[0];
      if (span) {
        setSelectedText(span.text || '');
        
        // Get styling flags from span
        setIsBold(span.isBold || false);
        setIsItalic(span.isItalic || false);
        setIsUnderline(span.isUnderline || false);
        
        // span 자체에 포함된 스타일 속성을 그대로 읽는다
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

  const handleTextChange = (text: string) => {
    if (!currentSubtitle) return;
    
    // Record state before changing text
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
        true // Mark as internal
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
      updateSubtitle(currentSubtitle.id, { spans: updatedSpans });
      
      // Record state after changing text
      if (currentProject) {
        // Small delay to ensure the update has been applied
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

  const handleStyleChange = (property: string, value: any) => {
    if (!currentSubtitle) return;

    // 상태 기록 (Undo용)
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
      updatedSpans[0] = {
        ...updatedSpans[0],
        [property]: value,
      } as any;
    }
    updateSubtitle(currentSubtitle.id, { spans: updatedSpans });
  };

  // New toggle-based text formatting
  const toggleTextStyle = (style: 'bold' | 'italic' | 'underline') => {
    if (!currentSubtitle) return;
    
    // Record state before applying text style
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
        true // Mark as internal
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
    
    // Update the subtitle span with the new style flags
    if (currentSubtitle) {
      const updatedSpans = [...currentSubtitle.spans];
      if (updatedSpans[0]) {
        updatedSpans[0] = {
          ...updatedSpans[0],
          [style === 'bold' ? 'isBold' : style === 'italic' ? 'isItalic' : 'isUnderline']: newState
        };
      }
      updateSubtitle(currentSubtitle.id, { spans: updatedSpans });
      
      // Record state after applying text style
      if (currentProject) {
        // Small delay to ensure the update has been applied
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
              newState ? `Applied ${style} style to text` : `Removed ${style} style from text`
            );
          }
        }, 0);
      }
    }
  };

  if (!currentSubtitle) {
    return <TextEditorEmptyState />;
  }

  return (
    <div className="h-full min-w-0 min-h-0 flex flex-col text-editor-panel-root">
      <div className="flex-1 min-w-0 min-h-0 overflow-auto">
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
        <TextEditorPreview
          selectedText={selectedText}
          textColor={textColor}
          textOpacity={textOpacity}
          backgroundColor={backgroundColor}
          backgroundOpacity={backgroundOpacity}
          fontSize={fontSize}
          fontFamily={fontFamily}
          textAlignment={textAlignment}
          outlineColor={outlineColor}
          outlineType={outlineType}
          anchorPoint={anchorPoint}
          printDirection={printDirection}
          isBold={isBold}
          isItalic={isItalic}
          isUnderline={isUnderline}
        />
      </div>
    </div>
  );
};

export default TextEditorPanel;