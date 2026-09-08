import { denyUnlessAdmin } from "@/lib/adminAuth";
import { parseTire } from "@/lib/adminParseTire";
import { getTires, nextTireSeq, saveTire } from "@/lib/tires";
import type { TireRecord } from "@/lib/tireTypes";

/** POST /api/admin/tires — 타이어 제품 등록 */
export async function POST(request: Request) {
  const denied = await denyUnlessAdmin();
  if (denied) return denied;
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const seq = await nextTireSeq();
  const base: TireRecord = {
    seq,
    brandCode: "",
    brandName: "",
    model: "",
    image: "",
    images: [],
    typeLabel: "",
    levelLabel: "",
    typeCode: "",
    levelCode: "",
    tagline: "",
    desc: "",
    descHtml: "",
    speedRating: "",
    treadwear: "",
    priceRange: "",
    scores: [],
    visible: true,
    sortOrder: (await getTires(true)).length,
    updatedAt: "",
  };
  const parsed = parseTire(body, base);
  if ("error" in parsed) return Response.json({ ok: false, error: parsed.error }, { status: 400 });
  try {
    await saveTire(parsed);
    return Response.json({ ok: true, item: parsed });
  } catch (e) {
    return Response.json({ ok: false, error: String(e instanceof Error ? e.message : e) }, { status: 500 });
  }
}
