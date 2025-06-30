import React, { useEffect } from 'react';
import { useTimelineStore } from '../../stores/timelineStore';
import { useProjectStore } from '../../stores/projectStore';
import { useYTTStore } from '../../stores/yttStore';
import SingleSubtitle from './SingleSubtitle';
import { applyAnimationsToSpan } from '../../utils/animationRuntime';
import { SubtitleBlock } from '../../types/project';

// ResizeObserver 타입 지원을 위해 전역 타입이 없는 경우를 대비한 선언
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const ResizeObserver = window.ResizeObserver || (class { constructor(cb:any){} observe(){} unobserve(){} disconnect(){} });

export const SubtitleOverlay: React.FC<{ containerRef?: React.RefObject<HTMLDivElement> }> = ({ containerRef }) => {
  // 모든 Hook을 최상단에 선언
  const { currentTime } = useTimelineStore();
  const { currentProject } = useProjectStore();
  const { parsed } = useYTTStore();
  // 컨테이너 리사이즈 시 리렌더를 트리거하기 위해 state 를 쓰지 않고,
  // containerRef 크기를 의존성으로 하는 useEffect 에서 forceUpdate 를 수행
  const [, forceUpdate] = React.useReducer((c) => c + 1, 0);

  const getVideoHeight = () => {
    const container = containerRef?.current;
    if (!container) return 1080;
    const videoEl = container.querySelector('.video-player-element.video-loaded') as HTMLElement | null;
    if (videoEl && videoEl.clientHeight) return videoEl.clientHeight;
    return container.clientHeight || 1080;
  };

  useEffect(() => {
    if (!containerRef?.current) return;

    // ① 윈도우 리사이즈(전체 화면 크기 변화) 대응
    const handleWinResize = () => forceUpdate();
    window.addEventListener('resize', handleWinResize);

    // 관찰 대상: 실제 비디오 요소가 있으면 그것을, 없으면 컨테이너를 관찰
    const targetEl = containerRef.current.querySelector(
      '.video-player-element.video-loaded'
    ) || containerRef.current;

    const ro = new ResizeObserver(() => {
      getVideoHeight();
      forceUpdate();
    });
    ro.observe(targetEl as Element);

    return () => {
      window.removeEventListener('resize', handleWinResize);
      ro.disconnect();
    };
  }, [containerRef]);

  // 프로젝트 편집 중엔 currentProject 가 가장 최신 데이터를 보유하므로 우선 사용한다.
  // 외부 YTT 파일만 로드된 상태(프로젝트 없음)라면 parsed 값을 사용.
  const subtitleSource = currentProject?.subtitles?.length ? currentProject : parsed;

  const projectTracks = (subtitleSource as any)?.tracks as any[] | undefined;

  const currentSubtitlesRaw = subtitleSource?.subtitles?.filter(sub => {
    if (!(currentTime >= sub.startTime && currentTime <= sub.endTime)) return false;
    // 숨김 트랙은 미표시
    if (projectTracks) {
      const track = (projectTracks as any[]).find((t: any) => t.id === sub.trackId);
      if (track && !track.visible) return false;
    }
    return true;
  }) || [];

  // 애니메이션 평가 – 렌더용 SubtitleBlock 생성
  const currentSubtitles = currentSubtitlesRaw.map((sub): SubtitleBlock => {
    if (!sub.spans[0]?.animations?.length) return sub as SubtitleBlock;
    const animatedSpan = applyAnimationsToSpan(sub.spans[0], currentTime);
    return { ...sub, spans: [animatedSpan] } as SubtitleBlock;
  });

  if (currentSubtitles.length === 0) return null;

  // 다중 자막 렌더링 ➜ 개별 컴포넌트로 위임
  return (
    <div className="absolute inset-0 pointer-events-none">
      {currentSubtitles.map((sub) => (
        <SingleSubtitle key={sub.id} subtitle={sub} containerRef={containerRef} />
      ))}
    </div>
  );
};