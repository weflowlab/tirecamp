/**
 * 차량검색(차량 → 연식 → 차종 → 타이어사이즈) 데이터 서버 헬퍼
 *
 * 원본 데이터는 scripts/scrape-carfind.mjs 가 미리 긁어 둔 정적 JSON 에서 읽는다 (런타임 외부 요청 없음).
 *   data/carfind/makers.json         { "<maker>": { years: [...], cars: { "<year>": [{code,name}] } } }
 *   data/carfind/sizes/<maker>.json  { "<year>-<car>": { carimg: "/siteimg/..." | null, sizes: [...] } }
 * 차량 사진은 public/siteimg/... 에 원본과 같은 경로로 저장되어 있어 carimg 경로를 그대로 <img src> 에 쓴다.
 *
 * 관리자(차량 데이터 관리)가 고친 내용은 carOverrides 컬렉션(DB, 없으면 data/carOverrides.json)에 따로 두고
 * 여기서 원본 위에 덮어씌운다 — 6천 건을 옮기지 않고 고친 것만 관리한다.
 */
import fs from "node:fs/promises";
import path from "node:path";
import { cache } from "react";
import { CAR_OVERRIDES_FILE, type AdminCar, type CarName, type CarOverride, type SizeListResult } from "@/lib/carTypes";
import { readList, writeList } from "@/lib/store";

export type { CarName, SizeListResult, TireSizeRow } from "@/lib/carTypes";

/* JSON 파일 구조 */
type MakerInfo = { years: string[]; cars: Record<string, CarName[]> };
type MakersFile = Record<string, MakerInfo>;
type SizesFile = Record<string, SizeListResult>;

/* 데이터 디렉터리 */
const DATA_DIR = path.join(process.cwd(), "data", "carfind");

/* 파싱된 JSON 파일 인메모리 캐시 (프로세스 수명 동안 유지 — 정적 데이터라 TTL 불필요) */
const fileCache = new Map<string, Promise<unknown>>();

/** JSON 파일을 읽어 파싱. 같은 파일은 한 번만 읽는다. 없으면 fallback 반환 */
function readJson<T>(file: string, fallback: T): Promise<T> {
  let p = fileCache.get(file) as Promise<T> | undefined;
  if (!p) {
    p = fs
      .readFile(file, "utf8")
      .then((txt) => JSON.parse(txt) as T)
      .catch((e: NodeJS.ErrnoException) => {
        /* 실패(파일 없음 포함)는 캐시하지 않는다 — 수집 스크립트가 나중에 파일을 만들면 재시작 없이 읽히도록 */
        fileCache.delete(file);
        if (e.code === "ENOENT") return fallback;
        throw e;
      });
    fileCache.set(file, p);
  }
  return p;
}

/** makers.json 전체 */
function loadMakers(): Promise<MakersFile> {
  return readJson<MakersFile>(path.join(DATA_DIR, "makers.json"), {});
}

/** sizes/<maker>.json 전체 */
function loadSizes(makercode: string): Promise<SizesFile> {
  return readJson<SizesFile>(path.join(DATA_DIR, "sizes", `${makercode}.json`), {});
}

/* 숫자 파라미터만 통과 (파일명/키로 쓰이므로 검증) */
export function digitsOnly(v: string | null): string | null {
  if (!v) return null;
  return /^\d{1,8}$/.test(v) ? v : null;
}

/* ---------- 관리자 수정 내용 (원본 위에 덮어쓰기) ---------- */

const overrideId = (maker: string, year: string, code: string) => `${maker}-${year}-${code}`;

/** 수정 내용 전체 (요청당 1회 읽기) */
const loadOverrides = cache(async (): Promise<Map<string, CarOverride>> => {
  const list = await readList<CarOverride>(CAR_OVERRIDES_FILE);
  return new Map(list.map((o) => [o.id, o]));
});

async function getOverride(maker: string, year: string, code: string): Promise<CarOverride | undefined> {
  return (await loadOverrides()).get(overrideId(maker, year, code));
}

/** 사진 파일이 실제로 있는지 (public/ 로컬 경로만 검사, /api/files 는 있다고 본다) */
const photoExists = cache(async (src: string | null | undefined): Promise<boolean> => {
  if (!src) return false;
  if (!src.startsWith("/siteimg/")) return true;
  try {
    await fs.access(path.join(process.cwd(), "public", src));
    return true;
  } catch {
    return false;
  }
});

