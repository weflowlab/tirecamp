"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toSizeDraft, type AdminCar, type SizeDraft, type TireSizeRow } from "@/lib/carTypes";
import { MAKERS } from "@/lib/tireSizeOptions";
import { Badge, BTN, BTN_DANGER, BTN_OUTLINE, BTN_TEXT, Card, Empty, FIELD, Field, Msg, NUM, TABLE, TD, TH, TR_HOVER } from "./ui";

type Detail = {
  name: string;
  baseName: string;
  carimg: string | null;
  sizes: TireSizeRow[];
  baseSizes: TireSizeRow[];
  hidden: boolean;
  added: boolean;
  edited: boolean;
  yearsWithCode: string[];
};

type Found = { maker: string; year: string; code: string; name: string; hidden?: boolean };

const makerName = (code: string) => MAKERS.find((m) => m.code === code)?.name ?? code;

/* 이 화면의 버튼 4개(초기화 · 차종 추가 · 검색 · 검색 초기화)는 모두 같은 크기 */
const BTN_SIZE = "!h-[38px] w-full shrink-0 whitespace-nowrap !px-0 max-pc:w-full";

/**
 * 차량 데이터 관리 (클라이언트)
 * - 왼쪽: 제조사·연식 선택 → 차종 목록 (수정됨/추가/숨김/사진 없음 표시)
 * - 오른쪽: 선택한 차종 편집 (이름 · 사진 · 사이즈 · 숨김) / 새 차종 등록
 * - 검색: 제조사명·연식·차종명을 섞어 전체 데이터에서 찾아 바로 편집
 */
