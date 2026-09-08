import type { Metadata } from "next";
import FaqManager from "@/components/admin/FaqManager";
import { PageHead } from "@/components/admin/ui";
import { getFaqs } from "@/lib/faq";

export const metadata: Metadata = { title: "FAQ 관리" };

/** 자주 묻는 질문 관리 (/admin/faq) — 순서 변경/추가/수정/삭제 후 한 번에 저장 */
export default async function AdminFaq() {
  const items = await getFaqs();
  return (
    <div>
      <PageHead eyebrow="FAQ" title="자주 묻는 질문 관리" desc="고객센터 > 자주 묻는 질문에 위에서부터 순서대로 노출됩니다. 변경 후 [저장] 을 눌러야 반영됩니다." />
      <FaqManager initial={items} />
    </div>
  );
}
