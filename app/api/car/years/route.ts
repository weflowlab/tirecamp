import { digitsOnly, getCarYears } from "@/lib/carfind";

/**
 * GET /api/car/years?makercode=10
 * 원본 /common/ajaxmodule/getcaryear.aspx 에 해당 — 데이터는 data/carfind/makers.json (정적 스크랩본) 에서 읽는다.
 * 응답: { years: ["2026", "2025", ...] }
 */
export async function GET(request: Request) {
  const makercode = digitsOnly(new URL(request.url).searchParams.get("makercode"));
  if (!makercode) return Response.json({ years: [] }, { status: 400 });
  try {
    const years = await getCarYears(makercode);
    return Response.json({ years });
  } catch (e) {
    return Response.json({ years: [], error: String(e) }, { status: 502 });
  }
}
