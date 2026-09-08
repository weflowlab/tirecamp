import tinfoJson from "@/data/tinfo.json";
import notesJson from "@/data/tireNotes.json";
import type { Tinfo } from "@/lib/tinfo";
import { toTireDetail, type TireNote } from "@/lib/tireDetail";

/**
 * GET /api/tinfo?seq=N — 타이어 상세 모달용 데이터 (정적 JSON 조합, 네트워크 호출 없음)
 * 응답: TireDetail | 404
 */
export async function GET(request: Request) {
  const seq = (new URL(request.url).searchParams.get("seq") ?? "").trim();
  const t = (tinfoJson as Record<string, Tinfo>)[seq];
  if (!t || !t.model) return Response.json({ error: "not found" }, { status: 404 });
  const note = (notesJson as Record<string, TireNote>)[seq];
  return Response.json(toTireDetail(t, note), { headers: { "Cache-Control": "public, max-age=3600" } });
}
