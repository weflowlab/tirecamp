import { denyUnlessAdmin } from "@/lib/adminAuth";
import { parsePrices } from "@/lib/adminParseTire";
import { getTire, getTirePrices, savePrices } from "@/lib/tires";

type Ctx = { params: Promise<{ seq: string }> };

/** PUT /api/admin/tires/:seq/prices — 가격 행 일괄 저장 { items: TirePrice[], deleted: string[] } */
export async function PUT(request: Request, { params }: Ctx) {
  const denied = await denyUnlessAdmin();
  if (denied) return denied;
  const { seq } = await params;
  if (!(await getTire(seq, true))) return Response.json({ ok: false, error: "타이어를 찾을 수 없습니다." }, { status: 404 });
  const body = (await request.json().catch(() => ({}))) as { items?: unknown; deleted?: unknown };
  const items = parsePrices(body.items ?? [], seq);
  if (!Array.isArray(items)) return Response.json({ ok: false, error: items.error }, { status: 400 });
  const deleted = Array.isArray(body.deleted) ? (body.deleted as unknown[]).map(String).filter((s) => /^[A-Za-z0-9_-]{1,40}$/.test(s)) : [];
  try {
    await savePrices(seq, items, deleted);
    return Response.json({ ok: true, items: await getTirePrices(seq) });
  } catch (e) {
    return Response.json({ ok: false, error: String(e instanceof Error ? e.message : e) }, { status: 500 });
  }
}
