import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* 7개 메뉴 재편 전 경로 → 새 경로 (매장소개/이벤트/예약확인 페이지는 메뉴에서 제외) */
  async redirects() {
    return [
      { source: "/shop/shopintro", destination: "/company", permanent: false },
      { source: "/comevent/oevent", destination: "/cscenter/news", permanent: false },
      { source: "/cscenter/tirebooking/custchk", destination: "/contact", permanent: false },
    ];
  },
};

export default nextConfig;
