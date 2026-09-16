import { SITE, SITE_URL } from "@/lib/site";

/**
 * 업체 정보 구조화 데이터 (JSON-LD, schema.org AutoRepair)
 * - 검색엔진이 "무슨 가게이고, 어디에 있고, 언제 여는지"를 글이 아니라 데이터로 읽게 해 준다.
 *   검색 결과에 영업시간·전화가 같이 나오거나 지도 서비스와 연결되는 데 쓰인다.
 * - 내용은 전부 lib/site.ts 한 곳에서 가져온다 (화면에 보이는 정보와 어긋나지 않도록).
 */

/* "오전 9시 ~ 오후 7시" → { opens: "09:00", closes: "19:00" } (휴무면 null) */
function parseHours(value: string): { opens: string; closes: string } | null {
  const to24 = (ampm: string, hour: number) => {
    if (ampm === "오전") return hour === 12 ? 0 : hour;
    return hour === 12 ? 12 : hour + 12;
  };
  const m = value.match(/(오전|오후)\s*(\d{1,2})시\s*~\s*(오전|오후)\s*(\d{1,2})시/);
  if (!m) return null;
  const pad = (n: number) => String(n).padStart(2, "0");
  return { opens: `${pad(to24(m[1], Number(m[2])))}:00`, closes: `${pad(to24(m[3], Number(m[4])))}:00` };
}

const DAYS: Record<string, string[]> = {
  평일: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
  토요일: ["Saturday"],
  일요일: ["Sunday"],
};

export default function BusinessJsonLd() {
  const openingHoursSpecification = SITE.hours.flatMap((h) => {
    const time = parseHours(h.value);
    const dayOfWeek = DAYS[h.label];
    if (!time || !dayOfWeek) return [];
    return [{ "@type": "OpeningHoursSpecification", dayOfWeek, ...time }];
  });

  const data = {
    "@context": "https://schema.org",
    "@type": "AutoRepair", // 타이어 판매 + 장착이라 정비소 유형이 맞다
    "@id": `${SITE_URL}/#business`,
    name: SITE.name,
    alternateName: SITE.nameEn,
    description: SITE.slogan,
    url: SITE_URL,
    image: `${SITE_URL}/images/og.jpg`,
    telephone: SITE.phone,
    email: SITE.email,
    address: {
      "@type": "PostalAddress",
      addressCountry: "KR",
      addressRegion: "경기도",
      addressLocality: "양주시",
      streetAddress: SITE.address.replace(/^경기\s*양주시\s*/, ""),
    },
    geo: { "@type": "GeoCoordinates", latitude: SITE.lat, longitude: SITE.lng },
    openingHoursSpecification,
    priceRange: "₩₩",
    currenciesAccepted: "KRW",
    paymentAccepted: "현금, 카드",
    areaServed: { "@type": "AdministrativeArea", name: "경기도 양주시" },
    makesOffer: ["신품 타이어", "이월 타이어", "중고 타이어", "타이어 교체", "얼라이먼트", "위치 교환", "휠 밸런스", "펑크 수리", "TPMS"].map((name) => ({
      "@type": "Offer",
      itemOffered: { "@type": "Service", name },
    })),
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
