import { readList } from "@/lib/store";

/* 고객 후기 1건 (data/reviews.json) */
export type Review = {
  id: number;
  name: string;
  /** 차종 (선택) */
  car: string;
  /** 별점 1~5 */
  rating: number;
  content: string;
  date: string;
  createdAt: string;
};

export const REVIEWS_FILE = "reviews";

/** 최신순 목록 */
export async function getReviews(): Promise<Review[]> {
  const list = await readList<Review>(REVIEWS_FILE);
  return list.sort((a, b) => b.id - a.id);
}
