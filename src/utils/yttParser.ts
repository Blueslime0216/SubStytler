import { SubtitleBlock, SubtitleSpan, SubtitleStyle } from '../types/project';

// 간단한 .ytt(XML) 파서
//  - <pen>, <ws>, <wp> 정의를 읽어들여 스타일을 생성한다.
//  - <p> 태그(자막 문단)를 읽어 SubtitleBlock 목록을 생성한다.
//  - 복잡한 속성은 우선 주요 항목(fc, fo, bc, bo, ec, et, fs, sz, ju, pd, ap, ah, av)만 지원한다.

export interface ParsedYTT {
  styles: SubtitleStyle[];
  subtitles: SubtitleBlock[];
}

const attr = (el: Element, name: string): string | undefined => {
  const v = el.getAttribute(name);
  return v !== null ? v : undefined;
};

export const parseYTT = (xmlString: string): ParsedYTT => {
  // DOMParser는 브라우저 환경에서 전역으로 제공됨 (Vite + React 클라이언트 코드)
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlString, 'application/xml');

  // 1️⃣ <pen> → 스타일 속성
  const penElements = Array.from(doc.getElementsByTagName('pen'));
  const penStyleMap = new Map<number, SubtitleStyle>();
  penElements.forEach((el) => {
    const id = Number(attr(el, 'id') || '0');
    const styleId = `pen-${id}`;

    const style: SubtitleStyle = {
      id: styleId,
      name: styleId,
      fc: attr(el, 'fc'),
      fo: attr(el, 'fo') ? Number(attr(el, 'fo')) : undefined,
      bc: attr(el, 'bc'),
      bo: attr(el, 'bo') ? Number(attr(el, 'bo')) : undefined,
      ec: attr(el, 'ec'),
      et: attr(el, 'et') ? Number(attr(el, 'et')) : undefined,
      fs: attr(el, 'fs'),
      sz: attr(el, 'sz'),
      ju: attr(el, 'ju') ? Number(attr(el, 'ju')) : undefined,
      pd: attr(el, 'pd'),
      ap: attr(el, 'ap') ? Number(attr(el, 'ap')) : undefined,
      // ah / av 는 <wp> 정의에서 가져옴
    };

    penStyleMap.set(id, style);
  });

  // 2️⃣ <ws> → 정렬/방향 속성
  const wsElements = Array.from(doc.getElementsByTagName('ws'));
  const wsMap = new Map<number, Partial<SubtitleStyle>>();
  wsElements.forEach((el) => {
    const id = Number(attr(el, 'id') || '0');
    wsMap.set(id, {
      ju: attr(el, 'ju') ? Number(attr(el, 'ju')) : undefined,
      pd: attr(el, 'pd'),
      sd: attr(el, 'sd'),
    });
  });

  // 3️⃣ <wp> → 위치(anchor point, 좌표) 속성
  const wpElements = Array.from(doc.getElementsByTagName('wp'));
  const wpMap = new Map<number, Partial<SubtitleStyle>>();
  wpElements.forEach((el) => {
    const id = Number(attr(el, 'id') || '0');
    wpMap.set(id, {
      ap: attr(el, 'ap') ? Number(attr(el, 'ap')) : undefined,
      ah: attr(el, 'ah') ? Number(attr(el, 'ah')) : undefined,
      av: attr(el, 'av') ? Number(attr(el, 'av')) : undefined,
    });
  });

  const styles: SubtitleStyle[] = [];

  // Helper: 스타일 캐싱 (같은 조합 재사용)
  const styleCache = new Map<string, SubtitleStyle>();

  // 4️⃣ <p> → 자막 블록
  const pElements = Array.from(doc.getElementsByTagName('p'));
  const subtitles: SubtitleBlock[] = pElements.map((el, index) => {
    const start = Number(attr(el, 't') || '0');
    const dur = Number(attr(el, 'd') || '0');
    const end = start + dur;

    const penId = attr(el, 'p') ? Number(attr(el, 'p')) : undefined;
    const wsId = attr(el, 'ws') ? Number(attr(el, 'ws')) : undefined;
    const wpId = attr(el, 'wp') ? Number(attr(el, 'wp')) : undefined;

    // 기본 pen 스타일
    const baseStyle = penId !== undefined ? penStyleMap.get(penId) : undefined;
    // ws / wp 덮어쓰기
    const wsStyle = wsId !== undefined ? wsMap.get(wsId) : undefined;
    const wpStyle = wpId !== undefined ? wpMap.get(wpId) : undefined;

    // 스타일 병합
    const mergedStyle: SubtitleStyle = {
      ...(baseStyle || { id: 'default', name: 'Default' }),
      ...(wsStyle || {}),
      ...(wpStyle || {}),
    } as SubtitleStyle;

    // 고유 스타일 ID 만들기 (pen-ws-wp 조합)
    const styleKey = JSON.stringify({ penId, wsId, wpId });
    let styleId: string;

    if (styleCache.has(styleKey)) {
      styleId = styleCache.get(styleKey)!.id;
    } else {
      styleId = `style-${penId ?? 'd'}-${wsId ?? 'd'}-${wpId ?? 'd'}`;
      mergedStyle.id = styleId;
      mergedStyle.name = styleId;
      styles.push(mergedStyle);
      styleCache.set(styleKey, mergedStyle);
    }

    const span: SubtitleSpan = {
      id: `span-${index}`,
      text: el.textContent || '',
      startTime: 0,
      endTime: dur,
      styleId,
      // pen bold/italic/underline 속성은 pen 정의에 b/i/u 로 존재하지만, 간단화를 위해 생략.
    };

    const block: SubtitleBlock = {
      id: `sub-${index}`,
      spans: [span],
      startTime: start,
      endTime: end,
      trackId: 'default',
    };
    return block;
  });

  return { styles, subtitles };
}; 