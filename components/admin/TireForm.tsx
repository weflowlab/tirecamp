"use client";

import Link from "next/link";
import { useMemo, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { TireDetailContent } from "@/components/tire/TireDetailModal";
import { formatSize, normalizeSize } from "@/lib/sizelistQuery";
import { toTireDetail } from "@/lib/tireDetail";
import { BRANDS } from "@/lib/tireSizeOptions";
import { discountText, priceRangeOf, TIRE_LEVELS, TIRE_TYPES, type TirePrice, type TireRecord } from "@/lib/tireTypes";
import { BTN, BTN_DANGER, BTN_OUTLINE, BTN_TEXT, Card, FIELD, Field, Msg, NUM, TABLE, TD, TEXTAREA, TH } from "./ui";

type Draft = Pick<
  TireRecord,
  | "brandCode"
  | "brandName"
  | "model"
  | "image"
  | "images"
  | "typeLabel"
  | "levelLabel"
  | "typeCode"
  | "levelCode"
  | "tagline"
  | "desc"
  | "descHtml"
  | "speedRating"
  | "treadwear"
  | "priceRange"
  | "visible"
>;

/* 타입/등급 선택지 — 코드가 있는 표준 항목(타이어소개 필터에 쓰임) + 기존 데이터에 쓰인 표시 이름 */
const CUSTOM = "__custom";
const TYPE_OPTIONS = [...TIRE_TYPES.map((t) => t.name), "승용/SUV"];
const LEVEL_OPTIONS = [...TIRE_LEVELS.map((l) => l.name), "사계절용", "올웨더", "윈터용", "고성능", "전기차"];
const TYPE_CODE = new Map(TIRE_TYPES.map((t) => [t.name, t.code]));
const LEVEL_CODE = new Map(TIRE_LEVELS.map((l) => [l.name, l.code]));

const EMPTY: Draft = {
  brandCode: BRANDS[0].code,
  brandName: BRANDS[0].name,
  model: "",
  image: "",
  images: [],
  typeLabel: TIRE_TYPES[0].name,
  levelLabel: TIRE_LEVELS[0].name,
  typeCode: TIRE_TYPES[0].code,
  levelCode: TIRE_LEVELS[0].code,
  tagline: "",
  desc: "",
  descHtml: "",
  speedRating: "",
  treadwear: "",
  priceRange: "",
  visible: true,
};

/** 화면용 가격 행 (입력 중 문자열 보관) */
type PriceDraft = {
  key: string;
  id: string;
  size: string;
  speedGrade: string;
  marketPrice: string;
  salePrice: string;
  comment: string;
  isBest: boolean;
  visible: boolean;
};

function toDraft(p: TirePrice): PriceDraft {
  return {
    key: p.id,
    id: p.id,
    size: formatSize(p.size),
    speedGrade: p.speedGrade,
    marketPrice: money(p.marketPrice),
    salePrice: money(p.salePrice),
    comment: p.comment,
    isBest: p.isBest,
    visible: p.visible,
  };
}

const n = (s: string) => Number(s.replace(/[^\d]/g, "")) || 0;
const money = (v: number) => (v ? v.toLocaleString("ko-KR") : "");

/**
 * 타이어 제품 폼 + 사이즈별 가격 표 (클라이언트)
 * - 배치: [대표 사진 | 제품 정보] (같은 높이) → [스펙 · 노출] (전체 폭) → 버튼 줄
 * - 제품 정보: 브랜드 / 모델 / 타입·등급 / 한 줄 소개 / 설명 / 카드 설명
 * - 가격 표: 사이즈 · 속도등급 · 정가 · 판매가 · 비고 · 베스트 · 노출, 행 추가/삭제 후 일괄 저장 (할인율은 자동)
 */
export default function TireForm({ tire, prices }: { tire: TireRecord | null; prices: TirePrice[] }) {
  const router = useRouter();
  const [d, setD] = useState<Draft>(tire ? { ...tire } : EMPTY);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const mainRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState(false); // 미리보기 모달 (저장 전 입력값으로 상세 모달을 그대로 그린다)

  const [rows, setRows] = useState<PriceDraft[]>(prices.map(toDraft));
  const [deleted, setDeleted] = useState<string[]>([]);
  const [pBusy, setPBusy] = useState(false);
  const [pMsg, setPMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [initial] = useState(() => JSON.stringify(prices.map(toDraft)));
  const pricesDirty = JSON.stringify(rows) !== initial || deleted.length > 0;

  const set = (k: keyof Draft, v: string | boolean | string[]) => setD((x) => ({ ...x, [k]: v }));

  const autoRange = useMemo(() => priceRangeOf(rows.filter((r) => r.visible).map((r) => ({ salePrice: n(r.salePrice) }))), [rows]);

  async function upload(file: File): Promise<string> {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/admin/upload?dir=tire", {
      method: "POST",
      body: fd,
    });
    const data = (await res.json()) as {
      ok: boolean;
      url?: string;
      error?: string;
    };
    if (!res.ok || !data.ok || !data.url) throw new Error(data.error || "업로드에 실패했습니다.");
    return data.url;
  }

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy(true);
    try {
      set("image", await upload(file));
    } catch (err) {
      setMsg({
        ok: false,
        text: err instanceof Error ? err.message : "업로드에 실패했습니다.",
      });
    } finally {
      setBusy(false);
    }
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!d.model.trim()) return setMsg({ ok: false, text: "모델명을 입력해 주세요." });
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch(tire ? `/api/admin/tires/${tire.seq}` : "/api/admin/tires", {
        method: tire ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(d),
      });
      const data = (await res.json()) as {
        ok: boolean;
        error?: string;
        item?: TireRecord;
      };
      if (!res.ok || !data.ok) throw new Error(data.error || "저장에 실패했습니다.");
      if (!tire && data.item) {
        router.replace(`/admin/tires/edit?seq=${data.item.seq}`);
        router.refresh();
        return;
      }
      setMsg({ ok: true, text: "저장했습니다. 사이트에 바로 반영됩니다." });
      router.refresh();
    } catch (err) {
      setMsg({
        ok: false,
        text: err instanceof Error ? err.message : "저장에 실패했습니다.",
      });
    } finally {
      setBusy(false);
    }
  }

  /* ---- 가격 표 ---- */
  const setRow = (key: string, patch: Partial<PriceDraft>) => setRows((list) => list.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  const addRow = () =>
    setRows((list) => [
      ...list,
      {
        key: `new-${Date.now()}`,
        id: "",
        size: "",
        speedGrade: "",
        marketPrice: "",
        salePrice: "",
        comment: "",
        isBest: false,
        visible: true,
      },
    ]);
  const removeRow = (r: PriceDraft) => {
    if (r.id && !confirm(`${r.size || "이"} 사이즈 가격을 삭제할까요?`)) return;
    setRows((list) => list.filter((x) => x.key !== r.key));
    if (r.id) setDeleted((ids) => [...ids, r.id]);
  };

  async function savePrices() {
    if (!tire) return;
    for (const [i, r] of rows.entries()) {
      if (!/^\d{7}$/.test(normalizeSize(r.size)))
        return setPMsg({
          ok: false,
          text: `${i + 1}번 행의 사이즈를 225/45R18 형식으로 입력해 주세요.`,
        });
      if (n(r.salePrice) <= 0)
        return setPMsg({
          ok: false,
          text: `${i + 1}번 행(${r.size})의 할인가를 입력해 주세요.`,
        });
    }
    setPBusy(true);
    setPMsg(null);
    try {
      const items = rows.map((r) => ({
        id: r.id,
        size: normalizeSize(r.size),
        speedGrade: r.speedGrade,
        marketPrice: n(r.marketPrice),
        salePrice: n(r.salePrice),
        cashPrice: n(r.salePrice),
        comment: r.comment,
        isBest: r.isBest,
        visible: r.visible,
      }));
      const res = await fetch(`/api/admin/tires/${tire.seq}/prices`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, deleted }),
      });
      const data = (await res.json()) as { ok: boolean; error?: string };
      if (!res.ok || !data.ok) throw new Error(data.error || "저장에 실패했습니다.");
      setPMsg({ ok: true, text: "가격을 저장했습니다." });
      router.refresh();
      // 저장 후 새 행 id 가 발급되므로 서버 데이터로 다시 그린다
      setTimeout(() => window.location.reload(), 400);
    } catch (err) {
      setPMsg({
        ok: false,
        text: err instanceof Error ? err.message : "저장에 실패했습니다.",
      });
    } finally {
      setPBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-[16px]">
      <form onSubmit={submit} className="grid grid-cols-[300px_1fr] items-stretch gap-[16px] max-pc:grid-cols-1">
        {/* 1행 좌: 대표 사진 — 오른쪽 제품 정보 카드와 같은 높이, 사진 영역이 남는 높이를 채운다 */}
        <Card eyebrow="Photo" title="대표 사진" className="flex flex-col [&>div:last-child]:flex [&>div:last-child]:flex-1 [&>div:last-child]:flex-col">
          <div className="flex min-h-[240px] flex-1 items-center justify-center border border-line bg-white">
            {d.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={d.image} alt="" className="max-h-[360px] max-w-full object-contain p-[8px]" />
            ) : (
              <span className="text-[12px] text-faint">사진 없음</span>
            )}
          </div>
          <div className="mt-[10px] flex gap-[12px]">
            <button type="button" disabled={busy} className={BTN_OUTLINE} onClick={() => mainRef.current?.click()}>
              {d.image ? "사진 바꾸기" : "사진 올리기"}
            </button>
            {d.image && (
              <button type="button" className={BTN_TEXT} onClick={() => set("image", "")}>
                제거
              </button>
            )}
          </div>
          <input ref={mainRef} type="file" accept="image/*" className="hidden" onChange={onPick} />
        </Card>

        {/* 우: 제품 정보 */}
        <Card eyebrow="Product" title="제품 정보">
          <div className="grid grid-cols-2 gap-[12px] max-pc:grid-cols-1">
            <Field label="브랜드" required>
              <select
                className={FIELD}
                value={BRANDS.some((b) => b.code === d.brandCode) ? d.brandCode : "etc"}
                onChange={(e) => {
                  const b = BRANDS.find((x) => x.code === e.target.value);
                  setD((x) => ({
                    ...x,
                    brandCode: b ? b.code : "",
                    brandName: b ? b.name : x.brandName,
                  }));
                }}
              >
                {BRANDS.map((b) => (
                  <option key={b.code} value={b.code}>
                    {b.name}
                  </option>
                ))}
                <option value="etc">기타 (직접 입력)</option>
              </select>
            </Field>
            {!BRANDS.some((b) => b.code === d.brandCode) && (
              <Field label="브랜드명 (직접 입력)" required>
                <input className={FIELD} value={d.brandName} maxLength={30} onChange={(e) => set("brandName", e.target.value)} />
              </Field>
            )}
            <Field label="모델명" required>
              <input className={`${FIELD} font-semibold`} value={d.model} maxLength={60} placeholder="예: Ventus S1 evo3" onChange={(e) => set("model", e.target.value)} />
            </Field>
            <Field label="타입" hint="(승용/SUV/겨울용 — 타이어소개 필터에 쓰임)">
              <select
                className={FIELD}
                value={TYPE_OPTIONS.includes(d.typeLabel) ? d.typeLabel : CUSTOM}
                onChange={(e) => {
                  const label = e.target.value === CUSTOM ? "" : e.target.value;
                  setD((x) => ({
                    ...x,
                    typeLabel: label,
                    typeCode: TYPE_CODE.get(label) ?? "",
                  }));
                }}
              >
                {TYPE_OPTIONS.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
                <option value={CUSTOM}>직접 입력</option>
              </select>
              {!TYPE_OPTIONS.includes(d.typeLabel) && (
                <input className={`${FIELD} mt-[6px]`} value={d.typeLabel} maxLength={30} placeholder="타입 이름 입력" onChange={(e) => set("typeLabel", e.target.value)} />
              )}
            </Field>
            <Field label="등급" hint="(카드에 타입 옆에 표시)">
              <select
                className={FIELD}
                value={LEVEL_OPTIONS.includes(d.levelLabel) ? d.levelLabel : CUSTOM}
                onChange={(e) => {
                  const label = e.target.value === CUSTOM ? "" : e.target.value;
                  setD((x) => ({
                    ...x,
                    levelLabel: label,
                    levelCode: LEVEL_CODE.get(label) ?? "",
                  }));
                }}
              >
                {LEVEL_OPTIONS.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
                <option value={CUSTOM}>직접 입력</option>
              </select>
              {!LEVEL_OPTIONS.includes(d.levelLabel) && (
                <input className={`${FIELD} mt-[6px]`} value={d.levelLabel} maxLength={30} placeholder="등급 이름 입력" onChange={(e) => set("levelLabel", e.target.value)} />
              )}
            </Field>
          </div>
          <div className="mt-[12px]">
            <Field label="한 줄 소개" hint="(상세 모달 제목 아래)">
              <input
                className={FIELD}
                value={d.tagline}
                maxLength={120}
                placeholder="예: 승차감과 정숙성에 집중한 프리미엄 컴포트"
                onChange={(e) => set("tagline", e.target.value)}
              />
            </Field>
          </div>
          <div className="mt-[12px]">
            <Field label="설명" hint="(상세 모달)">
              <textarea className={`${TEXTAREA} h-[90px]`} value={d.desc} maxLength={2000} onChange={(e) => set("desc", e.target.value)} />
            </Field>
          </div>
          <div className="mt-[12px]">
            <Field label="카드 설명" hint="(검색 결과 카드의 회색 설명, 제조사 문구)">
              <textarea className={`${TEXTAREA} h-[64px]`} value={d.descHtml} maxLength={2000} onChange={(e) => set("descHtml", e.target.value)} />
            </Field>
          </div>
        </Card>

        {/* 2행: 스펙 · 노출 (전체 폭, 가로 배치) */}
        <Card eyebrow="Spec" title="스펙 · 노출" className="col-span-2 max-pc:col-span-1">
          <div className="grid grid-cols-3 gap-[12px] max-pc:grid-cols-1">
            <Field label="속도등급" hint="(쉼표로 여러 개)">
              <input className={FIELD} value={d.speedRating} maxLength={40} placeholder="H,V,W" onChange={(e) => set("speedRating", e.target.value)} />
            </Field>
            <Field label="트레드웨어">
              <input className={FIELD} value={d.treadwear} maxLength={10} placeholder="400" onChange={(e) => set("treadwear", e.target.value)} />
            </Field>
            <Field label="가격대 문구" hint={autoRange ? `(가격표 기준 자동: ${autoRange})` : "(가격표가 없을 때 표시)"}>
              <input className={FIELD} value={d.priceRange} maxLength={40} placeholder="156,000 ~ 700,000" onChange={(e) => set("priceRange", e.target.value)} />
            </Field>
          </div>
          <label className="mt-[14px] flex cursor-pointer items-center gap-[8px] text-[13px] text-ink">
            <input type="checkbox" className="accent-black" checked={d.visible} onChange={(e) => set("visible", e.target.checked)} />
            사이트에 노출<span className="text-muted max-pc:hidden"> (끄면 타이어소개·검색 결과·상세에서 모두 숨김)</span>
          </label>
        </Card>

        {/* 버튼 줄 */}
        <div className="col-span-2 flex items-center justify-between gap-[10px] max-pc:col-span-1 max-pc:flex-wrap">
          <Link href="/admin/tires" className={`${BTN_OUTLINE} shrink-0 !no-underline`}>
            목록으로
          </Link>
          <div className="flex items-center gap-[12px] whitespace-nowrap">
            <Msg msg={msg} />
            <button type="button" className={`${BTN_OUTLINE} shrink-0`} onClick={() => setPreview(true)}>
              미리보기
            </button>
            <button type="submit" disabled={busy} className={`${BTN} shrink-0`}>
              {busy ? "저장 중..." : tire ? "제품 정보 저장" : "등록"}
            </button>
          </div>
        </div>
      </form>

      {/* 미리보기 — 고객이 보는 상세 모달을 지금 입력한 값으로 그대로 띄운다 (저장 전 확인용) */}
      {preview && (
        <>
          <div className="fixed inset-0 z-[1000] bg-black/55 backdrop-blur-[2px]" onClick={() => setPreview(false)} />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="타이어 상세 미리보기"
            className="fixed left-1/2 top-1/2 z-[1001] flex max-h-[90vh] w-[960px] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden bg-white font-sans shadow-[0_30px_80px_-24px_rgba(0,0,0,0.5)] max-pc:h-[92vh] max-pc:w-[calc(100%-20px)]"
          >
            <div className="flex h-[40px] shrink-0 items-center justify-between bg-ink px-[16px] text-[12px] text-white">
              <span className="tracking-[0.04em]">미리보기 · 저장 전 입력값으로 보여줍니다</span>
              <button type="button" onClick={() => setPreview(false)} className="font-semibold hover:underline">
                닫기 ✕
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto">
              <TireDetailContent
                data={toTireDetail(
                  { ...d, seq: tire?.seq ?? "", scores: tire?.scores ?? [], sortOrder: tire?.sortOrder ?? 0, updatedAt: "" },
                  autoRange || d.priceRange,
                )}
              />
            </div>
          </div>
        </>
      )}

      {/* 사이즈별 가격 */}
      {tire && (
        <Card
          eyebrow="Prices"
          title="사이즈별 판매 가격"
          action={
            <div className="flex items-center gap-[12px]">
              {pricesDirty && <span className="text-[12px] text-ink max-pc:hidden">저장하지 않은 변경이 있습니다</span>}
              <button type="button" className={`${BTN_OUTLINE} shrink-0`} onClick={addRow}>
                + 사이즈 추가
              </button>
              <button type="button" disabled={pBusy || !pricesDirty} className={`${BTN} shrink-0`} onClick={savePrices}>
                {pBusy ? "저장 중..." : "가격 저장"}
              </button>
            </div>
          }
        >
          <p className="mb-[14px] text-[13px] leading-[21px] text-graphite">
            이 타이어를 파는 사이즈와 사이즈마다의 가격입니다. 고객이 사이즈로 검색하면 여기 적힌 줄이 카드 한 장씩으로 나오고, 정가는 줄을 그어 작게, 판매가는 크게 보입니다.
          </p>
          {rows.length === 0 ? (
            <p className="border border-dashed border-line py-[28px] text-center text-[13px] text-muted">등록된 사이즈가 없습니다. [사이즈 추가] 로 시작하세요.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className={`${TABLE} min-w-[860px]`}>
                <thead>
                  <tr>
                    <th className={TH}>사이즈</th>
                    <th className={TH}>속도등급</th>
                    <th className={TH}>정가</th>
                    <th className={TH}>판매가</th>
                    <th className={TH}>할인율 (자동)</th>
                    <th className={TH}>비고 문구</th>
                    <th className={`${TH} w-[64px] !text-center`}>베스트</th>
                    <th className={`${TH} w-[64px] !text-center`}>노출</th>
                    <th className={TH}></th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.key} className={r.visible ? "" : "opacity-50"}>
                      <td className={`${TD} !px-[6px]`}>
                        <input
                          className={`${FIELD} !h-[32px] !w-[110px]`}
                          style={NUM}
                          value={r.size}
                          placeholder="225/45R18"
                          onChange={(e) => setRow(r.key, { size: e.target.value })}
                          onBlur={(e) =>
                            /^\d{7}$/.test(normalizeSize(e.target.value)) &&
                            setRow(r.key, {
                              size: formatSize(normalizeSize(e.target.value)),
                            })
                          }
                        />
                      </td>
                      <td className={`${TD} !px-[6px]`}>
                        <input
                          className={`${FIELD} !h-[32px] !w-[56px] text-center`}
                          style={NUM}
                          value={r.speedGrade}
                          maxLength={2}
                          placeholder="Y"
                          onChange={(e) =>
                            setRow(r.key, {
                              speedGrade: e.target.value.toUpperCase(),
                            })
                          }
                        />
                      </td>
                      <td className={`${TD} !px-[6px]`}>
                        <input
                          className={`${FIELD} !h-[32px] !w-[100px] text-right`}
                          style={NUM}
                          value={r.marketPrice}
                          inputMode="numeric"
                          onChange={(e) =>
                            setRow(r.key, {
                              marketPrice: e.target.value.replace(/[^\d]/g, ""),
                            })
                          }
                          onBlur={(e) =>
                            setRow(r.key, {
                              marketPrice: money(n(e.target.value)),
                            })
                          }
                        />
                      </td>
                      <td className={`${TD} !px-[6px]`}>
                        <input
                          className={`${FIELD} !h-[32px] !w-[100px] text-right font-semibold`}
                          style={NUM}
                          value={r.salePrice}
                          inputMode="numeric"
                          onChange={(e) =>
                            setRow(r.key, {
                              salePrice: e.target.value.replace(/[^\d]/g, ""),
                            })
                          }
                          onBlur={(e) =>
                            setRow(r.key, {
                              salePrice: money(n(e.target.value)),
                            })
                          }
                        />
                      </td>
                      <td className={`${TD} whitespace-nowrap text-[12px] text-muted`}>{discountText(n(r.marketPrice), n(r.salePrice)).replace(/^↓/, "") || "-"}</td>
                      <td className={`${TD} !px-[6px]`}>
                        <input
                          className={`${FIELD} !h-[32px] !w-[150px]`}
                          value={r.comment}
                          maxLength={60}
                          placeholder="예: 런플랫"
                          onChange={(e) => setRow(r.key, { comment: e.target.value })}
                        />
                      </td>
                      <td className={`${TD} text-center`}>
                        <input
                          type="checkbox"
                          className="block mx-auto h-[15px] w-[15px] accent-black"
                          checked={r.isBest}
                          onChange={(e) => setRow(r.key, { isBest: e.target.checked })}
                        />
                      </td>
                      <td className={`${TD} text-center`}>
                        <input
                          type="checkbox"
                          className="block mx-auto h-[15px] w-[15px] accent-black"
                          checked={r.visible}
                          onChange={(e) => setRow(r.key, { visible: e.target.checked })}
                        />
                      </td>
                      <td className={`${TD} whitespace-nowrap`}>
                        <button type="button" className={BTN_DANGER} onClick={() => removeRow(r)}>
                          삭제
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <ul className="mt-[14px] flex flex-col gap-[2px] text-[12px] leading-[18px] text-muted">
            <li>· 정가를 비우면 판매가와 같게 저장돼 할인 표시가 없어집니다.</li>
            <li>· 비고 문구는 흡음재·런플랫처럼 같은 사이즈 안에서 구분이 필요할 때만 적으세요.</li>
            <li>· 베스트는 검색 결과 맨 위 추천 칸에 한 번 더 나옵니다.</li>
          </ul>
          <div className="mt-[14px] flex items-center justify-end gap-[12px] whitespace-nowrap">
            <Msg msg={pMsg} />
            <button type="button" disabled={pBusy || !pricesDirty} className={`${BTN} shrink-0`} onClick={savePrices}>
              {pBusy ? "저장 중..." : "가격 저장"}
            </button>
          </div>
        </Card>
      )}
    </div>
  );
}
