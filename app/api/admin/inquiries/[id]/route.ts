import { denyUnlessAdmin } from "@/lib/adminAuth";
import { INQUIRIES_FILE, type Inquiry } from "@/lib/inquiries";
import { clean, removeItem, updateItem } from "@/lib/store";

type Ctx = { params: Promise<{ id: string }> };

/** PATCH /api/admin/inquiries/:id — { status?, memo? } */
export async function PATCH(request: Request, { params }: Ctx) {
  const denied = await denyUnlessAdmin();
  if (denied) return denied;
  const id = Number((await params).id);
  const body = (await request.json().catch(() => ({}))) as Partial<Inquiry>;
  const patch: Partial<Inquiry> = {};
  if (body.status === "new" || body.status === "done") patch.status = body.status;
  if (body.memo !== undefined) patch.memo = clean(body.memo, 1000);
  const updated = await updateItem<Inquiry>(INQUIRIES_FILE, (i) => i.id === id, patch);
  if (!updated) return Response.json({ ok: false, error: "문의를 찾을 수 없습니다." }, { status: 404 });
  return Response.json({ ok: true, item: updated });
}

/** DELETE /api/admin/inquiries/:id */
export async function DELETE(_request: Request, { params }: Ctx) {
  const denied = await denyUnlessAdmin();
  if (denied) return denied;
  const id = Number((await params).id);
  const ok = await removeItem<Inquiry>(INQUIRIES_FILE, (i) => i.id === id);
  return Response.json({ ok }, { status: ok ? 200 : 404 });
}
