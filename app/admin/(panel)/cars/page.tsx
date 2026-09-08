import type { Metadata } from "next";
import CarManager from "@/components/admin/CarManager";
import { PageHead } from "@/components/admin/ui";

export const metadata: Metadata = { title: "차량 데이터 관리" };

/**
 * 차량 데이터 관리 (/admin/cars)
 * - 수집한 차량 데이터(제조사·연식·차종·사이즈·사진)는 그대로 두고, 고친 것만 따로 저장해 덮어씌운다.
 * - 제조사 → 연식 → 차종을 고르거나 검색해서 편집 패널을 연다. 새 차종 등록 포함.
 */
export default function AdminCars() {
  return (
    <div>
      <PageHead
        eyebrow="Cars"
        title="차량 데이터 관리"
        desc="차량검색에 쓰이는 제조사·연식·차종·순정 타이어 사이즈·차 사진입니다."
      />
      <CarManager />
    </div>
  );
}
