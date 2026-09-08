"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/**
 * 방문자 통계 수집 (관리자 > 방문자 통계)
 * - 페이지 이동마다 POST /api/track 로 { 세션ID, 경로, 리퍼러, UTM } 을 보낸다.
 * - 세션ID = 기기ID(localStorage, 영구) + 한국시간 날짜 → 같은 기기의 하루 방문은 1명으로 집계
 * - 페이지를 떠날 때 체류시간·스크롤 도달률을 sendBeacon 으로 보낸다.
 * - 본인 방문 제외: 주소 뒤에 ?notrack=1 을 한 번 붙이면 이 브라우저는 이후 집계에서 빠진다 (?track=1 로 해제)
 */
function getSessionId(): string {
  const KEY = "tc_did";
  let did = localStorage.getItem(KEY);
  if (!did) {
    did = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(KEY, did);
  }
  const day = new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10);
  return `${did}-${day}`;
}

export default function PageTracker() {
  const pathname = usePathname();
  const current = useRef<{ id: string; entry: number; flushed: boolean } | null>(null);
  const maxScroll = useRef(0);

  const measureScroll = () => {
    const doc = document.documentElement;
    const scrollable = doc.scrollHeight - window.innerHeight;
    const pct = scrollable <= 0 ? 100 : Math.round(((window.scrollY || doc.scrollTop) / scrollable) * 100);
    maxScroll.current = Math.max(maxScroll.current, Math.max(0, Math.min(pct, 100)));
  };

  /* 현재 페이지 체류시간 + 스크롤 도달률 전송 (한 번만) */
  const flush = () => {
    const c = current.current;
    if (!c || c.flushed) return;
    c.flushed = true;
    measureScroll();
    const payload = JSON.stringify({ type: "duration", id: c.id, durationMs: Math.round(performance.now() - c.entry), maxScroll: maxScroll.current });
    if (navigator.sendBeacon) navigator.sendBeacon("/api/track", new Blob([payload], { type: "application/json" }));
    else fetch("/api/track", { method: "POST", body: payload, headers: { "Content-Type": "application/json" }, keepalive: true }).catch(() => {});
  };

  useEffect(() => {
    let params: URLSearchParams;
    try {
      params = new URLSearchParams(window.location.search);
      if (params.get("notrack") === "1") localStorage.setItem("tc_notrack", "1");
      if (params.get("track") === "1") localStorage.removeItem("tc_notrack");
      if (localStorage.getItem("tc_notrack") === "1") return;
    } catch {
      return;
    }

    flush();
    maxScroll.current = 0;

    // 광고 클릭은 UTM 이 없어도 소스·매체를 채운다 (네이버 파워링크 n_*, 구글 gclid, 메타 fbclid)
    const isNaverAd = !!(params.get("n_media") || params.get("n_keyword") || params.get("n_query") || params.get("n_ad"));
    const adSource = isNaverAd ? "naver" : params.get("gclid") ? "google" : params.get("fbclid") ? "facebook" : "";
    const keyword = params.get("n_query") || params.get("n_keyword") || params.get("utm_term") || params.get("kw") || "";

    let active = true;
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: getSessionId(),
        path: pathname,
        referrer: document.referrer,
        utmSource: params.get("utm_source") || adSource,
        utmMedium: params.get("utm_medium") || (adSource ? "cpc" : ""),
        utmCampaign: params.get("utm_campaign") || keyword,
      }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (active && d?.id) current.current = { id: d.id, entry: performance.now(), flushed: false };
      })
      .catch(() => {});

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  /* 스크롤 최대 도달률 (rAF 스로틀) */
  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        measureScroll();
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* 탭 닫기 / 백그라운드 전환 시 체류시간 마감, 복귀 시 재측정 */
  useEffect(() => {
    const onVisibility = () => {
      const c = current.current;
      if (document.visibilityState === "hidden") flush();
      else if (c) {
        c.entry = performance.now();
        c.flushed = false;
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", flush);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", flush);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
