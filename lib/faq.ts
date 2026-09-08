import { readList } from "@/lib/store";

/* 자주 묻는 질문 1건 (data/faq.json) — 배열 순서가 곧 노출 순서 */
export type Faq = { q: string; a: string };

export const FAQ_FILE = "faq";

export async function getFaqs(): Promise<Faq[]> {
  return readList<Faq>(FAQ_FILE);
}
