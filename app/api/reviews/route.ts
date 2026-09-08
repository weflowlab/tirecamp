import type { Review } from "@/lib/reviews";
import { REVIEWS_FILE, VEHICLE_TYPES } from "@/lib/reviews";
import { appendItem, clean, todayKST } from "@/lib/store";

/**
 * POST /api/reviews — 고객 후기 등록 (data/reviews.json 에 추가)
 * body: { name, vehicle, car?, rating(1~5), content, website(스팸 방지, 비어 있어야 함) }
 */
export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return Response.json({ ok: false, error: "잘못된 요청입니다." }, { status: 400 });
  }

  // 봇이 채우는 숨김 필드 → 조용히 성공 처리
  if (clean(body.website, 100) !== "") return Response.json({ ok: true });

  const name = clean(body.name, 20);
  const vehicleRaw = clean(body.vehicle, 20);
  const vehicle = (VEHICLE_TYPES as readonly string[]).includes(vehicleRaw) ? (vehicleRaw as Review["vehicle"]) : "기타";
  const car = clean(body.car, 30);
  const content = clean(body.content, 1000);
  const rating = Math.min(5, Math.max(1, Math.round(Number(body.rating) || 5)));

  if (!name) return Response.json({ ok: false, error: "이름을 입력해 주세요." }, { status: 400 });
  if (content.length < 5) return Response.json({ ok: false, error: "후기 내용을 5자 이상 입력해 주세요." }, { status: 400 });

  const item: Review = {
    id: Date.now(),
    name,
    vehicle,
    car,
    rating,
    content,
    date: todayKST(),
    createdAt: new Date().toISOString(),
  };

  try {
    await appendItem(REVIEWS_FILE, item);
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ ok: false, error: `저장에 실패했습니다. (${String(e)})` }, { status: 500 });
  }
}
