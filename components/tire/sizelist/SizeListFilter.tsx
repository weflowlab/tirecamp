"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { WIDTHS, RATIOS, INCHES } from "@/lib/tireSizeOptions";
import { buildSizeListHref, splitSize, type SizeListQuery } from "@/lib/sizelistQuery";

/* 제조사 (brandop value) */
const BRANDS: [string, string][] = [
  ["10", "한국"],
  ["14", "금호"],
  ["16", "넥센"],
  ["20", "미쉐린"],
  ["21", "브리지스톤"],
  ["22", "피렐리"],
  ["23", "콘티넨탈"],
  ["28", "던롭"],
  ["26", "굳이어"],
  ["24", "요코하마"],
];

/* 정렬 (sorttireop value) */
const SORTS: [string, string][] = [
  ["2", "낮은 가격순"],
  ["3", "높은 가격순"],
  ["1", "브랜드별"],
  ["5", "승차감·정숙성"],
  ["6", "접지력·고속주행"],
  ["4", "제품수명"],
];

type Props = { query: SizeListQuery };

/**
 * 결과 상단 필터 (얇은 선 카드)
 *  1) 사이즈 재검색 — select 3개(+앞뒤 다르면 3개 더) + 검색 버튼
 *  2) 정렬 — 칩 버튼 (하나만 선택)
 *  3) 제조사 — 칩 버튼 (복수 선택, 전체 = 아무것도 선택 안 함)
 * 모든 변경은 URL query 로 반영(router.push)
 */
export default function SizeListFilter({ query }: Props) {
  const router = useRouter();
  const ft = splitSize(query.ftsize);
  const rt = splitSize(query.rtsize);
  const frDiff = !!query.rtsize && query.rtsize !== query.ftsize;

  const [w1, setW1] = useState(ft?.width ?? "NO");
  const [r1, setR1] = useState(ft?.ratio ?? "NO");
  const [i1, setI1] = useState(ft?.inch ?? "NO");
  const [w2, setW2] = useState(frDiff ? (rt?.width ?? "NO") : "NO");
  const [r2, setR2] = useState(frDiff ? (rt?.ratio ?? "NO") : "NO");
  const [i2, setI2] = useState(frDiff ? (rt?.inch ?? "NO") : "NO");
  const [frchk, setFrchk] = useState(frDiff);

  /* 페이지 리셋 후 이동 */
  function go(next: Partial<SizeListQuery>) {
    router.push(buildSizeListHref({ ...query, spage: 1, lpage: 1, ...next }));
  }

  function frtypechk(checked: boolean) {
    setFrchk(checked);
    if (!checked) {
      setW2("NO");
      setR2("NO");
      setI2("NO");
    }
  }

  /* 사이즈 검증 후 재검색 (정렬/브랜드/탭 유지) */
  function findSubmit() {
    if (w1 === "NO" || r1 === "NO" || i1 === "NO") {
      alert(frchk ? "앞타이어 사이즈를 선택하셔야 합니다." : "사이즈를 선택하셔야 합니다.");
      return;
    }
    if (frchk) {
      if (w2 === "NO" || r2 === "NO" || i2 === "NO") {
        alert("뒤타이어 사이즈를 선택하셔야 합니다.");
        return;
      }
      go({ ftsize: w1 + r1 + i1, rtsize: w2 + r2 + i2 });
    } else {
      const s = w1 + r1 + i1;
      go({ ftsize: s, rtsize: s });
    }
  }

  /* 전체브랜드 ↔ 개별 브랜드 상호 배타 */
  function selbrand(code: string) {
    if (code === "all") {
      if (query.brandop.length === 0) return;
      go({ brandop: [] });
      return;
    }
    const set = new Set(query.brandop);
    if (set.has(code)) set.delete(code);
    else set.add(code);
    go({ brandop: [...set] });
  }

  const sizeSelects = (
    w: string,
    r: string,
    i: string,
    setW: (v: string) => void,
    setR: (v: string) => void,
    setI: (v: string) => void,
    suffix: string,
  ) => (
    <div className="flex gap-[6px]">
      <select name={`selwsize${suffix}`} className="field !h-[38px] !w-[104px] !pl-[10px] !pr-[30px] !text-[13px]" value={w} onChange={(e) => setW(e.target.value)}>
        <option value="NO">단면폭</option>
        {WIDTHS.map((v) => (
          <option key={v} value={String(v)}>{v}</option>
        ))}
      </select>
      <select name={`seltsize${suffix}`} className="field !h-[38px] !w-[98px] !pl-[10px] !pr-[30px] !text-[13px]" value={r} onChange={(e) => setR(e.target.value)}>
        <option value="NO">편평비</option>
        {RATIOS.map((v) => (
          <option key={v} value={String(v)}>{v}</option>
        ))}
      </select>
      <select name={`selinch${suffix}`} className="field !h-[38px] !w-[88px] !pl-[10px] !pr-[30px] !text-[13px]" value={i} onChange={(e) => setI(e.target.value)}>
        <option value="NO">인치</option>
        {INCHES.map((v) => (
          <option key={v} value={String(v)}>{v}</option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="border border-line">
      {/* (1) 사이즈 재검색 */}
      <Row label="Size" title="사이즈 재검색">
        <div className="flex flex-wrap items-center gap-x-[16px] gap-y-[8px]">
          <div className="flex flex-col gap-[6px]">
            {sizeSelects(w1, r1, i1, setW1, setR1, setI1, "1")}
            {frchk && sizeSelects(w2, r2, i2, setW2, setR2, setI2, "2")}
          </div>
          <label className="flex cursor-pointer items-center gap-[6px] text-[12px] text-graphite">
            <input type="checkbox" name="frchk" checked={frchk} onChange={(e) => frtypechk(e.target.checked)} className="accent-black" />
            앞뒤 사이즈가 다르면
          </label>
          <button type="button" onClick={findSubmit} className="btn-fill !h-[38px] !px-[20px]">
            재검색
          </button>
          {/* 초기화: 검색 전(타이어검색 탭)으로 */}
          <Link href="/product/tire/searchbysize" className="btn-outline -ml-[10px] !h-[38px] !px-[16px] !text-graphite hover:!text-ink hover:!no-underline">
            초기화
          </Link>
        </div>
      </Row>

      {/* (2) 정렬 */}
      <Row label="Sort" title="정렬">
        <div className="flex flex-wrap gap-[6px]">
          {SORTS.map(([v, label]) => (
            <Chip key={v} active={query.sorttireop === v} onClick={() => go({ sorttireop: v })}>
              {label}
            </Chip>
          ))}
        </div>
      </Row>

      {/* (3) 제조사 */}
      <Row label="Brand" title="제조사" last>
        <div className="flex flex-wrap gap-[6px]">
          <Chip active={query.brandop.length === 0} onClick={() => selbrand("all")}>
            전체
          </Chip>
          {BRANDS.map(([c, label]) => (
            <Chip key={c} active={query.brandop.includes(c)} onClick={() => selbrand(c)}>
              {label}
            </Chip>
          ))}
        </div>
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
      <div className="min-w-0">{children}</div>
    </div>
  );
}

/* 선택 칩: 선택 시 잉크색 채움 */
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
