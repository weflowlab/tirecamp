import { digitsOnly, getCarNames } from "@/lib/carfind";

/**
 * GET /api/car/names?makercode=10&syear=2024
 * 원본 /common/ajaxmodule/getcarname.aspx 에 해당 — 데이터는 data/carfind/makers.json (정적 스크랩본) 에서 읽는다.
 * 응답: { cars: [{ code: "133", name: "그랜저" }, ...] }
 */
export async function GET(request: Request) {
  const sp = new URL(request.url).searchParams;
  const makercode = digitsOnly(sp.get("makercode"));
  const syear = digitsOnly(sp.get("syear"));
  if (!makercode || !syear) return Response.json({ cars: [] }, { status: 400 });
  try {
    const cars = await getCarNames(makercode, syear);
    return Response.json({ cars });
  } catch (e) {
    return Response.json({ cars: [], error: String(e) }, { status: 502 });
  }
}
