import type { NewsItem } from "@/lib/news";
import type { Popup } from "@/lib/popups";
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

const DATE = /^\d{4}-\d{2}-\d{2}$/;

export function parsePopup(body: Record<string, unknown>, requireImage: boolean): Partial<Popup> & { error?: string } {
  const title = clean(body.title, 60);
  const start = clean(body.start, 10);
  const end = clean(body.end, 10);
  const pcImage = clean(body.pcImage, 300);
  if (!title) return { error: "팝업 제목을 입력해 주세요." };
  if (!DATE.test(start) || !DATE.test(end)) return { error: "노출 기간을 선택해 주세요." };
  if (start > end) return { error: "종료일이 시작일보다 앞설 수 없습니다." };
  if (requireImage && !pcImage) return { error: "PC 이미지를 업로드해 주세요." };
  const out: Partial<Popup> = {
    title,
    start,
    end,
    linkUrl: clean(body.linkUrl, 300),
    newWindow: body.newWindow === true,
    hideToday: body.hideToday !== false,
    enabled: body.enabled !== false,
    scope: body.scope === "all" ? "all" : "home",
    mobImage: clean(body.mobImage, 300),
  };
  if (pcImage) out.pcImage = pcImage;
  return out;
}
