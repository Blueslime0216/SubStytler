import React, { useState, useEffect } from 'react';
import { useProjectStore } from '../../../stores/projectStore';
import { useTimelineStore } from '../../../stores/timelineStore';
import { useSelectedSubtitleStore } from '../../../stores/selectedSubtitleStore';
import { useHistoryStore } from '../../../stores/historyStore';
import { Palette, Type, Sliders, Layout, Eye } from 'lucide-react';
import TextEditorHeader from './TextEditorHeader';
import TextEditorEmptyState from './TextEditorEmptyState';
import '../../../styles/components/text-editor-panel.css';

// 새로운 컴포넌트 임포트
import TextTab from './Tabs/TextTab.tsx';
import StyleTab from './Tabs/StyleTab.tsx';
import PositionTab from './Tabs/PositionTab.tsx';
import EffectsTab from './Tabs/EffectsTab.tsx';
import PreviewTab from './Tabs/PreviewTab.tsx';

// Tabs 컴포넌트 정의
interface TabsProps {
  defaultValue: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

interface TabsListProps {
  children: React.ReactNode;
  className?: string;
}

interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

interface TabsContentProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

// Tabs 컴포넌트 구현
const TabsContext = React.createContext<{
  value: string;
  onValueChange: (value: string) => void;
} | undefined>(undefined);

const Tabs: React.FC<TabsProps> = ({
  defaultValue,
  value,
  onValueChange,
  children,
  className = '',
}) => {
  const [tabValue, setTabValue] = useState(defaultValue);
  
  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : tabValue;
  
  const handleValueChange = (newValue: string) => {
    if (!isControlled) {
      setTabValue(newValue);
    }
    onValueChange?.(newValue);
  };
  
  return (
    <TabsContext.Provider value={{ value: currentValue, onValueChange: handleValueChange }}>
      <div className={className}>
        {children}
      </div>
    </TabsContext.Provider>
  );
};

const TabsList: React.FC<TabsListProps> = ({ children, className = '' }) => {
  return (
    <div className={`flex items-center ${className}`}>
      {children}
    </div>
  );
};

const TabsTrigger: React.FC<TabsTriggerProps> = ({ value, children, className = '' }) => {
  const context = React.useContext(TabsContext);
  
  if (!context) {
    throw new Error('TabsTrigger must be used within a Tabs component');
  }
  
  const { value: selectedValue, onValueChange } = context;
  const isSelected = selectedValue === value;
  
  return (
    <button
      type="button"
      role="tab"
      aria-selected={isSelected}
      onClick={() => onValueChange(value)}
      className={`
        px-3 py-1.5 text-sm font-medium rounded-md transition-all
        ${isSelected 
          ? 'bg-primary text-white shadow-sm' 
          : 'bg-bg hover:bg-bg-hover text-text-secondary'}
        ${className}
      `}
    >
      {children}
    </button>
  );
};

const TabsContent: React.FC<TabsContentProps> = ({ value, children, className = '' }) => {
  const context = React.useContext(TabsContext);
  
  if (!context) {
    throw new Error('TabsContent must be used within a Tabs component');
  }
  
  const { value: selectedValue } = context;
  const isSelected = selectedValue === value;
  
  if (!isSelected) return null;
  
  return (
    <div role="tabpanel" className={className}>
      {children}
    </div>
  );
};

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
        setTextAlignment((span as any).ju ?? 3);
        setOutlineColor((span as any).ec ?? '#000000');
        setOutlineType((span as any).et ?? 0);
        setAnchorPoint((span as any).ap ?? 4);
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
      {/* 상단 텍스트 서식 도구 */}
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
      
      {/* 탭 기반 새로운 레이아웃 */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <Tabs defaultValue="text" className="h-full flex flex-col">
          <div className="px-2 pt-2 border-b border-border-color">
            <TabsList className="grid grid-cols-5 gap-1">
              <TabsTrigger value="text" className="flex items-center gap-1">
                <Type className="w-3.5 h-3.5" />
                <span>텍스트</span>
              </TabsTrigger>
              <TabsTrigger value="style" className="flex items-center gap-1">
                <Palette className="w-3.5 h-3.5" />
                <span>스타일</span>
              </TabsTrigger>
              <TabsTrigger value="position" className="flex items-center gap-1">
                <Layout className="w-3.5 h-3.5" />
                <span>위치</span>
              </TabsTrigger>
              <TabsTrigger value="effects" className="flex items-center gap-1">
                <Sliders className="w-3.5 h-3.5" />
                <span>효과</span>
              </TabsTrigger>
              <TabsTrigger value="preview" className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" />
                <span>미리보기</span>
              </TabsTrigger>
            </TabsList>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            <TabsContent value="text" className="h-full m-0 p-0">
              <TextTab 
                selectedText={selectedText}
                handleTextChange={handleTextChange}
                fontFamily={fontFamily}
                setFontFamily={(value: string) => {
                  setFontFamily(value);
                  handleStyleChange('fs', value);
                }}
                fontSize={fontSize}
                setFontSize={(value: string) => {
                  setFontSize(value);
                  handleStyleChange('sz', value);
                }}
                printDirection={printDirection}
                setPrintDirection={(value: string) => {
                  setPrintDirection(value);
                  handleStyleChange('pd', value);
                }}
              />
            </TabsContent>
            
            <TabsContent value="style" className="h-full m-0 p-0">
              <StyleTab 
                textColor={textColor}
                textOpacity={textOpacity}
                backgroundColor={backgroundColor}
                backgroundOpacity={backgroundOpacity}
                setTextColor={(value: string) => {
                  setTextColor(value);
                  handleStyleChange('fc', value);
                }}
                setTextOpacity={(value: number) => {
                  setTextOpacity(value);
                  handleStyleChange('fo', value);
                }}
                setBackgroundColor={(value: string) => {
                  setBackgroundColor(value);
                  handleStyleChange('bc', value);
                }}
                setBackgroundOpacity={(value: number) => {
                  setBackgroundOpacity(value);
                  handleStyleChange('bo', value);
                }}
              />
            </TabsContent>
            
            <TabsContent value="position" className="h-full m-0 p-0">
              <PositionTab 
                anchorPoint={anchorPoint}
                positionX={positionX}
                positionY={positionY}
                setAnchorPoint={(value: number) => {
                  setAnchorPoint(value);
                  handleStyleChange('ap', value);
                }}
                setPositionX={(value: number) => {
                  setPositionX(value);
                  handleStyleChange('ah', value);
                }}
                setPositionY={(value: number) => {
                  setPositionY(value);
                  handleStyleChange('av', value);
                }}
              />
            </TabsContent>
            
            <TabsContent value="effects" className="h-full m-0 p-0">
              <EffectsTab 
                outlineColor={outlineColor}
                outlineType={outlineType}
                setOutlineColor={(value: string) => {
                  setOutlineColor(value);
                  handleStyleChange('ec', value);
                }}
                setOutlineType={(value: number) => {
                  setOutlineType(value);
                  handleStyleChange('et', value);
                }}
              />
            </TabsContent>
            
            <TabsContent value="preview" className="h-full m-0 p-0">
              <PreviewTab 
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
                positionX={positionX}
                positionY={positionY}
              />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default TextEditorPanel;