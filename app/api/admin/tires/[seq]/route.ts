import { denyUnlessAdmin } from "@/lib/adminAuth";
import { parseTire } from "@/lib/adminParseTire";
import { deleteTire, getTire, saveTire } from "@/lib/tires";

type Ctx = { params: Promise<{ seq: string }> };

/** PATCH /api/admin/tires/:seq — 제품 수정. { visible } 만 보내면 노출만 바꾼다 */
export async function PATCH(request: Request, { params }: Ctx) {
  const denied = await denyUnlessAdmin();
  if (denied) return denied;
  const { seq } = await params;
  const base = await getTire(seq, true);
  if (!base) return Response.json({ ok: false, error: "타이어를 찾을 수 없습니다." }, { status: 404 });
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;

  const next = Object.keys(body).length === 1 && typeof body.visible === "boolean" ? { ...base, visible: body.visible } : parseTire(body, base);
  if ("error" in next) return Response.json({ ok: false, error: next.error }, { status: 400 });
  try {
    await saveTire(next);
    return Response.json({ ok: true, item: next });
  } catch (e) {
    return Response.json({ ok: false, error: String(e instanceof Error ? e.message : e) }, { status: 500 });
  }
}

/** DELETE /api/admin/tires/:seq — 제품 + 가격 행 삭제 */
export async function DELETE(_request: Request, { params }: Ctx) {
  const denied = await denyUnlessAdmin();
  if (denied) return denied;
  const { seq } = await params;
  try {
    const ok = await deleteTire(seq);
    return Response.json({ ok }, { status: ok ? 200 : 404 });
  } catch (e) {
    return Response.json({ ok: false, error: String(e instanceof Error ? e.message : e) }, { status: 500 });
  }
}
