import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/**
 * 사이트맵 (/sitemap.xml) — 검색엔진에 "이 페이지들을 봐 달라"고 알려 주는 목록.
 * 공개 페이지만 넣는다. 아래는 일부러 뺀 것들:
 *   /admin, /api            — 관리자·서버용
 *   /cscenter/news/view     — ?seq= 로 글마다 달라지는 상세, 목록에서 따라 들어가면 된다
 *   /product/tinfo/view     — 타이어 상세 팝업(헤더/푸터 없는 화면)
 *   /product/tire/sizelist  — 검색 결과라 사이즈 조합만큼 주소가 무한히 생긴다
 */
const PAGES: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
  { path: "/", priority: 1, changeFrequency: "weekly" },
  { path: "/product/tire/searchbysize", priority: 0.9, changeFrequency: "weekly" },
  { path: "/product/tprodintro", priority: 0.8, changeFrequency: "weekly" },
  { path: "/product/used", priority: 0.8, changeFrequency: "weekly" },
  { path: "/contact", priority: 0.8, changeFrequency: "monthly" },
  { path: "/company", priority: 0.7, changeFrequency: "monthly" },
  { path: "/review", priority: 0.6, changeFrequency: "weekly" },
  { path: "/cscenter/news", priority: 0.5, changeFrequency: "weekly" },
  { path: "/cscenter/tfaq", priority: 0.5, changeFrequency: "monthly" },
  { path: "/cscenter/personal_info", priority: 0.2, changeFrequency: "yearly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return PAGES.map(({ path, priority, changeFrequency }) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  }));
}
