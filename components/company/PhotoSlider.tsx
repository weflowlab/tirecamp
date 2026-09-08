"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/* 매장 사진 (네이버 플레이스 등록 사진, 1400px 리사이즈 + EXIF 제거) */
/* 순서: 외관(02,03) → 진열대(09,10) → 나머지 */
const PHOTOS = ["02", "03", "09", "10", "04", "05", "06", "01"].map((n) => `/images/company/gallery-${n}.webp`);

const AUTOPLAY_MS = 4000;

/**
 * 매장 사진 슬라이드 (무한 루프)
 * - PC: 3장씩 보임, 사진 바깥 양옆 화살표로 1장씩 이동, 4초마다 자동 이동 (마우스 올리면 멈춤)
 * - 모바일: 1장 + 다음 장 끝이 살짝 보임(넘길 수 있다는 힌트), 손으로 밀면 1장씩 넘어감 (화살표 숨김)
 * - 루프: 앞뒤에 보이는 장수만큼 복제 슬라이드를 두고, 끝에 닿으면 전환 효과 없이 실제 위치로 점프
 */
export default function PhotoSlider({ height = 240 }: { height?: number }) {
  const [visible, setVisible] = useState(3); // 앞뒤 복제 장수 (PC 3, 모바일 2)
  const [mobile, setMobile] = useState(false);
  const [idx, setIdx] = useState(visible); // 복제 구간 다음의 첫 실제 슬라이드
  const [anim, setAnim] = useState(true);
  const [paused, setPaused] = useState(false);
  const touchX = useRef<number | null>(null);
  const n = PHOTOS.length;

  /* 화면 폭에 따라 보이는 장수 (920px 미만 = 모바일 1장) */
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 919.98px)");
    const apply = () => {
      const v = mq.matches ? 2 : 3;
      setMobile(mq.matches);
      setVisible(v);
      setAnim(false);
      setIdx(v);
    };
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  /* 앞뒤 복제: [마지막 visible장] + 전체 + [처음 visible장] */
  const track = [...PHOTOS.slice(n - visible), ...PHOTOS, ...PHOTOS.slice(0, visible)];

  const go = useCallback((d: number) => {
    setAnim(true);
    setIdx((i) => i + d);
  }, []);

  /* 복제 구간에 도착하면 전환 없이 실제 위치로 점프 */
  function onTransitionEnd() {
    if (idx >= n + visible) {
      setAnim(false);
      setIdx(idx - n);
    } else if (idx < visible) {
      setAnim(false);
      setIdx(idx + n);
    }
  }
  /* 점프 직후 다음 프레임부터 다시 전환 효과 */
  useEffect(() => {
    if (!anim) {
      const t = requestAnimationFrame(() => setAnim(true));
      return () => cancelAnimationFrame(t);
    }
  }, [anim, idx]);

  /* 자동 이동 */
  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => go(1), AUTOPLAY_MS);
    return () => clearInterval(t);
  }, [paused, go]);

  /* 터치 스와이프: 40px 이상 밀면 1장 */
  function onTouchStart(e: React.TouchEvent) {
    touchX.current = e.touches[0].clientX;
    setPaused(true);
  }
  function onTouchEnd(e: React.TouchEvent) {
    const start = touchX.current;
    touchX.current = null;
    setPaused(false);
    if (start === null) return;
    const dx = e.changedTouches[0].clientX - start;
    if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
  }

  /* 슬라이드 폭(%): PC 3장 균등, 모바일은 84% 로 두어 오른쪽에 다음 장이 16% 보인다 */
  const slideW = mobile ? 84 : 100 / visible;

  return (
    <div
      className="relative w-full select-none px-[56px] max-pc:px-0"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className="overflow-hidden" style={{ height }}>
        <ul
          className="flex h-full"
          style={{
            transform: `translateX(-${idx * slideW}%)`,
            transition: anim ? "transform 0.55s cubic-bezier(0.22, 0.61, 0.36, 1)" : "none",
          }}
          onTransitionEnd={onTransitionEnd}
        >
          {track.map((src, i) => (
            <li key={`${src}-${i}`} className="h-full shrink-0 px-[4px] first:pl-0 last:pr-0" style={{ width: `${slideW}%` }}>
              <img src={src} alt="타이어캠프 매장 사진" className="img-fixed block h-full w-full object-cover" draggable={false} />
            </li>
          ))}
        </ul>
      </div>

      {/* 양옆 화살표 */}
      <Arrow dir="prev" onClick={() => go(-1)} />
      <Arrow dir="next" onClick={() => go(1)} />
    </div>
  );
}

function Arrow({ dir, onClick }: { dir: "prev" | "next"; onClick: () => void }) {
  const left = dir === "prev";
  return (
    <button
      type="button"
      aria-label={left ? "이전 사진" : "다음 사진"}
      onClick={onClick}
      className={`absolute top-1/2 flex h-[40px] w-[40px] -translate-y-1/2 items-center justify-center rounded-full border border-line bg-white text-ink transition-colors hover:bg-ink hover:text-white max-pc:hidden ${
        left ? "left-0" : "right-0"
      }`}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        {left ? <path d="m15 5-7 7 7 7" /> : <path d="m9 5 7 7-7 7" />}
      </svg>
    </button>
  );
}
