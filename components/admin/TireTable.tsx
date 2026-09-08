"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { BRANDS } from "@/lib/tireSizeOptions";
import type { TireRecord } from "@/lib/tireTypes";
import { Badge, BTN_DANGER, BTN_TEXT, Empty, NUM, TABLE, TD, TH, TR_HOVER } from "./ui";

type Row = { tire: TireRecord; priceRange: string; sizeCount: number };

/** 타이어 목록 (클라이언트) — 브랜드 칩 + 검색, 노출 토글, 수정/삭제 */
export default function TireTable({ rows }: { rows: Row[] }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [brand, setBrand] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  const brandsInUse = useMemo(() => {
    const names = new Set(rows.map((r) => r.tire.brandName));
    return [...BRANDS.filter((b) => names.has(b.name)).map((b) => b.name), ...[...names].filter((n) => !BRANDS.some((b) => b.name === n))];
  }, [rows]);

  const list = rows.filter((r) => (!brand || r.tire.brandName === brand) && (!q.trim() || `${r.tire.brandName} ${r.tire.model}`.toLowerCase().includes(q.trim().toLowerCase())));

  async function toggle(t: TireRecord) {
    setBusy(t.seq);
    await fetch(`/api/admin/tires/${t.seq}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ visible: !t.visible }) }).catch(() => {});
    setBusy(null);
    router.refresh();
  }

  async function remove(t: TireRecord) {
    if (!confirm(`${t.brandName} ${t.model} 을(를) 삭제할까요? 사이즈별 가격도 함께 삭제되며 되돌릴 수 없습니다.\n(숨기기만 하려면 노출 배지를 누르세요)`)) return;
    setBusy(t.seq);
    const res = await fetch(`/api/admin/tires/${t.seq}`, { method: "DELETE" }).catch(() => null);
    if (!res?.ok) alert("삭제에 실패했습니다.");
    setBusy(null);
    router.refresh();
  }

  return (
    <div>
      <div className="mb-[16px] flex items-center justify-between gap-[12px] max-pc:flex-col max-pc:items-stretch">
        <div className="flex flex-wrap gap-[6px]">
          {["", ...brandsInUse].map((b) => (
            <button
              key={b}
              type="button"
              onClick={() => setBrand(b)}
              className={`inline-flex h-[30px] items-center border px-[12px] text-[12px] transition-colors ${brand === b ? "border-ink bg-ink text-white" : "border-line bg-white text-graphite hover:border-graphite hover:text-ink"}`}
            >
              {b || "전체"}
              <span className="ml-[4px] opacity-60" style={NUM}>
                {rows.filter((r) => !b || r.tire.brandName === b).length}
              </span>
            </button>
          ))}
        </div>
        <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="브랜드·모델명 검색" className="field !h-[30px] !w-[220px] !text-[12px] max-pc:!w-full" />
      </div>

      {list.length === 0 ? (
        <Empty>조건에 맞는 타이어가 없습니다.</Empty>
      ) : (
        <div className="overflow-x-auto border-t border-ink bg-white">
          <table className={TABLE}>
            <thead>
              <tr>
                <th className={TH}>사진</th>
                <th className={TH}>브랜드</th>
                <th className={`${TH} w-full`}>모델</th>
                <th className={TH}>타입 · 등급</th>
                <th className={TH}>가격대</th>
                <th className={TH}>사이즈</th>
                <th className={TH}>노출</th>
                <th className={TH}>관리</th>
              </tr>
            </thead>
            <tbody>
              {list.map(({ tire: t, priceRange, sizeCount }) => (
                <tr key={t.seq} className={`${TR_HOVER} ${t.visible ? "" : "opacity-60"}`}>
                  <td className={`${TD} !py-[8px]`}>
                    <Link href={`/admin/tires/edit?seq=${t.seq}`} className="block h-[56px] w-[48px] border border-line bg-white">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      {t.image && <img src={t.image} alt="" className="h-full w-full object-contain" />}
                    </Link>
                  </td>
                  <td className={`${TD} whitespace-nowrap text-muted`}>{t.brandName}</td>
                  <td className={`${TD} min-w-[200px]`}>
                    <Link href={`/admin/tires/edit?seq=${t.seq}`} className="text-[14px] font-semibold !text-ink hover:!text-graphite" style={NUM}>
                      {t.model}
                    </Link>
                    {t.tagline && <span className="mt-[2px] block truncate text-[12px] text-muted">{t.tagline}</span>}
                  </td>
                  <td className={`${TD} whitespace-nowrap`}>
                    {t.typeLabel}
                    {t.levelLabel && <span className="text-muted"> · {t.levelLabel}</span>}
                  </td>
                  <td className={`${TD} whitespace-nowrap`} style={NUM}>
                    {priceRange || "-"}
                  </td>
                  <td className={`${TD} whitespace-nowrap text-muted`} style={NUM}>
                    {sizeCount}
                  </td>
                  <td className={TD}>
                    <button type="button" disabled={busy === t.seq} onClick={() => toggle(t)} title="눌러서 노출 전환" className="disabled:opacity-40">
                      <Badge tone={t.visible ? "ink" : "faint"}>{t.visible ? "노출" : "숨김"}</Badge>
                    </button>
                  </td>
                  <td className={`${TD} whitespace-nowrap`}>
                    <div className="flex gap-[12px]">
                      <Link href={`/admin/tires/edit?seq=${t.seq}`} className={`${BTN_TEXT} !text-muted hover:!text-ink`}>
                        수정
                      </Link>
                      <Link href={`/product/tinfo/view?tinfoseq=${t.seq}`} target="_blank" className={`${BTN_TEXT} !text-muted hover:!text-ink`}>
                        보기
                      </Link>
                      <button type="button" disabled={busy === t.seq} className={BTN_DANGER} onClick={() => remove(t)}>
                        삭제
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
