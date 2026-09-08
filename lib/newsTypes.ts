/*
 * 공지 타입/순수 헬퍼 — 클라이언트 컴포넌트에서도 import 하는 파일이므로 node 전용 모듈(fs 등)을 절대 import 하지 않는다.
 * (파일 읽기 등 서버 전용 로직은 lib/news.ts)
 */

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

/**
 * 본문 첫 줄 미리보기 (목록용)
 * - HTML 을 줄 단위(<br>, </p>, 줄바꿈)로 나눠 태그를 벗기고, 첫 번째 비어 있지 않은 줄을 돌려준다
 * - 뒤에 내용이 더 있으면 "..." 을 붙인다 (유니코드 … 는 한글 폰트에서 가운데 높이로 찍혀서 마침표 세 개 사용)
 */
export function newsPreview(html: string): string {
  const lines = html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length === 0) return "";
  return lines.length > 1 ? `${lines[0]}...` : lines[0];
}
