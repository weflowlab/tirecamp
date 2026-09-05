import FindTireBox from "@/components/tire/FindTireBox";

/* 메인 하단 배너 이미지 목록 (원본 순서/크기 그대로, 900px 폭) */
const BANNERS: { src: string; height: number; padY?: number }[] = [
  { src: "/jwtsm_comimg/tirekong2000/20260814063506387656.jpg", height: 548 },
  { src: "/jwtsm_comimg/tirekong2000/20260814063556230122.jpg", height: 650 },
  { src: "/jwtsm_comimg/tirekong2000/20260520084704719861.jpg", height: 300 },
  { src: "/jwtsm_comimg/tirekong2000/20260520085410349645.jpg", height: 300 },
  // 원본: 이 배너만 td height=322 안에 300px 이미지 → 위아래 11px 여백
  { src: "/jwtsm_comimg/tirekong2000/2026052008573233205.jpg", height: 300, padY: 11 },
  { src: "/jwtsm_comimg/tirekong2000/20260520090254148394.jpg", height: 52 },
];

/**
 * 메인 페이지 (/) — 원본 default.aspx 본문
 * 타이틀 이미지 → 검색 박스(차량/사이즈검색) → aibtbar 바 → 배너 6장
 * (본문 폭은 SiteChrome 의 <main> 이 900px / 모바일 100% 로 잡아 주므로 여기서는 w-full)
 */
export default function HomePage() {
  return (
    <div className="w-full">
      {/* 상단 타이틀 이미지 (900x190) */}
      <div className="w-full flex items-end">
        <img src="/jwtsm_comimg/tirekong2000/20260520053048712166.png" alt="" width={900} height={190} />
      </div>

      {/* 차량검색 + 사이즈검색 박스 */}
      <FindTireBox variant="home" />

      {/* 박스 아래 바 이미지 (원본 aibtbar.gif 배경 10px) */}
      <div className="w-full h-[10px]" style={{ backgroundImage: "url(/images/main/aibtbar.gif)" }} />
      {/* 10px 여백 */}
      <div className="h-[10px]" />

      {/* 메인 배너 이미지 6장 */}
      {BANNERS.map((b) => (
        <div key={b.src} className="w-full" style={b.padY ? { paddingTop: b.padY, paddingBottom: b.padY } : undefined}>
          <img src={b.src} alt="" width={900} height={b.height} className="block" />
        </div>
      ))}
    </div>
  );
}
