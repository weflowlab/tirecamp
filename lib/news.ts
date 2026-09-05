import newsData from "@/data/news.json";

/* 소식 & 공지사항 게시글 1건 (원본 view.aspx?bcode=01&seq=N 의 데이터) */
export type NewsItem = {
  seq: number;
  bcode: string;
  title: string;
  date: string;
  /** 목록에 표시되는 조회수 (원본은 상세 열람 시 +1 되어 표시됨) */
  views: number;
  /** true 면 목록 상단 "공지" 박스에도 노출 */
  notice: boolean;
  /** 목록 썸네일 (원본 boomcar.co.kr 이미지 → /ext/ 로컬 경로) */
  thumb: string;
  summary: string;
  /** 본문 HTML (이미지 경로는 로컬로 치환됨) */
  content: string;
};

/* 원본 게시판은 seq 내림차순 정렬 */
export const NEWS: NewsItem[] = [...(newsData as NewsItem[])].sort((a, b) => b.seq - a.seq);

/** 목록 페이지당 게시글 수 (원본 페이징 기본값 추정) */
export const NEWS_PAGE_SIZE = 10;

/* seq 로 게시글 찾기 */
export function findNews(seq: number): NewsItem | undefined {
  return NEWS.find((n) => n.seq === seq);
}

/* 원본 "이전글" = 더 최신(seq 큰) 글, "다음글" = 더 오래된(seq 작은) 글 */
export function adjacentNews(seq: number): { prev?: NewsItem; next?: NewsItem } {
  const idx = NEWS.findIndex((n) => n.seq === seq);
  if (idx < 0) return {};
  return { prev: NEWS[idx - 1], next: NEWS[idx + 1] };
}

/* dangerouslySetInnerHTML 전 <script> 태그 및 on* 핸들러 제거 */
export function sanitizeHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "");
}

/* 원본 view.aspx?bcode=01&seq=N&spage=S&lpage=L 링크 */
export function newsViewHref(seq: number, spage = 1, lpage = 1): string {
  return `/cscenter/news/view?bcode=01&seq=${seq}&spage=${spage}&lpage=${lpage}`;
}
