import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /*
   * 이미지 최적화(Vercel /_next/image 변환) 끄기
   * - public/images 의 사진은 이미 WebP(가로 최대 1600px, 품질 82)로 압축해 두었으므로 Vercel 변환이 필요 없다.
   *   (변환은 월 5,000회 한도가 있는 유료 항목이라 아예 거치지 않게 한다)
   * - 끄면 원본 파일이 그대로 나가므로, 새 이미지를 넣을 때도 WebP 로 압축해서 원본 자체를 가볍게 유지해야 한다.
   */
  images: { unoptimized: true },

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
