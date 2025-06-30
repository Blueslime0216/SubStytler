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
  let nextWpId = 1; // wp ID는 1부터 시작하도록 변경하여 중복/누락 방지

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

  // Helper to check if track is visible
  const isTrackVisible = (trackId: string): boolean => {
    const track = project?.tracks?.find?.((t) => t.id === trackId);
    // project.tracks 가 없거나 track 정보를 찾지 못하면 기본적으로 표시된 것으로 간주
    return track ? track.visible !== false : true;
  };

  for (const sub of subtitles) {
    // 숨김 트랙 자막은 YTT에서 제외
    if (!isTrackVisible(sub.trackId)) {
      continue;
    }

    // 자막(span)이 직접 보유한 스타일 속성을 사용한다.
    // 기존 코드처럼 Project.styles 배열을 조회하지 않고, span 안에 포함된 속성을 바로 읽는다.

    const span: SubtitleSpan = sub.spans[0] || { text: '' } as any;

    // "기본값" 정의 – span 에 해당 속성이 없을 경우 사용
    const DEFAULT_STYLE: Partial<SubtitleStyle> = {
      fc: '#FFFFFF', // 글자색(흰색)
      fo: 255,       // 글자 투명도
      bc: '#000000', // 배경색(검정)
      bo: 255,       // 배경 투명도
      ju: 3,         // 정렬 (가운데)
      ap: 4,         // 앵커 포인트 (중앙)
      ah: 50,        // X 좌표
      av: 50,        // Y 좌표
    };

    // span 안에 존재할 수 있는 pen/ws/wp 관련 속성을 추려서 객체로 만든다.
    const effStyle: SubtitleStyle = {
      id: 'inline',   // 더 이상 고유 ID 필요 없음
      name: 'inline',
      fc: (span as any).fc ?? DEFAULT_STYLE.fc,
      fo: (span as any).fo ?? DEFAULT_STYLE.fo,
      bc: (span as any).bc ?? DEFAULT_STYLE.bc,
      bo: (span as any).bo ?? DEFAULT_STYLE.bo,
      ec: (span as any).ec,
      et: (span as any).et,
      fs: (span as any).fs,
      sz: (span as any).sz,
      rb: (span as any).rb,
      of: (span as any).of,
      ju: (span as any).ju ?? DEFAULT_STYLE.ju,
      pd: (span as any).pd,
      sd: (span as any).sd,
      ap: (span as any).ap ?? DEFAULT_STYLE.ap,
      ah: Math.round((span as any).ah ?? DEFAULT_STYLE.ah),
      av: Math.round((span as any).av ?? DEFAULT_STYLE.av),
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
    // wpId가 아직 없을 때만 새 ID 할당 (0값과 혼동 방지)
    if (wpId === undefined && wpKey !== 'undefined|undefined|undefined') {
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