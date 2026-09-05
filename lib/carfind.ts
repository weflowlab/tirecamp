/**
 * 차량검색(차량 → 연식 → 차종 → 타이어사이즈) 데이터 서버 헬퍼
 *
 * 데이터는 원본 사이트(tirekongjang.com)의 AJAX 모듈에서 실시간으로 가져온다.
 *   /common/ajaxmodule/getcaryear.aspx?makercode=..
 *   /common/ajaxmodule/getcarname.aspx?makercode=..&syear=..
 *   /common/ajaxmodule/getcartsizelist.aspx?makercode=..&syear=..&carcode=..&imgtype=0
 * 원본은 XML 을 돌려주므로 여기서 정규식으로 파싱해 JSON 으로 변환한다. (외부 의존성 없음)
 */

/* 원본 사이트 주소 */
export const ORIGIN = "http://tirekongjang.com";

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

/* 간단한 인메모리 캐시 (1시간 TTL) — 원본 서버 부하를 줄이기 위함 */
const CACHE_TTL_MS = 60 * 60 * 1000;
const cache = new Map<string, { at: number; value: unknown }>();

function cacheGet<T>(key: string): T | undefined {
  const hit = cache.get(key);
  if (!hit) return undefined;
  if (Date.now() - hit.at > CACHE_TTL_MS) {
    cache.delete(key);
    return undefined;
  }
  return hit.value as T;
}
function cacheSet(key: string, value: unknown) {
  cache.set(key, { at: Date.now(), value });
}

/* 원본 XML 을 문자열로 가져온다. 인코딩 선언(euc-kr/ks_c_5601)에 맞춰 디코딩 */
async function fetchXml(path: string): Promise<string> {
  const res = await fetch(ORIGIN + path, {
    headers: { "User-Agent": "Mozilla/5.0" },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`원본 응답 오류 ${res.status}`);
  const buf = await res.arrayBuffer();
  // 앞부분(ASCII)만 먼저 읽어 encoding 선언을 확인
  const head = new TextDecoder("utf-8", { fatal: false }).decode(buf.slice(0, 120));
  const enc = /encoding=["']([^"']+)["']/i.exec(head)?.[1]?.toLowerCase() ?? "utf-8";
  const label = enc.includes("5601") || enc.includes("euc-kr") ? "euc-kr" : "utf-8";
  try {
    return new TextDecoder(label).decode(buf);
  } catch {
    return new TextDecoder("utf-8").decode(buf);
  }
}

/* XML 엔티티 복원 */
function unescapeXml(s: string): string {
  return s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");
}

/* <tag attr="v" .../> 의 속성 목록을 객체로 */
function parseAttrs(attrText: string): Record<string, string> {
  const out: Record<string, string> = {};
  const re = /([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(attrText))) out[m[1]] = unescapeXml(m[2] ?? m[3] ?? "");
  return out;
}

/* 숫자 파라미터만 통과 (원본 쿼리에 그대로 붙이므로 검증) */
export function digitsOnly(v: string | null): string | null {
  if (!v) return null;
  return /^\d{1,8}$/.test(v) ? v : null;
}

/** 연식 목록: <years><year>2026</year>... → ["2026", ...] (원본 yearCallback) */
export async function getCarYears(makercode: string): Promise<string[]> {
  const key = `years:${makercode}`;
  const hit = cacheGet<string[]>(key);
  if (hit) return hit;
  const xml = await fetchXml(`/common/ajaxmodule/getcaryear.aspx?makercode=${makercode}`);
  const years = [...xml.matchAll(/<year>\s*([^<]+?)\s*<\/year>/g)].map((m) => m[1]);
  cacheSet(key, years);
  return years;
}

/** 차종 목록: <cars><car code="133" name="그랜저"/>... (원본 carCallback) */
export async function getCarNames(makercode: string, syear: string): Promise<CarName[]> {
  const key = `names:${makercode}:${syear}`;
  const hit = cacheGet<CarName[]>(key);
  if (hit) return hit;
  const xml = await fetchXml(`/common/ajaxmodule/getcarname.aspx?makercode=${makercode}&syear=${syear}`);
  const cars = [...xml.matchAll(/<car\b([^>]*?)\/?>/g)]
    .map((m) => parseAttrs(m[1]))
    .filter((a) => a.code && a.name)
    .map((a) => ({ code: a.code, name: a.name }));
  cacheSet(key, cars);
  return cars;
}

/**
 * 타이어사이즈 목록 + 차량 사진 (원본 tsizeCallback)
 * <tirelist><tlist frtype=".." ftsize=".." .../>...<carimg imgtype='0'>/siteimg/...</carimg></tirelist>
 * carimg 는 원본 서버의 상대경로이므로 절대 URL 로 바꿔 돌려준다.
 */
export async function getCarSizeList(makercode: string, syear: string, carcode: string): Promise<SizeListResult> {
  const key = `sizes:${makercode}:${syear}:${carcode}`;
  const hit = cacheGet<SizeListResult>(key);
  if (hit) return hit;
  const xml = await fetchXml(
    `/common/ajaxmodule/getcartsizelist.aspx?makercode=${makercode}&syear=${syear}&carcode=${carcode}&imgtype=0`,
  );
  const sizes: TireSizeRow[] = [...xml.matchAll(/<tlist\b([^>]*?)\/?>/g)].map((m) => {
    const a = parseAttrs(m[1]);
    return {
      frtype: a.frtype ?? "1",
      oesize: a.oesize ?? "",
      ftsize: a.ftsize ?? "",
      rtsize: a.rtsize ?? "",
      ftsizev: a.ftsizev ?? "",
      rtsizev: a.rtsizev ?? "",
    };
  });
  const imgMatch = /<carimg\b[^>]*>\s*([^<]+?)\s*<\/carimg>/.exec(xml);
  let carimg: string | null = null;
  if (imgMatch) {
    const raw = unescapeXml(imgMatch[1]);
    carimg = /^https?:\/\//i.test(raw) ? raw : ORIGIN + (raw.startsWith("/") ? raw : "/" + raw);
  }
  const result = { carimg, sizes };
  cacheSet(key, result);
  return result;
}
