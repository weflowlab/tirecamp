/**
 * 차량검색(차량 → 연식 → 차종 → 타이어사이즈) 데이터 서버 헬퍼
 *
 * 데이터는 scripts/scrape-carfind.mjs 가 원본 사이트에서 미리 긁어 둔 정적 JSON 에서만 읽는다.
 * 런타임에 외부 네트워크 요청은 전혀 하지 않는다.
 *   data/carfind/makers.json         { "<maker>": { years: [...], cars: { "<year>": [{code,name}] } } }
 *   data/carfind/sizes/<maker>.json  { "<year>-<car>": { carimg: "/siteimg/..." | null, sizes: [...] } }
 * 차량 사진은 public/siteimg/... 에 원본과 같은 경로로 저장되어 있어 carimg 경로를 그대로 <img src> 에 쓸 수 있다.
 */
import fs from "node:fs/promises";
import path from "node:path";

/* 응답 타입 */
export type CarName = { code: string; name: string };
export type TireSizeRow = {
  frtype: string; // "1": 앞뒤 동일, "2": 앞뒤 다름
  oesize: string;
  ftsize: string; // 앞 사이즈 숫자만 (예 2454518)
  rtsize: string; // 뒤 사이즈 숫자만
  ftsizev: string; // 앞 사이즈 표시용 (예 245/45R18)
  rtsizev: string; // 뒤 사이즈 표시용
};
export type SizeListResult = { carimg: string | null; sizes: TireSizeRow[] };

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
        if (e.code === "ENOENT") return fallback;
        fileCache.delete(file);
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

/** 연식 목록: ["2026", ...] (원본 yearCallback 에 해당) */
export async function getCarYears(makercode: string): Promise<string[]> {
  const makers = await loadMakers();
  return makers[makercode]?.years ?? [];
}

/** 차종 목록: [{ code: "133", name: "그랜저" }, ...] (원본 carCallback 에 해당) */
export async function getCarNames(makercode: string, syear: string): Promise<CarName[]> {
  const makers = await loadMakers();
  return makers[makercode]?.cars[syear] ?? [];
}

/**
 * 타이어사이즈 목록 + 차량 사진 (원본 tsizeCallback 에 해당)
 * carimg 는 public/ 아래 로컬 경로("/siteimg/...") 이므로 그대로 <img src> 에 쓴다.
 */
export async function getCarSizeList(makercode: string, syear: string, carcode: string): Promise<SizeListResult> {
  const sizes = await loadSizes(makercode);
  const hit = sizes[`${syear}-${carcode}`];
  return hit ? { carimg: hit.carimg ?? null, sizes: hit.sizes ?? [] } : { carimg: null, sizes: [] };
}
