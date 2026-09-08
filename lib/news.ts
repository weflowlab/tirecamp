import { readList } from "@/lib/store";
import type { NewsItem } from "@/lib/newsTypes";

/* 서버 전용 (fs 사용). 타입/순수 헬퍼는 lib/newsTypes.ts 에서 re-export */
export type { NewsItem } from "@/lib/newsTypes";
export { newsPreview, newsViewHref, sanitizeHtml } from "@/lib/newsTypes";

export const NEWS_FILE = "news";

/** 원본 게시판은 seq 내림차순 정렬. 관리자 수정이 바로 보이도록 요청마다 파일을 읽는다 */
export async function getNews(): Promise<NewsItem[]> {
  const list = await readList<NewsItem>(NEWS_FILE);
  return list.sort((a, b) => b.seq - a.seq);
}

/** 목록 페이지당 게시글 수 (원본 페이징 기본값 추정) */
export const NEWS_PAGE_SIZE = 10;

/* seq 로 게시글 찾기 */
export async function findNews(seq: number): Promise<NewsItem | undefined> {
  return (await getNews()).find((n) => n.seq === seq);
}

/* 원본 "이전글" = 더 최신(seq 큰) 글, "다음글" = 더 오래된(seq 작은) 글 */
export function adjacentNews(list: NewsItem[], seq: number): { prev?: NewsItem; next?: NewsItem } {
  const idx = list.findIndex((n) => n.seq === seq);
  if (idx < 0) return {};
  return { prev: list[idx - 1], next: list[idx + 1] };
}
