import { digitsOnly, getCarSizeList } from "@/lib/carfind";

/**
 * GET /api/car/sizes?makercode=10&syear=2024&carcode=133
 * 원본 /common/ajaxmodule/getcartsizelist.aspx (imgtype=0) 프록시 — 데이터는 원본 사이트에서 실시간으로 가져온다.
 * 응답: { carimg: "http://tirekongjang.com/siteimg/...jpg" | null, sizes: [{ frtype, ftsize, rtsize, ftsizev, rtsizev, ... }] }
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
