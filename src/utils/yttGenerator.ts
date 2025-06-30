import { Project, SubtitleBlock, SubtitleSpan, SubtitleStyle } from '../types/project';

/**
 * YouTube Timed Text(.ytt) 파일을 **프로젝트의 스타일 목록**이 아닌
 * "자막 순서"에 따라 동적으로 <pen>, <ws>, <wp> 태그를 생성하여 반환한다.
 * -----------------------------------------------------------------------
 * 동작 개요
 * 1. 자막을 시간순으로 순회하며 필요한 스타일 속성(색·투명도·폰트 등)을 수집한다.
 *    - 동일한 속성 조합이 재등장하면 기존 ID(pen/ws/wp)를 재사용
 * 2. 수집된 스타일 정보를 ID 순서대로 <head> 영역에 기술한다.
 * 3. <body> 영역에는 각 자막(<p>)을 작성하되, t / d 는 정수(ms)를 사용하고
 *    penId / wsId / wpId 를 연결한다.
 * 4. 유튜브 업로드 시 속성 유실을 막기 위해 다음 후처리를 적용한다.
 *    - fc : #FFFFFF → #FEFEFE 자동 변환
 *    - fo / bo : 0~1 → 0~255 로 변환 후, 255 → 254 로 치환
 * -----------------------------------------------------------------------
 * 가독성을 위해 "빠른" 알고리즘보다는 "읽기 쉬운" 절차적 코드를 사용했다.
 * (Map 자료구조 등을 사용해도 로직 단계는 명확하게 분리)
 */
