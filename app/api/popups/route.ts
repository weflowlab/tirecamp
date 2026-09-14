import { POPUPS_FILE, popupState, type Popup } from "@/lib/popups";
import { kstDate, readList } from "@/lib/store";

/** GET /api/popups — 지금 노출 중인 팝업 목록 (공개, LayerPopup 이 호출) */
export async function GET() {
  const today = kstDate();
  const list = await readList<Popup>(POPUPS_FILE);
  const active = list
    .filter((p) => popupState(p, today) === "active")
    .sort((a, b) => b.id - a.id)
    .map(({ id, title, linkUrl, newWindow, hideToday, pcImage, mobImage, scope }) => ({ id, title, linkUrl, newWindow, hideToday, pcImage, mobImage, scope }));
  return Response.json(active, { headers: { "Cache-Control": "no-store" } });
}
