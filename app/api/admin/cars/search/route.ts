import { denyUnlessAdmin } from "@/lib/adminAuth";
import { searchCarsAdmin } from "@/lib/carfind";
import { clean } from "@/lib/store";
import { MAKERS } from "@/lib/tireSizeOptions";

const MAKER_NAMES = Object.fromEntries(MAKERS.map((m) => [m.code, m.name]));

/** GET /api/admin/cars/search?q=기아 2024 — 제조사명·연식·차종명으로 전체 검색 (최대 200건) */
export async function GET(request: Request) {
  const denied = await denyUnlessAdmin();
  if (denied) return denied;
  const q = clean(new URL(request.url).searchParams.get("q"), 60);
  if (!q) return Response.json({ cars: [] });
  return Response.json({ cars: await searchCarsAdmin(q, MAKER_NAMES) });
}
