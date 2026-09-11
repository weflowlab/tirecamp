import type { NewsItem } from "@/lib/news";
import { clean, todayKST } from "@/lib/store";

/*
 * 관리자 API 요청 본문 검증/정리 (서버 전용)
 * - route.ts 는 HTTP 메서드만 export 할 수 있어 공용 파서를 여기에 둔다.
 * - 실패 시 { error } 를 돌려주고, 성공 시 저장할 필드만 담은 객체를 돌려준다.
 */

export function parseNews(body: Record<string, unknown>): Partial<NewsItem> & { error?: string } {
  const title = clean(body.title, 120);
  const content = clean(body.content, 100000);
  if (!title) return { error: "제목을 입력해 주세요." };
  if (!content) return { error: "내용을 입력해 주세요." };
  const date = clean(body.date, 10).replace(/-/g, ".");
  return {
    title,
    content,
    date: /^\d{4}\.\d{2}\.\d{2}$/.test(date) ? date : todayKST(),
    notice: body.notice === true,
    thumb: clean(body.thumb, 300),
    summary: clean(body.summary, 300),
  };
}
