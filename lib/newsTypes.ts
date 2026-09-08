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
 * 본문 미리보기 (목록용)
 * - 태그를 벗기고 줄바꿈(<br>, 문단 끝)은 "\n" 으로 남긴 앞부분(max 글자)을 돌려준다.
 *   화면에서는 whitespace-pre-line + line-clamp 로 줄바꿈을 살린 채 몇 줄만 보여준다.
 */
export function newsPreview(html: string, max = 240): string {
  const text = html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|li|h\d|tr)>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .split("\n")
    .map((l) => l.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .join("\n");
  return text.length > max ? `${text.slice(0, max)}...` : text;
}
