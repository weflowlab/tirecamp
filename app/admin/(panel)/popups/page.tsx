import type { Metadata } from "next";
import PopupManager from "@/components/admin/PopupManager";
import { PageHead } from "@/components/admin/ui";
import { POPUPS_FILE, type Popup } from "@/lib/popups";
import { kstDate, readList } from "@/lib/store";

export const metadata: Metadata = { title: "팝업창 관리" };

/** 팝업창 관리 (/admin/popups) — 등록 폼 + 목록 */
export default async function AdminPopups() {
  const popups = (await readList<Popup>(POPUPS_FILE)).sort((a, b) => b.id - a.id);
  return (
    <div>
      <PageHead eyebrow="Popup" title="팝업창 관리" desc="노출 기간 안의 팝업이 홈(또는 전체 페이지) 진입 시 화면 가운데 뜹니다. 여러 개면 닫을 때마다 다음 팝업이 이어집니다." />
      <PopupManager popups={popups} today={kstDate()} />
    </div>
  );
}