/* ---------- 공개 조회 (사이트 차량검색) ---------- */

/** 연식 목록: ["2026", ...] — 원본 연식 + 관리자가 새 차종을 넣은 연식 */
export async function getCarYears(makercode: string): Promise<string[]> {
  const makers = await loadMakers();
  const years = new Set(makers[makercode]?.years ?? []);
  for (const o of (await loadOverrides()).values()) if (o.maker === makercode && o.added && !o.hidden) years.add(o.year);
  return [...years].sort((a, b) => Number(b) - Number(a));
}

/** 차종 목록: 원본 + 추가 차종, 숨김 제외, 이름 수정 반영 */
export async function getCarNames(makercode: string, syear: string): Promise<CarName[]> {
  const makers = await loadMakers();
  const overrides = await loadOverrides();
  const out: CarName[] = [];
  for (const c of makers[makercode]?.cars[syear] ?? []) {
    const o = overrides.get(overrideId(makercode, syear, c.code));
    if (o?.hidden) continue;
    out.push({ code: c.code, name: o?.name || c.name });
  }
  for (const o of overrides.values()) if (o.maker === makercode && o.year === syear && o.added && !o.hidden) out.push({ code: o.code, name: o.name ?? "" });
  return out;
}

/**
 * 타이어사이즈 목록 + 차량 사진 (원본 tsizeCallback 에 해당)
 * carimg 는 public/ 아래 로컬 경로("/siteimg/...") 또는 업로드 경로(/api/files/…) 라 그대로 <img src> 에 쓴다.
 * 사진 파일이 없으면 null 로 내려 화면에서 칸을 비운다.
 */
export async function getCarSizeList(makercode: string, syear: string, carcode: string): Promise<SizeListResult> {
  const base = (await loadSizes(makercode))[`${syear}-${carcode}`];
  const o = await getOverride(makercode, syear, carcode);
  if (!base && !o) return { carimg: null, sizes: [] };
  if (o?.hidden) return { carimg: null, sizes: [] };
  const carimg = o?.carimg !== undefined ? o.carimg || null : (base?.carimg ?? null);
  return { carimg: (await photoExists(carimg)) ? carimg : null, sizes: o?.sizes ?? base?.sizes ?? [] };
}

/* ---------- 관리자 조회/수정 ---------- */

/** 관리자용 차종 목록 (숨김 포함, 수정 여부·사진 유무 표시) */
export async function getCarsAdmin(makercode: string, syear: string): Promise<AdminCar[]> {
  const makers = await loadMakers();
  const sizes = await loadSizes(makercode);
  const overrides = await loadOverrides();
  const rows: AdminCar[] = [];
  const push = async (code: string, baseName: string, added: boolean) => {
    const o = overrides.get(overrideId(makercode, syear, code));
    const base = sizes[`${syear}-${code}`];
    const carimg = o?.carimg !== undefined ? o.carimg || null : (base?.carimg ?? null);
    rows.push({
      code,
      name: o?.name || baseName,
      hidden: !!o?.hidden,
      added,
      hasPhoto: await photoExists(carimg),
      edited: !!o && !added && (o.name !== undefined || o.carimg !== undefined || o.sizes !== undefined),
      sizeCount: (o?.sizes ?? base?.sizes ?? []).length,
    });
  };
  for (const c of makers[makercode]?.cars[syear] ?? []) await push(c.code, c.name, false);
  for (const o of overrides.values()) if (o.maker === makercode && o.year === syear && o.added) await push(o.code, o.name ?? "", true);
  return rows;
}

/** 관리자 편집용 상세: 원본 값 + 현재(덮어쓴) 값 */
export async function getCarDetailAdmin(makercode: string, syear: string, carcode: string) {
  const makers = await loadMakers();
  const base = (await loadSizes(makercode))[`${syear}-${carcode}`];
  const baseName = (makers[makercode]?.cars[syear] ?? []).find((c) => c.code === carcode)?.name ?? "";
  const o = await getOverride(makercode, syear, carcode);
  if (!base && !o) return null;
  const carimg = o?.carimg !== undefined ? o.carimg || null : (base?.carimg ?? null);
  /* 같은 차종 코드가 있는 다른 연식 (사진 일괄 적용용) */
  const yearsWithCode = Object.entries(makers[makercode]?.cars ?? {})
    .filter(([, cars]) => cars.some((c) => c.code === carcode))
    .map(([y]) => y);
  return {
    name: o?.name || baseName,
    baseName,
    carimg: (await photoExists(carimg)) ? carimg : null,
    sizes: o?.sizes ?? base?.sizes ?? [],
    baseSizes: base?.sizes ?? [],
    hidden: !!o?.hidden,
    added: !!o?.added,
    edited: !!o,
    yearsWithCode,
  };
}

