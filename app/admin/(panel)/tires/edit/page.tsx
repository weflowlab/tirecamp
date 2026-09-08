import type { Metadata } from "next";
import { notFound } from "next/navigation";
import TireForm from "@/components/admin/TireForm";
import { PageHead } from "@/components/admin/ui";
import { getTire, getTirePrices } from "@/lib/tires";

export const metadata: Metadata = { title: "타이어 편집" };

type Props = { searchParams: Promise<{ seq?: string }> };

/** 타이어 등록/수정 (/admin/tires/edit?seq=N) — 제품 정보 + 사이즈별 가격 */
export default async function AdminTireEdit({ searchParams }: Props) {
  const sp = await searchParams;
  const seq = (sp.seq ?? "").trim();
  const tire = seq ? await getTire(seq, true) : undefined;
  if (seq && !tire) notFound();
  const prices = tire ? await getTirePrices(tire.seq) : [];

  return (
    <div>
      <PageHead
        back={{ href: "/admin/tires", label: "타이어 목록으로" }}
        eyebrow="Tires"
        title={tire ? `${tire.brandName} ${tire.model}` : "새 타이어 등록"}
        desc={tire ? `No. ${tire.seq} · 사이즈 ${prices.length}개` : "제품 정보를 저장한 뒤 사이즈별 가격을 추가할 수 있습니다."}
      />
      <TireForm tire={tire ?? null} prices={prices} />
    </div>
  );
}
