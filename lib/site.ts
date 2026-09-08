/**
 * 타이어캠프 사업자/연락처 정보 (고객 구글폼 15번 기준)
 * 헤더/푸터/회사소개/문의하기/개인정보처리방침 등에서 공통으로 사용한다.
 */
export const SITE = {
  name: "타이어캠프",
  nameEn: "TIRE CAMP",
  slogan: "타이어의 모든 것을 한 곳에서",
  ceo: "안대근",
  bizNo: "127-42-28545",
  address: "경기 양주시 화합로 1579",
  phone: "031-857-8255",
  email: "asroma3@hanmail.net",
  /** 지도 좌표 (기존 ok114 페이지 등록 좌표) */
  lat: 37.8390592542,
  lng: 127.0817704717,
  /** 영업시간 (구글폼 기준) */
  hours: [
    { label: "평일", value: "오전 9시 ~ 오후 7시" },
    { label: "토요일", value: "오전 9시 ~ 오후 6시" },
    { label: "일요일", value: "휴무" },
  ],
  /** SNS/채널 링크 — URL 이 비어 있으면 화면에 노출하지 않는다 (고객에게 확인 필요) */
  sns: {
    kakao: "",
    instagram: "",
    blog: "",
  },
} as const;

/** 전화 링크 (tel:) 용 숫자만 */
export const PHONE_TEL = `tel:${SITE.phone.replace(/-/g, "")}`;

/** 브라우저 탭 제목 접미사 */
export const TITLE_SUFFIX = `${SITE.name} - 양주 타이어 전문점`;

export function pageTitle(prefix: string): string {
  return `${prefix} | ${TITLE_SUFFIX}`;
}

/** 길찾기 링크 */
export const MAP_LINKS = {
  naver: `https://map.naver.com/v5/search/${encodeURIComponent(`${SITE.name} ${SITE.address}`)}`,
  kakao: `https://map.kakao.com/link/to/${encodeURIComponent(SITE.name)},${SITE.lat},${SITE.lng}`,
  /** 구글 지도 임베드 (API 키 불필요) */
  embed: `https://maps.google.com/maps?q=${SITE.lat},${SITE.lng}&z=16&hl=ko&output=embed`,
} as const;