export function generateYTTContent(project: Project): string {
  /* ------------------------------------------------------------------ */
  /* 0. 유틸 함수 정의                                                  */
  /* ------------------------------------------------------------------ */

  /** XML 특수문자 이스케이프 */
  const escapeXml = (unsafe: string): string =>
    unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');

  /**
   * '#RRGGBB' → 색상 문자열 보정
   *  - #FFFFFF 는 #FEFEFE 로 대체 (Android 흰색 무시 버그 회피)
   *  - 그 외 색상은 그대로 반환
   */
  const normalizeColor = (hex?: string): string | undefined => {
    if (!hex) return undefined;
    return hex.toLowerCase() === '#ffffff' ? '#FEFEFE' : hex;
  };

  /** 0~1(소수) | 0~255(정수) → 0~254 범위 정수로 변환 */
  const normalizeOpacity = (value?: number): number | undefined => {
    if (value === undefined) return undefined;
    // 값은 항상 0~255 범위의 정수로 가정하고, 소수점일 경우 반올림
    let v = Math.round(value);
    // 255는 업로드 시 속성 유실되므로 254로 치환
    if (v === 255) v = 254;
    return v;
  };

  /** pen(글꼴/색 등) 속성 Key 생성 → Map 키로 사용 */
  const makePenKey = (s: SubtitleStyle): string =>
    [s.fc, s.fo, s.bc, s.bo, s.ec, s.et, s.fs, s.sz].join('|');

  /** ws(정렬/방향) 속성 Key */
  const makeWsKey = (s: SubtitleStyle): string =>
    [s.ju, s.pd, s.sd].join('|');

  /** wp(위치) 속성 Key */
  const makeWpKey = (s: SubtitleStyle): string =>
    [s.ap, s.ah, s.av].join('|');

  /* ------------------------------------------------------------------ */
  /* 1. 스타일 맵 초기화                                                */
  /* ------------------------------------------------------------------ */

  // Map<key, id>
  const penMap = new Map<string, number>();
  const wsMap = new Map<string, number>();
  const wpMap = new Map<string, number>();

  // 다음에 할당될 ID (YouTube 규칙상 1부터 시작)
  let nextPenId = 1;
  let nextWsId = 1;
  let nextWpId = 0; // wp 는 0 포함 허용 (샘플 파일 참조)

  /* ------------------------------------------------------------------ */
  /* 2. 자막을 시간순으로 스캔하며 Map 구축                              */
  /* ------------------------------------------------------------------ */

  // 시간순 정렬 (원본 배열 변형 방지)
  const subtitles: SubtitleBlock[] = [...project.subtitles].sort(
    (a, b) => a.startTime - b.startTime
  );

  // 결과를 저장하기 위한 배열 (본문 작성에 사용)
  interface ResolvedEntry {
    sub: SubtitleBlock;
    penId: number;
    wsId?: number;
    wpId?: number;
  }
  const resolvedList: ResolvedEntry[] = [];

  for (const sub of subtitles) {
    // ① 스타일 객체 찾기 (없으면 기본값)
    const span: SubtitleSpan = sub.spans[0] || { text: '' } as any;
    const style: SubtitleStyle |
      undefined = project.styles.find(s => s.id === span.styleId) || undefined;
    const effStyle: SubtitleStyle = style || {
      id: 'default',
      name: 'Default',
      fc: '#FFFFFF',
      fo: 255,
      bc: '#000000',
      bo: 0,
      ju: 3,
      ap: 4,
    } as SubtitleStyle;

    /* -------- pen 처리 -------- */
    const penKey = makePenKey(effStyle);
    let penId = penMap.get(penKey);
    if (!penId) {
      penId = nextPenId++;
      penMap.set(penKey, penId);
    }

    /* -------- ws 처리 -------- */
    const wsKey = makeWsKey(effStyle);
    let wsId = wsMap.get(wsKey);
    if (!wsId && wsKey !== 'undefined|undefined|undefined') {
      wsId = nextWsId++;
      wsMap.set(wsKey, wsId);
    }

    /* -------- wp 처리 -------- */
    const wpKey = makeWpKey(effStyle);
    let wpId = wpMap.get(wpKey);
    if (!wpId && wpKey !== 'undefined|undefined|undefined') {
      wpId = nextWpId++;
      wpMap.set(wpKey, wpId);
    }

    resolvedList.push({ sub, penId, wsId, wpId });
  }

  /* ------------------------------------------------------------------ */
  /* 3. <head> 영역 작성                                                */
  /* ------------------------------------------------------------------ */

  let headXml = '  <head>\n';

  // --- pen ---
  for (const [key, id] of penMap.entries()) {
    // key 파싱
    const [fcRaw, foRaw, bcRaw, boRaw, ec, et, fs, sz] = key.split('|');
    const fc = normalizeColor(fcRaw || undefined);
    const fo = normalizeOpacity(foRaw ? Number(foRaw) : undefined);
    const bc = bcRaw || undefined;
    const bo = normalizeOpacity(boRaw ? Number(boRaw) : undefined);

    let penLine = `    <pen id="${id}"`;
    if (fc) penLine += ` fc="${fc}"`;
    if (fo !== undefined) penLine += ` fo="${fo}"`;
    if (bc) penLine += ` bc="${bc}"`;
    if (bo !== undefined) penLine += ` bo="${bo}"`;
    if (ec) penLine += ` ec="${ec}"`;
    if (et && et !== 'undefined') penLine += ` et="${et}"`;
    if (fs && fs !== 'undefined') penLine += ` fs="${fs}"`;
    if (sz && sz !== 'undefined') penLine += ` sz="${sz}"`;
    penLine += ' />\n';
    headXml += penLine;
  }

  // --- ws ---
  for (const [key, id] of wsMap.entries()) {
    const [ju, pd, sd] = key.split('|');
    let wsLine = `    <ws id="${id}"`;
    if (ju && ju !== 'undefined') wsLine += ` ju="${ju}"`;
    if (pd && pd !== 'undefined') wsLine += ` pd="${pd}"`;
    if (sd && sd !== 'undefined') wsLine += ` sd="${sd}"`;
    wsLine += ' />\n';
    headXml += wsLine;
  }

  // --- wp ---
  for (const [key, id] of wpMap.entries()) {
    const [ap, ah, av] = key.split('|');
    let wpLine = `    <wp id="${id}"`;
    if (ap && ap !== 'undefined') wpLine += ` ap="${ap}"`;
    if (ah && ah !== 'undefined') wpLine += ` ah="${ah}"`;
    if (av && av !== 'undefined') wpLine += ` av="${av}"`;
    wpLine += ' />\n';
    headXml += wpLine;
  }

  headXml += '  </head>\n';

  /* ------------------------------------------------------------------ */
  /* 4. <body> 영역 작성                                                */
  /* ------------------------------------------------------------------ */

  let bodyXml = '  <body>\n';

  for (const entry of resolvedList) {
    const { sub, penId, wsId, wpId } = entry;
    const span = sub.spans[0] || { text: '' } as any;

    const t = Math.round(sub.startTime);
    const d = Math.round(sub.endTime - sub.startTime);

    let pLine = `    <p t="${t}" d="${d}"`;
    pLine += ` p="${penId}"`;
    if (wsId !== undefined) pLine += ` ws="${wsId}"`;
    if (wpId !== undefined) pLine += ` wp="${wpId}"`;
    pLine += `>${escapeXml(span.text || '')}</p>\n`;

    bodyXml += pLine;
  }

  bodyXml += '  </body>';

  /* ------------------------------------------------------------------ */
  /* 5. 최종 XML 조합 후 반환                                           */
  /* ------------------------------------------------------------------ */

  const header = '<?xml version="1.0" encoding="utf-8" ?>\n<timedtext format="3">\n';
  const footer = '\n</timedtext>';

  return header + headXml + bodyXml + footer;
} 