import { digitsOnly, getCarSizeList } from "@/lib/carfind";

/**
 * GET /api/car/sizes?makercode=10&syear=2024&carcode=133
 * 원본 /common/ajaxmodule/getcartsizelist.aspx (imgtype=0) 에 해당 — 데이터는 data/carfind/sizes/<maker>.json (정적 스크랩본) 에서 읽는다.
 * 응답: { carimg: "/siteimg/carimg/listimg/10/...jpg" (public/ 로컬 경로) | null, sizes: [{ frtype, ftsize, rtsize, ftsizev, rtsizev, ... }] }
 */
export async function GET(request: Request) {
  const sp = new URL(request.url).searchParams;
  const makercode = digitsOnly(sp.get("makercode"));
  const syear = digitsOnly(sp.get("syear"));
  const carcode = digitsOnly(sp.get("carcode"));
  if (!makercode || !syear || !carcode) return Response.json({ carimg: null, sizes: [] }, { status: 400 });
  try {
    const result = await getCarSizeList(makercode, syear, carcode);
    return Response.json(result);
  } catch (e) {
    return Response.json({ carimg: null, sizes: [], error: String(e) }, { status: 502 });
  }
}
