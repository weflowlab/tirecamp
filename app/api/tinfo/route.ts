import { toTireDetail } from "@/lib/tireDetail";
import { displayPriceRange, getTire } from "@/lib/tires";

/**
 * GET /api/tinfo?seq=N — 타이어 상세 모달용 데이터 (관리자에서 편집한 제품 정보)
 * 응답: TireDetail | 404
 */
export async function GET(request: Request) {
  const seq = (new URL(request.url).searchParams.get("seq") ?? "").trim();
  const t = await getTire(seq);
  if (!t || !t.model) return Response.json({ error: "not found" }, { status: 404 });
  return Response.json(toTireDetail(t, await displayPriceRange(t)), { headers: { "Cache-Control": "no-store" } });
}
