import React from 'react';
import { motion } from 'framer-motion';
import { SubtitleBlock } from '../../types/project';

interface Props {
  subtitle: SubtitleBlock;
  containerRef?: React.RefObject<HTMLDivElement>;
}

// 렌더링에 필요한 모든 계산을 컴포넌트 내부에서 수행한다.
const SingleSubtitle: React.FC<Props> = ({ subtitle, containerRef }) => {
  const span = subtitle.spans[0] || { text: '' } as any;
  const style = span as any;

  /* ----------------- 헬퍼 ----------------- */
  // 실제 비디오 태그 높이
  function getVideoHeight(): number {
    const container = containerRef?.current;
    if (!container) return 1080;
    const videoEl = container.querySelector('.video-player-element.video-loaded') as HTMLElement | null;
    if (videoEl && videoEl.clientHeight) return videoEl.clientHeight;
    return container.clientHeight || 1080;
  }

  // 위치 계산
  const getPositionStyle = (): React.CSSProperties => {
    const ap = style?.ap ?? 4;
    const ahRaw = style?.ah ?? 50;
    const avRaw = style?.av ?? 50;

    const ah = ahRaw * 0.96 + 2;
    const av = avRaw * 0.96 + 2;

    const offsetX = [0, -50, -100, 0, -50, -100, 0, -50, -100][ap];
    const offsetY = [0, 0, 0, -50, -50, -50, -100, -100, -100][ap];

    let textAlign: React.CSSProperties['textAlign'] = 'center';
    const ju = style?.ju;
    if (ju === 0) textAlign = 'left';
    if (ju === 1) textAlign = 'right';

    return {
      left: `${ah}%`,
      top: `${av}%`,
      transform: `translate(${offsetX}%, ${offsetY}%)`,
      textAlign,
    };
  };

  // 크기 계산
  const getSizing = () => {
    const videoH = getVideoHeight();
    const baseBoxH = (videoH / 1080) * 55; // 55 고정(요구사항)
    const szNum = parseFloat(style?.sz || '100%');
    const scale = (100 + (szNum - 100) / 4) / 100;
    const boxH = baseBoxH * scale;
    const fontPx = boxH * 0.9;
    return { boxH, fontPx };
  };

  // 기타 스타일
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

  const getOutlineStyle = () => {
    const et = style?.et;
    const ec = style?.ec || '#000000';
    if (!et) return {};
    if (et === 1) return { textShadow: `2px 2px 0 ${ec}` };
    if (et === 2) return { textShadow: `1px 1px 0 ${ec}, -1px -1px 0 ${ec.replace('#', '#66')}` };
    if (et === 3) return { textShadow: `0 0 3px ${ec}, 0 0 3px ${ec}` };
    if (et === 4) return { textShadow: `2px 2px 4px ${ec}` };
    return {};
  };

  const getVerticalStyle = () => {
    const pd = style?.pd || '00';
    if (pd === '20') return { writingMode: 'vertical-rl' as const };
    if (pd === '21') return { writingMode: 'vertical-lr' as const };
    if (pd === '30') return { transform: 'rotate(-90deg)', writingMode: 'horizontal-tb' as const };
    if (pd === '31') return { transform: 'rotate(-90deg)', writingMode: 'horizontal-tb' as const, direction: 'rtl' as const };
    return { writingMode: 'horizontal-tb' as const };
  };

  // 색상 처리
  const hexToRgba = (hex: string, alpha: number) => {
    const clean = hex.replace('#', '');
    const bigint = parseInt(clean, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  /* ---------------- 렌더링 ---------------- */
  const { boxH, fontPx } = getSizing();
  const posStyle = getPositionStyle();
  const fontFamily = getFontFamily();
  const outlineStyle = getOutlineStyle();
  const verticalStyle = getVerticalStyle();

  const fg = hexToRgba(style?.fc || '#FFFFFF', (style?.fo ?? 255) / 255);
  const bg = hexToRgba(style?.bc || '#080808', (style?.bo ?? 255) / 255);

  return (
    <motion.div
      style={{
        position: 'absolute',
        ...posStyle,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
        zIndex: 30,
      }}
    >
      <div
        style={{
          height: `${boxH}px`,
          backgroundColor: bg,
          color: fg,
          fontFamily,
          fontSize: `${fontPx}px`,
          fontWeight: span.isBold ? 'bold' : 'normal',
          fontStyle: span.isItalic ? 'italic' : 'normal',
          textDecoration: span.isUnderline ? 'underline' : 'none',
          whiteSpace: 'nowrap',
          lineHeight: 1,
          overflow: 'hidden',
          padding: `0 ${fontPx * 0.2}px`,
          ...outlineStyle,
          ...verticalStyle,
        }}
      >
        {span.text}
      </div>
    </motion.div>
  );
};

export default SingleSubtitle; 