import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTimelineStore } from '../../stores/timelineStore';
import { useProjectStore } from '../../stores/projectStore';
import { useYTTStore } from '../../stores/yttStore';

export const SubtitleOverlay: React.FC<{ containerRef?: React.RefObject<HTMLDivElement> }> = ({ containerRef }) => {
  // 모든 Hook을 최상단에 선언
  const { currentTime } = useTimelineStore();
  const { currentProject } = useProjectStore();
  const { parsed } = useYTTStore();
  const [dynamicFontSize, setDynamicFontSize] = useState(11);
  useEffect(() => {
    if (!containerRef?.current) return;
    const updateFontSize = () => {
      const h = containerRef.current?.clientHeight || 319;
      setDynamicFontSize(h * 0.055); // 5.5% 비율 (YouTube 기준 자막 높이 약 5.5%)
    };
    updateFontSize();
    window.addEventListener('resize', updateFontSize);
    return () => window.removeEventListener('resize', updateFontSize);
  }, [containerRef]);

  // 프로젝트 편집 중엔 currentProject 가 가장 최신 데이터를 보유하므로 우선 사용한다.
  // 외부 YTT 파일만 로드된 상태(프로젝트 없음)라면 parsed 값을 사용.
  const subtitleSource = currentProject?.subtitles?.length ? currentProject : parsed;

  const currentSubtitle = subtitleSource?.subtitles?.find(
    sub => currentTime >= sub.startTime && currentTime <= sub.endTime
  );

  if (!currentSubtitle) return null;

  // 자막의 첫 span에 포함된 스타일 속성을 직접 사용한다.
  const style = currentSubtitle?.spans[0] as any;

  // Get text and styling properties
  const span = currentSubtitle.spans[0] || { text: '' };
  const text = span.text || '';
  const isBold = span.isBold || false;
  const isItalic = span.isItalic || false;
  const isUnderline = span.isUnderline || false;

  // Calculate position based on anchor point
  const getPositionStyle = () => {
    const ap = style?.ap ?? 4; // anchor point 0-8
    const ahRaw = style?.ah ?? 50; // 지정 X (0-100)
    const avRaw = style?.av ?? 50; // 지정 Y (0-100)

    // YouTube 실제 좌표 보정 공식: effective = (specified * 0.96) + 2
    const ah = ahRaw * 0.96 + 2;
    const av = avRaw * 0.96 + 2;

    // Transform 기반 offset 계산 (ap 기준점 보정)
    const offsetXMap = [0, -50, -100, 0, -50, -100, 0, -50, -100];
    const offsetYMap = [0, 0, 0, -50, -50, -50, -100, -100, -100];

    const translateX = `${offsetXMap[ap]}%`;
    const translateY = `${offsetYMap[ap]}%`;

    // Text alignment (ju: 0=left,1=right,2=center?) 기존 구현 상 반대지만 그대로
    let textAlign: React.CSSProperties['textAlign'] = 'center';
    const ju = style?.ju;
    if (ju === 0) textAlign = 'left';
    if (ju === 1) textAlign = 'right';
    if (ju === 2) textAlign = 'center';

    return {
      left: `${ah}%`,
      top: `${av}%`,
      transform: `translate(${translateX}, ${translateY})`,
      textAlign,
    } as React.CSSProperties;
  };

  // Get font family
  const getFontFamily = () => {
    const fs = style?.fs || '0';
    
    switch (fs) {
      case '1': return 'Courier New, monospace';
      case '2': return 'Times New Roman, serif';
      case '3': return 'Lucida Console, monospace';
      case '4': return 'Roboto, sans-serif';
      case '5': return 'Comic Sans MS, cursive';
      case '6': return 'Monotype Corsiva, cursive';
      case '7': return 'Arial, sans-serif';
      default: return 'Roboto, sans-serif';
    }
  };

  // Get text outline style
  const getTextOutlineStyle = () => {
    const et = style?.et;
    const ec = style?.ec || '#000000';
    
    if (!et) return {};
    
    switch (et) {
      case 1: // Hard shadow
        return { textShadow: `2px 2px 0 ${ec}` };
      case 2: // Bevel
        return { textShadow: `1px 1px 0 ${ec}, -1px -1px 0 ${ec.replace('#', '#66')}` };
      case 3: // Glow/Outline
        return { textShadow: `0 0 3px ${ec}, 0 0 3px ${ec}, 0 0 3px ${ec}, 0 0 3px ${ec}` };
      case 4: // Soft shadow
        return { textShadow: `2px 2px 4px ${ec}` };
      default:
        return {};
    }
  };

  // Get vertical text orientation
  const getVerticalTextStyle = () => {
    const pd = style?.pd || '00'; // Default horizontal LTR
    switch (pd) {
      case '20': // Vertical RTL
        return {
          writingMode: 'vertical-rl' as React.CSSProperties['writingMode'],
        };
      case '21': // Vertical LTR
        return {
          writingMode: 'vertical-lr' as React.CSSProperties['writingMode'],
        };
      case '30': // Rotated 90° CCW, LTR
        return {
          transform: 'rotate(-90deg)',
          writingMode: 'horizontal-tb' as React.CSSProperties['writingMode']
        };
      case '31': // Rotated 90° CCW, RTL
        return {
          transform: 'rotate(-90deg)',
          writingMode: 'horizontal-tb' as React.CSSProperties['writingMode'],
          direction: 'rtl' as React.CSSProperties['direction']
        };
      default: // Horizontal LTR
        return {
          writingMode: 'horizontal-tb' as React.CSSProperties['writingMode']
        };
    }
  };

  // Calculate font size
  const getFontSize = () => {
    const sz = style?.sz || '100%';
    return sz;
  };

  const positionStyle = getPositionStyle();
  const fontFamily = getFontFamily();
  const textOutlineStyle = getTextOutlineStyle();
  const verticalTextStyle = getVerticalTextStyle();
  const fontSize = getFontSize();

  // Hex -> rgba 변환 헬퍼
  const hexToRgba = (hex: string, alpha: number) => {
    const cleanHex = hex.replace('#', '');
    const bigint = parseInt(cleanHex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  // 색상 처리
  const fgColorHex = style?.fc || '#FFFFFF';
  const fgOpacity = (style?.fo ?? 255) / 255;
  const bgColorHex = style?.bc || '#080808';
  const bgOpacity = (style?.bo ?? 255) / 255;

  const colorCss = hexToRgba(fgColorHex, fgOpacity);
  const backgroundCss = hexToRgba(bgColorHex, bgOpacity);

  return (
    <div className="absolute inset-0 pointer-events-none">
      <AnimatePresence>
        <motion.div 
          style={{
            position: 'absolute',
            ...positionStyle,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
            zIndex: 30,
          }}
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            style={{
              width: 'auto',
              height: 'auto',
              backgroundColor: backgroundCss,
              color: colorCss,
              fontFamily: fontFamily,
              fontSize: '1.2em', // height 기준 상대값, 필요시 조정
              fontWeight: isBold ? 'bold' : 'normal',
              fontStyle: isItalic ? 'italic' : 'normal',
              textDecoration: isUnderline ? 'underline' : 'none',
              textAlign: positionStyle.textAlign,
              whiteSpace: 'nowrap',
              lineHeight: 1,
              overflow: 'hidden',
              borderRadius: 2,
              ...textOutlineStyle,
              ...verticalTextStyle
            }}
          >
            {text}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};