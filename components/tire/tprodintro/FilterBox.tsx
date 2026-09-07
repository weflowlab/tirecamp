"use client";

import type { ListFilter } from "@/lib/tprodintro";
import { LEVELS, TYPES } from "@/lib/tprodintro";
import { BRANDS } from "@/lib/tireSizeOptions";

type Props = {
  filter: ListFilter;
  onBrand: (code: string) => void;
  onType: (code: string) => void;
  onLevel: (code: string) => void;
};

/**
 * 필터 (얇은 선 카드)
 * - 제조사별: 전체 + 10개 브랜드 칩 (복수 선택)
 * - 타입별 / 등급별: 칩 (하나만 선택, "" = 전체)
 */
export default function FilterBox({ filter, onBrand, onType, onLevel }: Props) {
  const allChecked = filter.brands.length === 0;

  return (
    <div className="border border-line">
      <Row label="Brand" title="제조사별">
        <Chip active={allChecked} onClick={() => onBrand("all")}>
          전체
        </Chip>
        {BRANDS.map((b) => (
          <Chip key={b.code} active={filter.brands.includes(b.code)} onClick={() => onBrand(b.code)}>
            {b.name}
          </Chip>
        ))}
      </Row>
      <Row label="Type" title="타입별">
        <Chip active={filter.type === ""} onClick={() => onType("")}>
          전체
        </Chip>
        {TYPES.map((t) => (
          <Chip key={t.code} active={filter.type === t.code} onClick={() => onType(t.code)}>
            {t.name}
          </Chip>
        ))}
      </Row>
      <Row label="Grade" title="등급별" last>
        <Chip active={filter.level === ""} onClick={() => onLevel("")}>
          전체
        </Chip>
        {LEVELS.map((l) => (
          <Chip key={l.code} active={filter.level === l.code} onClick={() => onLevel(l.code)}>
            {l.name}
          </Chip>
        ))}
      </Row>
    </div>
  );
}

function Row({ label, title, last, children }: { label: string; title: string; last?: boolean; children: React.ReactNode }) {
  return (
    <div className={`grid grid-cols-[140px_1fr] gap-[16px] px-[24px] py-[16px] max-pc:grid-cols-1 max-pc:gap-[8px] max-pc:px-[14px] ${last ? "" : "border-b border-line"}`}>
      <div>
        <p className="eyebrow">{label}</p>
        <p className="mt-[2px] text-[14px] font-medium text-ink">{title}</p>
      </div>
      <div className="flex flex-wrap gap-[6px]">{children}</div>
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`h-[32px] border px-[12px] text-[12px] transition-colors ${
        active ? "border-ink bg-ink text-white" : "border-line bg-white text-graphite hover:border-graphite hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}
