import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SubtitleBlock, SubtitleStyle } from '../../../types/project';

// Utility: escape XML special chars
const escapeXml = (unsafe: string) => unsafe
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&apos;');

interface GenerateYttOptions {
  subtitles: SubtitleBlock[];
  styles: SubtitleStyle[];
}

// Default values – 쉽게 수정 가능하도록 상수로 분리
const DEFAULTS = {
  fc: '#FEFEFE', // 기본 전경색
  fo: 254,       // 기본 불투명도
};

/**
 * 간단한 YTT 문자열 생성기
 *  - 스타일을 <pen>으로 정의 (사용된 스타일만)
 *  - 자막을 <p> 태그로 배치 (스팬 1개만 가정)
 */
const generateYtt = ({ subtitles, styles }: GenerateYttOptions) => {
  if (subtitles.length === 0) return '';

  // 1️⃣ 스타일 ID 매핑 (styleId -> penId)
  const styleMap = new Map<string, number>();
  let penCounter = 1;
  subtitles.forEach(sub => {
    sub.spans.forEach(span => {
      if (span.styleId && !styleMap.has(span.styleId)) {
        styleMap.set(span.styleId, penCounter++);
      }
    });
  });

  // Helper: style 객체 → pen 속성 문자열
  const buildPenAttrs = (style: SubtitleStyle | undefined): string => {
    if (!style) return '';
    const attrs: string[] = [];
    if (style.fc && style.fc !== DEFAULTS.fc) attrs.push(`fc="${style.fc}"`);
    if (typeof style.fo === 'number' && style.fo !== DEFAULTS.fo) attrs.push(`fo="${style.fo}"`);
    if (style.bc) attrs.push(`bc="${style.bc}"`);
    if (typeof style.bo === 'number') attrs.push(`bo="${style.bo}"`);
    if (style.ec) attrs.push(`ec="${style.ec}"`);
    if (typeof style.et === 'number') attrs.push(`et="${style.et}"`);
    if (style.fs) attrs.push(`fs="${style.fs}"`);
    if (style.sz) attrs.push(`sz="${style.sz}"`);
    // 기타 속성들 추가 필요 시 확장 가능
    return attrs.join(' ');
  };

  // 2️⃣ <head> 섹션 구성
  let head = '    <!-- Generated pens -->\n';
  for (const [styleId, penId] of styleMap.entries()) {
    const styleObj = styles.find(s => s.id === styleId);
    const penAttrs = buildPenAttrs(styleObj);
    head += `    <pen id="${penId}" ${penAttrs} />\n`;
  }

  // 3️⃣ <body> 섹션 구성
  let body = '';
  subtitles.forEach(sub => {
    const start = sub.startTime;
    const duration = sub.endTime - sub.startTime;
    const firstSpan = sub.spans[0];
    const penId = firstSpan.styleId ? styleMap.get(firstSpan.styleId) ?? 0 : 0;
    const textEscaped = escapeXml(firstSpan.text || '');
    if (penId) {
      body += `    <p t="${start}" d="${duration}" p="${penId}">${textEscaped}</p>\n`;
    } else {
      body += `    <p t="${start}" d="${duration}">${textEscaped}</p>\n`;
    }
  });

  const headerTemplate = `<?xml version="1.0" encoding="utf-8" ?>\n<timedtext format="3">\n<head>\n${head}</head>\n<body>\n`;
  const footerTemplate = '</body>\n</timedtext>';

  return headerTemplate + body + footerTemplate;
};

interface SubtitlePreviewListProps {
  subtitles: SubtitleBlock[];
  styles: SubtitleStyle[];
}

export const SubtitlePreviewList: React.FC<SubtitlePreviewListProps> = ({ subtitles, styles }) => {
  const yttContent = generateYtt({ subtitles, styles });
  const placeholder = 'Add subtitles to generate YTT preview.';
  const [copied, setCopied] = useState(false);

  // 클릭 시 복사 기능
  const handleCopy = () => {
    navigator.clipboard.writeText(yttContent || placeholder)
      .then(() => {
        // 복사 후 텍스트 선택 해제
        if (window.getSelection) {
          const sel = window.getSelection();
          if (sel) sel.removeAllRanges();
        }
        setCopied(true);
        setTimeout(() => setCopied(false), 800); // 0.8초로 단축
      })
      .catch(console.error);
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div
        className={`flex-1 min-h-0 overflow-y-auto bg-[#18181b] font-mono text-xs rounded-md border ${
          copied ? 'border-green-500 shadow-[0_0_0_1px_rgba(34,197,94,0.4)] select-none' : 'border-[#222] select-all'
        } shadow-inner transition-all duration-150 hover:bg-[#232326] hover:border-[#444] cursor-pointer whitespace-pre-wrap p-2`}
        title="Click to copy YTT code"
        onClick={handleCopy}
      >
        {yttContent || placeholder}
      </div>
      
      <AnimatePresence>
        {copied && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-[1px] flex items-center justify-center bg-[#18181b]/90 rounded-[5px] overflow-hidden pointer-events-none"
          >
            <span className="text-green-400 font-medium">
              Copied to clipboard!
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};