import * as XLSX from "xlsx";
import { denyUnlessAdmin } from "@/lib/adminAuth";
import { INQUIRIES_FILE, type Inquiry } from "@/lib/inquiries";
import { inPeriod, resolvePeriod } from "@/lib/period";
import { kstDate, readList } from "@/lib/store";

/** ISO 시각 → 한국시간 "YYYY-MM-DD HH:mm" (서버 시간대·로케일과 무관하게 직접 계산) */
function kstDateTime(iso: string): string {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return "";
  const k = new Date(t + 9 * 60 * 60 * 1000).toISOString();
  return `${k.slice(0, 10)} ${k.slice(11, 16)}`;
}

/**
 * GET /api/admin/inquiries/export?range=…|from=&to=&status=&q= — 문의 목록 엑셀(.xlsx) 다운로드
 * 화면과 같은 필터(기간·상태·검색어)를 적용한다.
 */
export async function GET(request: Request) {
  const denied = await denyUnlessAdmin();
  if (denied) return denied;
  const sp = new URL(request.url).searchParams;
  const today = kstDate();
  const all = (await readList<Inquiry>(INQUIRIES_FILE)).sort((a, b) => b.id - a.id);
  const first = all.length ? all[all.length - 1].date.replace(/\./g, "-") : today;
  const period = resolvePeriod({ range: sp.get("range") ?? undefined, from: sp.get("from") ?? undefined, to: sp.get("to") ?? undefined }, today, "all", first);
  const status = sp.get("status") === "new" || sp.get("status") === "done" ? sp.get("status") : "";
  const q = (sp.get("q") ?? "").trim();

  const rows = all
    .filter((i) => inPeriod(i.date, period) && (!status || i.status === status) && (!q || [i.name, i.phone, i.car, i.content, i.memo ?? ""].some((v) => v.includes(q))))
    .map((i) => ({
      접수일: i.date,
      접수시각: kstDateTime(i.createdAt),
      상태: i.status === "new" ? "신규" : "처리완료",
      이름: i.name,
      연락처: i.phone,
      유형: i.type,
      "차종/사이즈": i.car,
      문의내용: i.content,
      관리자메모: i.memo ?? "",
    }));

  const ws = XLSX.utils.json_to_sheet(rows);
  ws["!cols"] = [10, 20, 8, 10, 15, 12, 24, 60, 30].map((w) => ({ wch: w }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "문의");
  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer;
  const name = `tirecamp-inquiries-${period.from}_${period.to}.xlsx`;
  return new Response(new Uint8Array(buf), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${name}"; filename*=UTF-8''${encodeURIComponent(name)}`,
      "Cache-Control": "no-store",
    },
  });
}
