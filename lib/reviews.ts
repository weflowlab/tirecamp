import { readList } from "@/lib/store";
import type { Review } from "@/lib/reviewTypes";

/* 서버 전용 (fs 사용). 타입/상수는 lib/reviewTypes.ts 에서 re-export */
export { VEHICLE_TYPES } from "@/lib/reviewTypes";
export type { Review } from "@/lib/reviewTypes";

export const REVIEWS_FILE = "reviews";

/** 최신순 목록 */
export async function getReviews(): Promise<Review[]> {
  const list = await readList<Review>(REVIEWS_FILE);
  return list.sort((a, b) => b.id - a.id);
}
