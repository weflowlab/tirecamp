import type { Metadata } from "next";
import Link from "next/link";
import TireTable from "@/components/admin/TireTable";
import { BTN, PageHead } from "@/components/admin/ui";
import { hasDb } from "@/lib/db";
import { getAllPrices, getPriceRanges, getTires } from "@/lib/tires";

export const metadata: Metadata = { title: "타이어 관리" };

/** 타이어 관리 (/admin/tires) — 제품 목록, 노출 토글, 수정/삭제 */
export default async function AdminTires() {
  const [tires, ranges, prices] = await Promise.all([getTires(true), getPriceRanges(), getAllPrices()]);
  const rows = tires.map((t) => ({ tire: t, priceRange: ranges.get(t.seq) || t.priceRange, sizeCount: (prices.get(t.seq) ?? []).length }));

  return (
    <div>
      <PageHead
        eyebrow="Tires"
        title="타이어 관리"
        desc="타이어소개·사이즈 검색·상세 모달에 나오는 제품 정보와 사이즈별 가격입니다. 제품을 누르면 사진·이름·설명·가격을 고칠 수 있습니다."
        action={
          <Link href="/admin/tires/edit" className={`${BTN} !no-underline max-pc:w-full`}>
            + 타이어 등록
          </Link>
        }
      />
      {!hasDb() && (
        <p className="mb-[16px] border border-dashed border-line bg-white px-[18px] py-[12px] text-[13px] text-muted">
          DATABASE_URL 이 설정되지 않아 읽기 전용입니다. .env.local 에 DB 연결 문자열을 넣으면 수정할 수 있습니다.
        </p>
      )}
      <TireTable rows={rows} />
    </div>
  );
}
