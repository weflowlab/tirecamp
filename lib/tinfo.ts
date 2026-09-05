/**
 * 타이어 상세 팝업(/product/tinfo/view.aspx?tinfoseq=N) HTML 파서 + 타입 정의
 *
 * - scripts/scrape-tinfo.mjs (Node, 정적 JSON 생성) 가 파서를 사용하고,
 *   app/product/tinfo/view/page.tsx 는 타입만 사용한다 (런타임 네트워크 호출 없음 — fetch 는 스크립트 안에만 있다).
 * - Node 22 의 TypeScript 타입 제거(strip-types)로 직접 import 하므로
 *   enum / namespace / parameter property 등 "지워지지 않는" 문법은 쓰지 않는다.
 */

/** 성능 그래프 한 항목 (원본 subgrapicon.gif 의 width/height 속성 그대로) */
export type TinfoScore = {
  label: string; // 승차감 / 정숙성 / 핸들링 / 빗길주행성 / 고속주행성 / 제품수명 / 저연비 / 접지력
  width: number; // 점수 × 12px (0점이면 1)
  height: number; // 0점이면 9, 그 외 12
};

/** 팝업 한 페이지의 파싱 결과 */
export type Tinfo = {
  seq: string;
  image: string; // 상품 이미지 경로 (/prodimg/...)
  imageWidth: number; // 원본 img width (194)
  imageHeight: number; // 원본 img height (243)
  brandName: string; // 검정 18pt
  model: string; // #0066CC 20pt Arial
  descHtml: string; // 회색 설명문 (원본 inner HTML)
  speedRating: string; // "속도등급 : " 뒤 텍스트 (원본에 ",H" 같은 값 그대로)
  treadwear: string; // "트레드웨어 : " 뒤 숫자
  priceRange: string; // "가격대 : " ~ "원 까지" 사이 텍스트
  scores: TinfoScore[]; // DOM 순서 (좌/우 컬럼이 번갈아 8개)
  reviewScore: string; // 리뷰평점
  strongPoint: string; // 주장점 (없으면 "")
  typeLevel: string; // 이미지 아래 "SUV/RV / 프리미엄"
  contentHtml: string; // 회색 구분바 아래 상세 내용 HTML (주로 <CENTER><IMG ...>)
};

/** HTML 엔티티/공백 정리 */
function clean(s: string | undefined): string {
  return (s ?? "")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function m1(html: string, re: RegExp): string {
  const m = html.match(re);
  return m ? m[1] : "";
}

/** 팝업 HTML 문자열 → Tinfo (경로는 원본 그대로, 외부 이미지도 원본 URL 그대로) */
export function parseTinfoHtml(html: string, seq: string | number): Tinfo {
  // 상품 이미지 <img src="/prodimg/..." width=194 height=243 border=0>
  const img = html.match(/<img src="([^"]+)" width=(\d+) height=(\d+) border=0>/i);

  // 성능 그래프: <font ... 8pt>라벨&nbsp;&nbsp; </font></td><td ...><img height="H" src="/images/subgrapicon.gif" width="W"
  const scores: TinfoScore[] = [];
  const scoreRe =
    /<font face="돋움" style="font-size: 8pt">(?:&nbsp;)?([^&<]+?)&nbsp;&nbsp; <\/font><\/td>\s*<td[^>]*>\s*<img height="(\d+)" src="\/images\/subgrapicon\.gif" width="(\d+)"/g;
  let sm: RegExpExecArray | null;
  while ((sm = scoreRe.exec(html)) !== null) {
    scores.push({ label: clean(sm[1]), height: Number(sm[2]), width: Number(sm[3]) });
  }

  // 회색 구분바(gubunbg.gif) 아래 상세 내용
  const content = html.match(
    /gubunbg\.gif"[\s\S]*?<\/table>\s*<table[^>]*>\s*<tr>\s*<td height="21" width="766" align="left">([\s\S]*?)<\/td>\s*<\/tr>\s*<\/table>/i,
  );

  return {
    seq: String(seq),
    image: img ? img[1] : "",
    imageWidth: img ? Number(img[2]) : 194,
    imageHeight: img ? Number(img[3]) : 243,
    brandName: clean(m1(html, /<font color="#000000" face=돋움>([^<]*)<\/font>/i)),
    model: clean(m1(html, /<font color="#0066CC" face="Arial">([^<]*)<\/font>/i)),
    descHtml: m1(html, /<font color="#808080">\s*([\s\S]*?)\s*<\/font>/i).trim(),
    speedRating: clean(m1(html, /속도등급 :([^<]*)<\/td>/)),
    treadwear: clean(m1(html, /트레드웨어 :([^<]*?)<span/)),
    priceRange: clean(m1(html, /가격대 :([^<]*?)원 까지/)),
    scores,
    reviewScore: clean(m1(html, /리뷰평점<\/b> : <b>([^<]*)<\/b> 점/)),
    strongPoint: clean(m1(html, /주장점 : <b>([^<]*)<\/b>/)),
    typeLevel: clean(m1(html, /<td height="25" width="174"[^>]*>\s*([^<]*)<\/span>/)),
    contentHtml: content ? content[1].trim() : "",
  };
}

/** 외부(타 도메인) 이미지 URL → 로컬 /ext/<host>/<path> 경로 */
export function externalToLocal(url: string): string {
  const m = url.match(/^https?:\/\/([^/]+)(\/.*)$/i);
  return m ? `/ext/${m[1]}${m[2]}` : url;
}

/**
 * contentHtml 안의 절대 URL 이미지를 /ext/... 로 치환하고, 내려받아야 할 목록을 돌려준다. (스크립트가 사용)
 */
export function localizeContentImages(t: Tinfo): { tinfo: Tinfo; downloads: { url: string; local: string }[] } {
  const downloads: { url: string; local: string }[] = [];
  const contentHtml = t.contentHtml.replace(/src=["']?(https?:\/\/[^"'\s>]+)["']?/gi, (_all, url: string) => {
    const local = externalToLocal(url);
    downloads.push({ url, local });
    return `src="${local}"`;
  });
  return { tinfo: { ...t, contentHtml }, downloads };
}
