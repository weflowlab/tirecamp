"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { TireDetail } from "@/lib/tireDetail";

export const TIRE_OPEN_EVENT = "tire:open";

/**
 * 타이어 상세 모달 (사이트 전역에 1개 마운트)
 * - openTireInfo(seq) → window 이벤트 → 여기서 /api/tinfo 로 데이터를 받아 모달 표시
 * - 좌: 이미지 갤러리(화살표 · 썸네일 · n/N) / 우: 브랜드 · 모델 · 한 줄 소개 · 설명 · 스펙 · CTA
 * - ESC / 바깥 클릭 / × 로 닫힘
 */
export default function TireDetailModal() {
  const [data, setData] = useState<TireDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    async function onOpen(e: Event) {
      const seq = String((e as CustomEvent).detail ?? "");
      if (!seq) return;
      setOpen(true);
      setLoading(true);
      setData(null);
      try {
        const res = await fetch(`/api/tinfo?seq=${encodeURIComponent(seq)}`);
        if (!res.ok) throw new Error("not found");
        setData((await res.json()) as TireDetail);
      } catch {
        setData(null);
      } finally {
        setLoading(false);
      }
    }
    const onClose = () => setOpen(false);
    window.addEventListener(TIRE_OPEN_EVENT, onOpen);
    window.addEventListener("tire:close", onClose);
    return () => {
      window.removeEventListener(TIRE_OPEN_EVENT, onOpen);
      window.removeEventListener("tire:close", onClose);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, close]);

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-[1000] bg-black/55 backdrop-blur-[2px]" onClick={close} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="타이어 제품정보"
        className="fixed left-1/2 top-1/2 z-[1001] flex max-h-[90vh] w-[960px] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden bg-white font-sans shadow-[0_30px_80px_-24px_rgba(0,0,0,0.5)] max-pc:h-[92vh] max-pc:w-[calc(100%-20px)]"
      >
        <button
          type="button"
          aria-label="닫기"
          onClick={close}
          className="absolute right-[16px] top-[16px] z-10 flex h-[36px] w-[36px] items-center justify-center rounded-full bg-white/90 text-[22px] leading-none text-ink shadow-[0_2px_10px_rgba(0,0,0,0.15)] hover:bg-ink hover:text-white"
        >
          ×
        </button>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {loading && <p className="p-[60px] text-center text-[13px] text-muted">불러오는 중...</p>}
          {!loading && !data && <p className="p-[60px] text-center text-[13px] text-muted">제품 정보를 찾을 수 없습니다.</p>}
          {data && <TireDetailContent data={data} />}
        </div>
      </div>
    </>
  );
}

/**
 * 상세 본문 (모달과 /product/tinfo/view 페이지가 공용)
 */
export function TireDetailContent({ data: d }: { data: TireDetail }) {
  const [i, setI] = useState(0);
  const n = d.images.length;
  const go = (delta: number) => setI((v) => (v + delta + n) % n);

  return (
    <div>
      {/* 상단: 갤러리 | 정보 */}
      <div className="grid grid-cols-[1fr_360px] max-pc:grid-cols-1">
        <div className="bg-surface">
          <div className="relative flex h-[520px] items-center justify-center max-pc:h-[320px]">
            {n > 0 && <img src={d.images[i]} alt={`${d.brand} ${d.model}`} className="h-full w-full object-contain p-[12px]" />}
            {n > 1 && (
              <>
                <Arrow dir="prev" onClick={() => go(-1)} />
                <Arrow dir="next" onClick={() => go(1)} />
                <span className="absolute bottom-[14px] right-[16px] text-[12px] text-muted" style={{ fontFamily: "var(--font-num)" }}>
                  {i + 1} / {n}
                </span>
              </>
            )}
          </div>
          {n > 1 && (
            <ul className="flex gap-[6px] overflow-x-auto px-[16px] pb-[16px] [scrollbar-width:none]">
              {d.images.map((src, k) => (
                <li key={`${src}-${k}`} className="shrink-0">
                  <button
                    type="button"
                    onClick={() => setI(k)}
                    className={`flex h-[64px] w-[84px] items-center justify-center overflow-hidden border-2 bg-white ${k === i ? "border-ink" : "border-transparent opacity-70 hover:opacity-100"}`}
                  >
                    <img src={src} alt="" className="max-h-full max-w-full object-contain" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex flex-col p-[36px] max-pc:p-[20px]">
          <p className="eyebrow">{d.brand}</p>
          <h2 className="mt-[8px] text-[28px] font-bold leading-[1.2] tracking-[-0.02em] text-ink max-pc:text-[22px]" style={{ fontFamily: "var(--font-num)" }}>
            {d.model}
          </h2>
          <p className="mt-[8px] text-[14px] font-medium text-graphite">{d.tagline}</p>
          {d.desc && <p className="mt-[14px] text-[13px] leading-[22px] text-muted">{d.desc}</p>}

          {/* 스펙 (객관 정보만) */}
          <dl className="mt-[22px] border-t border-line text-[13px]">
            <Spec k="타입 · 등급" v={d.typeLevel || "-"} />
            <Spec k="속도등급" v={d.speedRating || "-"} />
            <Spec k="트레드웨어" v={d.treadwear ? `${d.treadwear}` : "-"} />
            <Spec k="가격대" v={d.priceRange ? `${d.priceRange}원` : "-"} />
          </dl>

          <div className="mt-auto flex flex-col gap-[8px] pt-[24px]">
            <Link href={`/contact?tire=${encodeURIComponent(`${d.brand} ${d.model}`)}`} onClick={() => window.dispatchEvent(new Event("tire:close"))} className="btn-fill w-full">
              이 타이어로 문의하기
            </Link>
            <Link href={`/product/tire/searchbysize?tire=${d.seq}`} onClick={() => window.dispatchEvent(new Event("tire:close"))} className="btn-outline w-full !text-ink hover:bg-ink hover:!text-white hover:!no-underline">
              내 차 사이즈로 가격 검색
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
}

function Spec({ k, v }: { k: string; v: string }) {
  return (
    <div className="grid grid-cols-[92px_1fr] gap-[12px] border-b border-line py-[9px]">
      <dt className="text-muted">{k}</dt>
      <dd className="font-medium text-ink" style={{ fontFamily: "var(--font-num)" }}>
        {v}
      </dd>
    </div>
  );
}

function Arrow({ dir, onClick }: { dir: "prev" | "next"; onClick: () => void }) {
  const left = dir === "prev";
  return (
    <button
      type="button"
      aria-label={left ? "이전 이미지" : "다음 이미지"}
      onClick={onClick}
      className={`absolute top-1/2 flex h-[40px] w-[40px] -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink shadow-[0_2px_10px_rgba(0,0,0,0.15)] hover:bg-ink hover:text-white ${left ? "left-[14px]" : "right-[14px]"}`}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        {left ? <path d="m15 5-7 7 7 7" /> : <path d="m9 5 7 7-7 7" />}
      </svg>
    </button>
  );
}