/**
 * 전체 차종 검색 (관리자) — 띄어쓰기로 나눈 단어가 모두 제조사명·연식·차종명 중 어딘가에 맞아야 한다
 * 예) "기아 2024" → 기아의 2024 차종 전부, "그랜저" → 모든 연식의 그랜저, "벤츠 e" → 벤츠 E클래스 …
 */
export async function searchCarsAdmin(query: string, makerNames: Record<string, string>, limit = 200) {
  const tokens = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return [];
  const makers = await loadMakers();
  const overrides = await loadOverrides();
  const out: { maker: string; year: string; code: string; name: string; hidden: boolean }[] = [];
  const consider = (maker: string, year: string, code: string, name: string, hidden: boolean) => {
    const hay = `${makerNames[maker] ?? ""} ${year} ${name}`.toLowerCase();
    if (tokens.every((t) => hay.includes(t))) out.push({ maker, year, code, name, hidden });
  };
  for (const [maker, info] of Object.entries(makers)) {
    for (const [year, cars] of Object.entries(info.cars)) {
      for (const c of cars) {
        const o = overrides.get(overrideId(maker, year, c.code));
        consider(maker, year, c.code, o?.name || c.name, !!o?.hidden);
        if (out.length >= limit) return out;
      }
    }
  }
  for (const o of overrides.values()) if (o.added) consider(o.maker, o.year, o.code, o.name ?? "", !!o.hidden);
  return out.slice(0, limit);
}

/** 수정 내용 저장 (기존 항목은 patch 로 합친다). applyPhotoAllYears 면 같은 코드의 모든 연식에 사진을 같이 적용 */
export async function saveCarOverride(patch: Omit<CarOverride, "id" | "updatedAt">, applyPhotoAllYears = false): Promise<CarOverride> {
  const list = await readList<CarOverride>(CAR_OVERRIDES_FILE);
  const now = new Date().toISOString();
  const upsert = (p: Partial<CarOverride> & { maker: string; year: string; code: string }) => {
    const id = overrideId(p.maker, p.year, p.code);
    const idx = list.findIndex((o) => o.id === id);
    const next: CarOverride = { ...(idx >= 0 ? list[idx] : { id, maker: p.maker, year: p.year, code: p.code }), ...p, id, updatedAt: now };
    if (idx >= 0) list[idx] = next;
    else list.push(next);
    return next;
  };
  const saved = upsert(patch);
  if (applyPhotoAllYears && patch.carimg !== undefined) {
    const makers = await loadMakers();
    for (const [year, cars] of Object.entries(makers[patch.maker]?.cars ?? {})) {
      if (year !== patch.year && cars.some((c) => c.code === patch.code)) upsert({ maker: patch.maker, year, code: patch.code, carimg: patch.carimg });
    }
  }
  await writeList(CAR_OVERRIDES_FILE, list);
  return saved;
}

/** 수정 내용 삭제 = 원본으로 되돌리기 (관리자가 추가한 차종이면 차종 자체가 사라진다) */
export async function deleteCarOverride(maker: string, year: string, code: string): Promise<boolean> {
  const list = await readList<CarOverride>(CAR_OVERRIDES_FILE);
  const id = overrideId(maker, year, code);
  const next = list.filter((o) => o.id !== id);
  if (next.length === list.length) return false;
  await writeList(CAR_OVERRIDES_FILE, next);
  return true;
}

/** 관리자가 추가하는 차종의 새 코드 (원본 코드와 겹치지 않는 7자리 숫자, 9 로 시작) */
export async function newCarCode(makercode: string): Promise<string> {
  const makers = await loadMakers();
  const used = new Set<string>();
  for (const cars of Object.values(makers[makercode]?.cars ?? {})) for (const c of cars) used.add(c.code);
  for (const o of (await loadOverrides()).values()) if (o.maker === makercode) used.add(o.code);
  let code = "";
  do code = "9" + String(Math.floor(Math.random() * 1_000_000)).padStart(6, "0");
  while (used.has(code));
  return code;
}