export default function CarManager() {
  const [maker, setMaker] = useState("");
  const [years, setYears] = useState<string[]>([]);
  const [year, setYear] = useState("");
  const [cars, setCars] = useState<AdminCar[]>([]);
  const [loadedFor, setLoadedFor] = useState(""); // 마지막으로 목록을 받아온 "제조사-연식" (다르면 불러오는 중)
  const loadingCars = loadedFor !== `${maker}-${year}`;
  const [sel, setSel] = useState<{ maker: string; year: string; code: string } | "new" | null>(null);

  /* 전체 검색 (제조사명 · 연식 · 차종명) */
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Found[] | null>(null); // null = 검색 안 함
  const [searching, setSearching] = useState(false);


  /* 연식 목록 */
  const loadYears = useCallback(async (m: string) => {
    const res = await fetch(`/api/car/years?makercode=${m}`);
    const data = (await res.json()) as { years: string[] };
    setYears(data.years ?? []);
    return data.years ?? [];
  }, []);

  /* 차종 목록 (관리자용: 숨김 포함) */
  const loadCars = useCallback(async (m: string, y: string) => {
    const res = await fetch(`/api/admin/cars?maker=${m}&year=${y}`).catch(() => null);
    const data = res ? ((await res.json()) as { cars: AdminCar[] }) : { cars: [] };
    return data.cars ?? [];
  }, []);

  useEffect(() => {
    if (!maker || !year) return;
    let active = true;
    loadCars(maker, year).then((list) => {
      if (!active) return;
      setCars(list);
      setLoadedFor(`${maker}-${year}`);
    });
    return () => {
      active = false;
    };
  }, [maker, year, loadCars]);

  async function onMaker(m: string) {
    setMaker(m);
    setSel(null);
    setYear("");
    setCars([]);
    if (!m) return setYears([]);
    await loadYears(m);
  }

  async function runSearch() {
    const query = q.trim();
    if (!query) return setResults(null);
    setSearching(true);
    try {
      const res = await fetch(`/api/admin/cars/search?q=${encodeURIComponent(query)}`);
      setResults(((await res.json()) as { cars: Found[] }).cars ?? []);
    } finally {
      setSearching(false);
    }
  }

  /* 초기화: 제조사·연식 선택을 비우고 편집 패널을 닫는다 */
  function resetSelect() {
    setSel(null);
    setMaker("");
    setYears([]);
    setYear("");
    setCars([]);
  }

  /* 검색 초기화: 검색어와 결과를 지운다 */
  function resetSearch() {
    setQ("");
    setResults(null);
  }

  /* 저장/삭제 후 목록 갱신 */
  const refresh = async () => {
    setCars(await loadCars(maker, year));
    if (results) {
      const res = await fetch(`/api/admin/cars/search?q=${encodeURIComponent(q.trim())}`);
      setResults(((await res.json()) as { cars: Found[] }).cars ?? []);
    }
  };

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_420px] gap-[16px] max-pc:grid-cols-1">
      {/* 좌: 선택 + 목록 */}
      <div className="flex flex-col gap-[16px]">
        <Card eyebrow="Select" title="제조사 · 연식">
          {/* 두 줄 모두 [넓은 칸 | 버튼 | 버튼] 같은 격자 — 드롭박스 두 개의 폭 = 아래 검색창 폭, 버튼들은 위아래로 나란히 */}
          <div className="grid grid-cols-[minmax(0,1fr)_104px_104px] items-end gap-[8px] max-pc:grid-cols-2">
            <div className="grid grid-cols-2 gap-[8px] max-pc:col-span-2">
              <label className="block">
                <span className="mb-[6px] block text-[12px] tracking-[0.02em] text-muted">제조사</span>
                <select className={FIELD} value={maker} onChange={(e) => onMaker(e.target.value)}>
                  <option value="">제조사 선택</option>
                  {MAKERS.map((m) => (
                    <option key={m.code} value={m.code}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-[6px] block text-[12px] tracking-[0.02em] text-muted">연식</span>
                <select
                  className={FIELD}
                  value={year}
                  disabled={!maker}
                  onChange={(e) => {
                    setYear(e.target.value);
                    setSel(null);
                  }}
                >
                  <option value="">연식 선택</option>
                  {years.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <button type="button" disabled={!maker || !year} className={`${BTN} ${BTN_SIZE}`} onClick={() => setSel("new")}>
              차종 추가
            </button>
            <button type="button" className={`${BTN_OUTLINE} ${BTN_SIZE}`} onClick={resetSelect}>
              선택 초기화
            </button>
          </div>
          {/* 전체 검색: 제조사명·연식·차종명을 띄어쓰기로 섞어 입력 */}
          <form
            className="mt-[10px] grid grid-cols-[minmax(0,1fr)_104px_104px] items-center gap-[8px] max-pc:mt-[14px] max-pc:grid-cols-2 max-pc:border-t max-pc:border-line max-pc:pt-[14px]"
            onSubmit={(e) => {
              e.preventDefault();
              runSearch();
            }}
          >
            <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="제조사·연식·차종 검색 (예: 기아 2024)" className={`${FIELD} min-w-0 max-pc:col-span-2`} />
            <button type="submit" disabled={searching} className={`${BTN} ${BTN_SIZE}`}>
              {searching ? "검색 중" : "검색"}
            </button>
            <button type="button" disabled={!q && !results} className={`${BTN_OUTLINE} ${BTN_SIZE}`} onClick={resetSearch}>
              검색 초기화
            </button>
          </form>
        </Card>

        {results ? (
          <Card eyebrow="Search" title={`"${q.trim()}" 검색 결과`} action={<span className="text-[12px] text-muted">{results.length >= 200 ? "200건 이상 (검색어를 더 넣어 주세요)" : `${results.length}건`}</span>}>
            {results.length === 0 ? (
              <Empty>맞는 차종이 없습니다. 제조사명·연식·차종명을 띄어쓰기로 섞어 검색해 보세요.</Empty>
            ) : (
              <div className="overflow-x-auto">
                <table className={TABLE}>
                  <thead>
                    <tr>
                      <th className={TH}>제조사</th>
                      <th className={TH}>연식</th>
                      <th className={`${TH} w-full`}>차종</th>
                      <th className={TH}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((c) => (
                      <tr key={`${c.maker}-${c.year}-${c.code}`} className={`${TR_HOVER} cursor-pointer ${c.hidden ? "opacity-50" : ""}`} onClick={() => setSel(c)}>
                        <td className={`${TD} whitespace-nowrap`}>{makerName(c.maker)}</td>
                        <td className={`${TD} whitespace-nowrap`} style={NUM}>
                          {c.year}
                        </td>
                        <td className={`${TD} font-semibold text-ink`}>{c.name}</td>
                        <td className={`${TD} whitespace-nowrap`}>{c.hidden ? <Badge tone="faint">숨김</Badge> : <span className={BTN_TEXT}>수정</span>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        ) : !maker || !year ? (
          <div className="border border-dashed border-line bg-white px-[20px] py-[40px] text-center text-[13px] leading-[22px] text-muted">
            제조사와 연식을 고르거나, 위 검색칸에 차종명을 입력하세요.
          </div>
        ) : (
          <Card eyebrow="Cars" title={`${makerName(maker)} ${year} 차종`} action={<span className="text-[12px] text-muted">{loadingCars ? "불러오는 중" : `${cars.length}종`}</span>}>
            {cars.length === 0 ? (
              <Empty>{loadingCars ? "불러오는 중..." : "이 연식에 등록된 차종이 없습니다. [새 차종 등록] 으로 추가하세요."}</Empty>
            ) : (
              <div className="overflow-x-auto">
                <table className={TABLE}>
                  <thead>
                    <tr>
                      <th className={`${TH} w-full`}>차종</th>
                      <th className={`${TH} !text-center`}>사이즈</th>
                      <th className={`${TH} !text-center`}>사진</th>
                      <th className={TH}>상태</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cars.map((c) => {
                      const active = sel !== null && sel !== "new" && sel.code === c.code && sel.maker === maker && sel.year === year;
                      return (
                        <tr key={c.code} className={`${TR_HOVER} cursor-pointer ${active ? "bg-surface" : ""} ${c.hidden ? "opacity-50" : ""}`} onClick={() => setSel({ maker, year, code: c.code })}>
                          <td className={`${TD} font-semibold text-ink`}>{c.name}</td>
                          <td className={`${TD} whitespace-nowrap text-center text-muted`} style={NUM}>
                            {c.sizeCount}
                          </td>
                          <td className={`${TD} whitespace-nowrap text-center`}>
                            {c.hasPhoto ? (
                              <span className="text-[12px] text-muted">있음</span>
                            ) : (
                              <span className="inline-flex justify-center">
                                <Badge tone="outline">없음</Badge>
                              </span>
                            )}
                          </td>
                          <td className={`${TD} whitespace-nowrap`}>
                            <span className="flex gap-[4px]">
                              {c.added && <Badge tone="ink">추가</Badge>}
                              {c.edited && <Badge tone="muted">수정됨</Badge>}
                              {c.hidden && <Badge tone="faint">숨김</Badge>}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        )}
      </div>

      {/* 우: 편집 */}
      <div className="pc:sticky pc:top-[24px] pc:self-start">
        {sel === "new" ? (
          <CarEditor key={`new-${maker}-${year}`} maker={maker} year={year} code={null} onDone={refresh} onClose={() => setSel(null)} />
        ) : sel ? (
          <CarEditor key={`${sel.maker}-${sel.year}-${sel.code}`} maker={sel.maker} year={sel.year} code={sel.code} onDone={refresh} onClose={() => setSel(null)} />
        ) : (
          <div className="border border-dashed border-line bg-white px-[20px] py-[40px] text-center text-[13px] leading-[22px] text-muted">
            왼쪽 목록에서 차종을 누르면
            <br />
            여기서 이름·사진·사이즈를 수정할 수 있습니다.
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- 차종 편집 패널 ---------- */
function CarEditor({ maker, year, code, onDone, onClose }: { maker: string; year: string; code: string | null; onDone: () => Promise<void>; onClose: () => void }) {
  const isNew = code === null;
  const [detail, setDetail] = useState<Detail | null>(null);
  const [name, setName] = useState("");
  const [carimg, setCarimg] = useState<string | null>(null);
  const [imgTouched, setImgTouched] = useState(false);
  const [applyAll, setApplyAll] = useState(false);
  const [sizes, setSizes] = useState<SizeDraft[]>([{ front: "", rear: "" }]);
  const [hidden, setHidden] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isNew) return;
    let active = true;
    fetch(`/api/admin/cars/detail?maker=${maker}&year=${year}&code=${code}`)
      .then((r) => r.json())
      .then((d: Detail & { ok: boolean }) => {
        if (!active || !d.ok) return;
        setDetail(d);
        setName(d.name);
        setCarimg(d.carimg);
        setSizes(d.sizes.length ? d.sizes.map(toSizeDraft) : [{ front: "", rear: "" }]);
        setHidden(d.hidden);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [maker, year, code, isNew]);

  async function upload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload?dir=car", { method: "POST", body: fd });
      const data = (await res.json()) as { ok: boolean; url?: string; error?: string };
      if (!res.ok || !data.ok || !data.url) throw new Error(data.error || "업로드에 실패했습니다.");
      setCarimg(data.url);
      setImgTouched(true);
    } catch (err) {
      setMsg({ ok: false, text: err instanceof Error ? err.message : "업로드에 실패했습니다." });
    } finally {
      setBusy(false);
    }
  }

  const setSize = (i: number, patch: Partial<SizeDraft>) => setSizes((list) => list.map((s, k) => (k === i ? { ...s, ...patch } : s)));

  async function save() {
    if (!name.trim()) return setMsg({ ok: false, text: "차종 이름을 입력해 주세요." });
    const rows = sizes.filter((s) => s.front.trim() || s.rear.trim());
    setBusy(true);
    setMsg(null);
    try {
      const body: Record<string, unknown> = { maker, year, name, sizes: rows, hidden };
      if (!isNew) body.code = code;
      if (imgTouched || isNew) body.carimg = carimg ?? "";
      if (imgTouched && applyAll) body.applyPhotoAllYears = true;
      const res = await fetch("/api/admin/cars", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = (await res.json()) as { ok: boolean; error?: string };
      if (!res.ok || !data.ok) throw new Error(data.error || "저장에 실패했습니다.");
      setMsg({ ok: true, text: "저장했습니다. 사이트 차량검색에 바로 반영됩니다." });
      setImgTouched(false);
      await onDone();
      if (isNew) onClose();
    } catch (err) {
      setMsg({ ok: false, text: err instanceof Error ? err.message : "저장에 실패했습니다." });
    } finally {
      setBusy(false);
    }
  }

  async function revert() {
    if (!code) return;
    const q = detail?.added ? "관리자가 추가한 차종입니다. 완전히 삭제할까요?" : "이 차종의 수정 내용을 지우고 수집한 원본으로 되돌릴까요?";
    if (!confirm(q)) return;
    setBusy(true);
    try {
      await fetch(`/api/admin/cars?maker=${maker}&year=${year}&code=${code}`, { method: "DELETE" });
      await onDone();
      onClose();
    } finally {
      setBusy(false);
    }
  }

  const title = isNew ? `새 차종 등록 — ${makerName(maker)} ${year}` : `${makerName(maker)} ${year} · ${detail?.name ?? "..."}`;

  return (
    <Card
      eyebrow={isNew ? "New" : "Edit"}
      title={title}
      action={
        <button type="button" className={BTN_TEXT} onClick={onClose}>
          닫기
        </button>
      }
    >
      {!isNew && !detail ? (
        <p className="py-[20px] text-center text-[13px] text-muted">불러오는 중...</p>
      ) : (
        <div className="flex flex-col gap-[14px]">
          <Field label="차종 이름" required hint={detail && detail.baseName && detail.baseName !== name ? `(원본: ${detail.baseName})` : undefined}>
            <input className={FIELD} value={name} maxLength={40} placeholder="예: 그랜저" onChange={(e) => setName(e.target.value)} />
          </Field>

          <div>
            <span className="mb-[6px] block text-[12px] tracking-[0.02em] text-muted">차 사진</span>
            <div className="flex items-start gap-[12px]">
              <div className="flex h-[90px] w-[130px] shrink-0 items-center justify-center border border-line bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {carimg ? <img src={carimg} alt="" className="max-h-full max-w-full object-contain p-[4px]" /> : <span className="text-[11px] text-faint">사진 없음</span>}
              </div>
              <div className="flex flex-col gap-[6px]">
                <button type="button" disabled={busy} className={BTN_OUTLINE} onClick={() => fileRef.current?.click()}>
                  {carimg ? "사진 바꾸기" : "사진 올리기"}
                </button>
                {carimg && (
                  <button
                    type="button"
                    className={BTN_TEXT}
                    onClick={() => {
                      setCarimg(null);
                      setImgTouched(true);
                    }}
                  >
                    사진 제거
                  </button>
                )}
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={upload} />
              </div>
            </div>
            {!isNew && imgTouched && (detail?.yearsWithCode.length ?? 0) > 1 && (
              <label className="mt-[8px] flex cursor-pointer items-center gap-[8px] text-[12px] text-ink">
                <input type="checkbox" className="accent-black" checked={applyAll} onChange={(e) => setApplyAll(e.target.checked)} />
                같은 차종의 다른 연식 {detail!.yearsWithCode.length - 1}개에도 이 사진 적용
              </label>
            )}
          </div>

          <div>
            <div className="mb-[6px] flex items-end justify-between gap-[10px]">
              <span className="text-[12px] tracking-[0.02em] text-muted">
                순정 타이어 사이즈
                <span className="mt-[2px] block text-[11px] text-faint">(앞뒤가 다르면 뒤 칸도 입력)</span>
              </span>
              <button type="button" className={`${BTN_TEXT} shrink-0 whitespace-nowrap`} onClick={() => setSizes((l) => [...l, { front: "", rear: "" }])}>
                + 사이즈 추가
              </button>
            </div>
            <div className="flex flex-col gap-[6px]">
              {sizes.map((s, i) => (
                <div key={i} className="flex items-center gap-[6px]">
                  <input className={`${FIELD} !h-[34px] min-w-0 flex-1`} style={NUM} value={s.front} placeholder="앞 225/45R18" onChange={(e) => setSize(i, { front: e.target.value })} />
                  <input className={`${FIELD} !h-[34px] min-w-0 flex-1`} style={NUM} value={s.rear} placeholder="뒤 (같으면 비움)" onChange={(e) => setSize(i, { rear: e.target.value })} />
                  <button type="button" className={`${BTN_DANGER} shrink-0`} onClick={() => setSizes((l) => l.filter((_, k) => k !== i))}>
                    삭제
                  </button>
                </div>
              ))}
            </div>
          </div>

          {!isNew && (
            <label className="flex cursor-pointer items-center gap-[8px] text-[13px] text-ink">
              <input type="checkbox" className="accent-black" checked={hidden} onChange={(e) => setHidden(e.target.checked)} />
              사이트 차량검색에서 숨김
            </label>
          )}

          <div className="flex items-center justify-between gap-[10px] border-t border-line pt-[14px]">
            <div>
              {!isNew && detail?.edited && (
                <button type="button" disabled={busy} className={BTN_DANGER} onClick={revert}>
                  {detail.added ? "차종 삭제" : "원본으로 되돌리기"}
                </button>
              )}
            </div>
            <div className="flex items-center gap-[10px] whitespace-nowrap">
              <Msg msg={msg} />
              <button type="button" disabled={busy} className={`${BTN} shrink-0`} onClick={save}>
                {busy ? "저장 중..." : isNew ? "등록" : "저장"}
              </button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
