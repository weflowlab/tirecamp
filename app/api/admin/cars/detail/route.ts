import { denyUnlessAdmin } from "@/lib/adminAuth";
import { digitsOnly, getCarDetailAdmin } from "@/lib/carfind";

/** GET /api/admin/cars/detail?maker&year&code — 편집용 상세 (원본 값 + 현재 값) */
export async function GET(request: Request) {
  const denied = await denyUnlessAdmin();
  if (denied) return denied;
  const sp = new URL(request.url).searchParams;
  const maker = digitsOnly(sp.get("maker"));
  const year = digitsOnly(sp.get("year"));
  const code = digitsOnly(sp.get("code"));
  if (!maker || !year || !code) return Response.json({ ok: false }, { status: 400 });
  const detail = await getCarDetailAdmin(maker, year, code);
  if (!detail) return Response.json({ ok: false, error: "차종을 찾을 수 없습니다." }, { status: 404 });
  return Response.json({ ok: true, ...detail });
}
