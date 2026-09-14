import { denyUnlessAdmin } from "@/lib/adminAuth";
import { parsePopup } from "@/lib/adminParse";
import { POPUPS_FILE, type Popup } from "@/lib/popups";
import { appendItem, kstDate } from "@/lib/store";

/** POST /api/admin/popups — 팝업 등록 (이미지는 /api/admin/upload 로 먼저 올린 경로) */
export async function POST(request: Request) {
  const denied = await denyUnlessAdmin();
  if (denied) return denied;
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const parsed = parsePopup(body, true);
  if (parsed.error) return Response.json({ ok: false, error: parsed.error }, { status: 400 });

  const item: Popup = {
    id: Date.now(),
    title: parsed.title!,
    start: parsed.start ?? kstDate(),
    end: parsed.end ?? kstDate(),
    linkUrl: parsed.linkUrl ?? "",
    newWindow: parsed.newWindow ?? false,
    hideToday: parsed.hideToday ?? true,
    pcImage: parsed.pcImage!,
    mobImage: parsed.mobImage ?? "",
    enabled: parsed.enabled ?? true,
    scope: parsed.scope ?? "home",
    createdAt: new Date().toISOString(),
  };
  await appendItem(POPUPS_FILE, item);
  return Response.json({ ok: true, item });
}
