/*
 * 타이어 사이즈 검색 결과(sizelist.aspx) HTML → JSON 순수 파서
 * - scripts/scrape-sizelist.mjs (Node, 정적 JSON 생성) 와 lib/sizelist.ts (타입 재노출) 가 공유한다.
 * - Node 22 의 TypeScript 타입 제거(strip-types)로 직접 import 하므로
 *   값 import 는 두지 않고(타입 import 만), enum / namespace 등 지워지지 않는 문법은 쓰지 않는다.
 * - fs/fetch 등 런타임 의존이 전혀 없는 순수 문자열 처리만 담는다.
 */

import type { SizeListQuery, SizeListResult, TireItem, SizeBlock, PageLink } from "./sizelistQuery";

/* 숫자만 남겨 정수로 ("149,000" → 149000) */
function num(s: string | undefined): number {
  return s ? parseInt(s.replace(/[^\d]/g, ""), 10) || 0 : 0;
}

/* 정규식 첫 캡처 그룹 (없으면 "") */
function m1(re: RegExp, s: string): string {
  const m = re.exec(s);
  return m ? (m[1] ?? "") : "";
}

/* HTML 엔티티/공백 정리 (설명문은 원본에서 줄바꿈이 공백으로 렌더링됨) */
function cleanText(s: string): string {
  return s
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

/* 카드 안의 사이즈 블럭(앞/뒤) 1개 파싱 */
function parseSizeBlock(part: string): SizeBlock {
  const speed = /<u title="속도등급:([^"]*)">([^<]*)<\/u>/.exec(part);
  return {
    size: cleanText(part.slice(0, part.indexOf("</font>"))),
    speedGrade: speed ? speed[2].trim() : "",
    speedTitle: speed ? `속도등급:${speed[1]}` : "",
    marketPrice: num(m1(/line-through">\s*<b>([\d,]+)<\/b>/, part)),
    salePrice: num(m1(/name="hcardmoney\d" value="(\d+)"/, part)),
    cashPrice: num(m1(/name="hcashmoney\d" value="(\d+)"/, part)),
    discountText: cleanText(m1(/(↓[^<]*)</, part)),
    defaultQty: num(m1(/<option value="(\d)" selected>/, part)) || 0,
  };
}

const SIZE_FONT = '<font face="Tahoma" color="#000000" style="font-size: 12pt">';

/* 카드(타이어 1개) 조각 파싱 */
function parseCard(chunk: string): TireItem | null {
  const tinfoseq = m1(/tireinfowin\('(\d+)'\)/, chunk);
  if (!tinfoseq) return null;
  const calc = /calcMoney\('(\d+)',(\d),(\d+)\)/.exec(chunk);
  const booking = /bookingSave\('(\d+)','(\d+)','(\d+)'\)/.exec(chunk);
  const parts = chunk.split(SIZE_FONT);
  const front = parseSizeBlock(parts[1] ?? "");
  const rear = parts[2] ? parseSizeBlock(parts[2]) : null;
  return {
    tinfoseq,
    brand: cleanText(m1(/<span style="font-size:16px;color:#000;font-weight:700;">([\s\S]*?)<\/span>/, chunk)),
    model: cleanText(m1(/color:#0066CC;font-weight:700;">([\s\S]*?)<\/span>/, chunk)),
    desc: cleanText(m1(/<span style="FONT-SIZE: 11px">([\s\S]*?)<\/span>/, chunk)),
    comment: cleanText(m1(/tsizecomment-style">([\s\S]*?)<\/div>/, chunk)),
    strength: cleanText(m1(/주장점:\s*<\/font>\s*<font color="#808080"><b>([\s\S]*?)<\/b>/, chunk)),
    imageUrl: m1(/<img border="0" src="([^"]+)" width=140>/, chunk),
    isBest: chunk.includes("/images/icon/besttextbox.gif"),
    bestSection: chunk.includes("border: 1px solid #c44b1c"),
    calcId: calc ? calc[1] : "",
    fseq: booking ? booking[1] : "",
    rseq: booking ? booking[2] : "",
    front,
    rear,
  };
}

/* 원본 sizelist.aspx 결과 HTML 전체 → SizeListResult (query 는 form hidden 값에서 복원) */
export function parseSizeListHtml(html: string): Omit<SizeListResult, "source"> {
  const h = html.replace(/\r\n?/g, "\n");

  /* form hidden/checked 값에서 검색 상태 복원 */
  const brandop = [...h.matchAll(/name="brandop" value="(\d+)"[^>]*checked/g)].map((m) => m[1]);
  const query: SizeListQuery = {
    ftsize: m1(/name="find_ftsize" value="(\d*)"/, h),
    rtsize: m1(/name="find_rtsize" value="(\d*)"/, h),
    seltireg: m1(/name="seltireg" value="([a-z0-9]*)"/, h) || "all",
    sorttireop: m1(/value="(\d)" name="sorttireop"\s+checked/, h) || "2",
    brandop,
    spage: num(m1(/name="spage" value="(\d+)"/, h)) || 1,
    lpage: num(m1(/name="lpage" value="(\d+)"/, h)) || 1,
  };
  if (!query.rtsize) query.rtsize = query.ftsize;

  const total = num(m1(/총 :\s*([\d,]+)\s*개/, h));

  /* 리스트 영역: <!-- 베스트 타이어 --> ~ <!-- 타이어 리스트 --> 사이, 카드 사이 구분선 aibtbar.gif 로 분할 */
  const start = h.indexOf("<!-- 베스트 타이어");
  const end = h.indexOf("<!-- 타이어 리스트");
  const region = start >= 0 && end > start ? h.slice(start, end) : "";
  const tires = region
    .split("/images/main/aibtbar.gif")
    .map(parseCard)
    .filter((t): t is TireItem => t !== null);

  /* 페이지 링크: MovePage(spage,lpage) + 굵은 글씨(font-weight: 700) 가 현재 페이지 */
  const pages: PageLink[] = [
    ...h.matchAll(/MovePage\((\d+),(\d+)\)"><font face="Arial" color="#\w+"><span style="font-size: 15pt;([^"]*)">([^<]*)<\/span>/g),
  ].map((m) => ({
    spage: num(m[1]),
    lpage: num(m[2]),
    label: cleanText(m[4]),
    current: m[3].includes("font-weight: 700"),
  }));

  return { query, total, tires, pages };
}

/* 원본 form 필드 그대로 POST body 구성 (앞뒤 다르면 frchk=2 필요 — 없으면 서버가 find_rtsize 를 무시함) */
export function buildPostBody(q: SizeListQuery): URLSearchParams {
  const body = new URLSearchParams();
  body.set("spage", String(q.spage));
  body.set("lpage", String(q.lpage));
  body.set("findfristchk", "");
  body.set("find_ftsize", q.ftsize);
  body.set("find_rtsize", q.rtsize || q.ftsize);
  if (q.rtsize && q.rtsize !== q.ftsize) body.set("frchk", "2");
  body.set("seltireg", q.seltireg || "all");
  body.set("sorttireop", q.sorttireop || "2");
  if (q.brandop.length === 0) body.append("brandop", "all");
  else for (const b of q.brandop) body.append("brandop", b);
  return body;
}
