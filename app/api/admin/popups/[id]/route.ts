import { denyUnlessAdmin } from "@/lib/adminAuth";
import { parsePopup } from "@/lib/adminParse";
import { POPUPS_FILE, type Popup } from "@/lib/popups";
import { removeItem, updateItem } from "@/lib/store";

type Ctx = { params: Promise<{ id: string }> };

/** PATCH /api/admin/popups/:id — 수정. { enabled } 만 보내면 켜기/끄기만 바꾼다 */
export async function PATCH(request: Request, { params }: Ctx) {
  const denied = await denyUnlessAdmin();
  if (denied) return denied;
  const id = Number((await params).id);
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;

  let patch: Partial<Popup>;
  if (Object.keys(body).length === 1 && typeof body.enabled === "boolean") {
    patch = { enabled: body.enabled };
  } else {
    const parsed = parsePopup(body, false);
    if (parsed.error) return Response.json({ ok: false, error: parsed.error }, { status: 400 });
    patch = { ...parsed };
    delete (patch as { error?: string }).error;
  }
  const updated = await updateItem<Popup>(POPUPS_FILE, (p) => p.id === id, patch);
  if (!updated) return Response.json({ ok: false, error: "팝업을 찾을 수 없습니다." }, { status: 404 });
  return Response.json({ ok: true, item: updated });
}

/** DELETE /api/admin/popups/:id */
export async function DELETE(_request: Request, { params }: Ctx) {
  const denied = await denyUnlessAdmin();
  if (denied) return denied;
  const id = Number((await params).id);
  const ok = await removeItem<Popup>(POPUPS_FILE, (p) => p.id === id);
  return Response.json({ ok }, { status: ok ? 200 : 404 });
}
