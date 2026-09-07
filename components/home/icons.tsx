import type { ReactNode } from "react";

/**
 * 홈 섹션용 일러스트 아이콘 (64px 그리드, 96px 로 표시)
 * - 잉크색 선 + 연회색 면으로 "딱 보면 무엇인지" 알 수 있게 그림
 */
const P = { width: 96, height: 96, viewBox: "0 0 64 64", fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round" } as const;
const FILL = "#EFEFED"; // 면 색 (surface 보다 살짝 진하게)

/* 정면 타이어: 바깥 원 + 트레드 눈금 + 림 + 스포크 */
function TireFace({ cx, cy, r, spokes = 5 }: { cx: number; cy: number; r: number; spokes?: number }) {
  const ticks = [];
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    const r1 = r - 1.5;
    const r2 = r - 5;
    ticks.push(<line key={i} x1={cx + Math.cos(a) * r1} y1={cy + Math.sin(a) * r1} x2={cx + Math.cos(a) * r2} y2={cy + Math.sin(a) * r2} strokeWidth="1.2" />);
  }
  const sp = [];
  for (let i = 0; i < spokes; i++) {
    const a = (i / spokes) * Math.PI * 2 - Math.PI / 2;
    sp.push(<line key={i} x1={cx + Math.cos(a) * 3} y1={cy + Math.sin(a) * 3} x2={cx + Math.cos(a) * (r * 0.5)} y2={cy + Math.sin(a) * (r * 0.5)} />);
  }
  return (
    <>
      <circle cx={cx} cy={cy} r={r} fill={FILL} />
      {ticks}
      <circle cx={cx} cy={cy} r={r * 0.62} fill="#fff" />
      <circle cx={cx} cy={cy} r={r * 0.52} />
      {sp}
      <circle cx={cx} cy={cy} r={3} fill={FILL} />
    </>
  );
}

/* 옆으로 눕힌 타이어 한 층 (스택용) */
function TireLayer({ cy, top }: { cy: number; top?: boolean }) {
  return (
    <>
      <path d={`M12 ${cy} v9 a20 7 0 0 0 40 0 v-9`} fill={FILL} />
      {[16, 20, 24, 28, 32, 36, 40, 44, 48].map((x) => (
        <line key={x} x1={x} y1={cy + 3} x2={x} y2={cy + 8} strokeWidth="1.2" />
      ))}
      <ellipse cx="32" cy={cy} rx="20" ry="7" fill={top ? "#fff" : FILL} />
      {top && (
        <>
          <ellipse cx="32" cy={cy} rx="9" ry="3.2" fill={FILL} />
          <line x1="12" y1={cy} x2="52" y2={cy} strokeOpacity="0" />
        </>
      )}
    </>
  );
}

export const HOME_ICONS: Record<string, ReactNode> = {
  /* 브랜드 비교 견적: 타이어 위에 돋보기 */
  compare: (
    <svg {...P}>
      {/* 렌즈 안에 타이어, 렌즈와 타이어 사이 여백을 두어 돋보기로 읽히게 */}
      <circle cx="27" cy="27" r="21" fill="#fff" strokeWidth="2.4" />
      <TireFace cx={27} cy={27} r={14} />
      <path d="M13 20a15 15 0 0 1 7-7" strokeWidth="1.2" strokeOpacity="0.5" />
      <line x1="43" y1="43" x2="58" y2="58" strokeWidth="5.5" />
    </svg>
  ),
  /* 대량재고 보유: 창고 + 선반 + 타이어 */
  warehouse: (
    <svg {...P}>
      {/* 창고 건물: 지붕 + 벽, 안쪽 선반 두 단에 타이어 */}
      <path d="M4 27 32 6l28 21" strokeWidth="2" />
      <path d="M10 27v31h44V27" fill={FILL} />
      <path d="M16 31h32v27H16z" fill="#fff" />
      <path d="M16 43h32M16 55h32" />
      {[22, 32, 42].map((x) => (
        <g key={x}>
          <circle cx={x} cy="38.5" r="4.2" fill={FILL} />
          <circle cx={x} cy="38.5" r="1.6" fill="#fff" />
          <circle cx={x} cy="50.5" r="4.2" fill={FILL} />
          <circle cx={x} cy="50.5" r="1.6" fill="#fff" />
        </g>
      ))}
      <path d="M6 58h52" strokeWidth="2" />
    </svg>
  ),
  /* 빠른 출고·장착: 트럭 + 속도선 */
  truck: (
    <svg {...P}>
      {/* 오른쪽으로 달리는 탑차 + 왼쪽 속도선 */}
      <path d="M3 25h8M5 33h6M3 41h8" strokeWidth="2.4" />
      <rect x="15" y="18" width="26" height="27" rx="1.5" fill={FILL} />
      <path d="M41 27h10l8 9v9H41z" fill="#fff" />
      <path d="M43 30h7l5 6H43z" fill={FILL} />
      <path d="M15 45h44" />
      <circle cx="24" cy="48.5" r="5.5" fill="#fff" />
      <circle cx="24" cy="48.5" r="2" fill={FILL} />
      <circle cx="50" cy="48.5" r="5.5" fill="#fff" />
      <circle cx="50" cy="48.5" r="2" fill={FILL} />
    </svg>
  ),
  /* 신품·이월·중고: 타이어 3단 */
  stack: (
    <svg {...P}>
      <TireLayer cy={44} />
      <TireLayer cy={31} />
      <TireLayer cy={18} top />
    </svg>
  ),
  /* 다양한 규격: 타이어 + 자 */
  ruler: (
    <svg {...P}>
      <TireFace cx={24} cy={34} r={20} />
      <rect x="50" y="8" width="8" height="48" fill={FILL} />
      {[12, 16, 20, 24, 28, 32, 36, 40, 44, 48, 52].map((y, i) => (
        <line key={y} x1="50" y1={y} x2={i % 2 === 0 ? 56 : 53.5} y2={y} />
      ))}
    </svg>
  ),
  /* 합리적 가격: 가격표 태그 + 반짝임 */
  tag: (
    <svg {...P}>
      {/* 가격표 태그 + % 표시 + 반짝임 */}
      <path d="M9 35 36 8h19v19L28 54z" fill={FILL} />
      <circle cx="47" cy="16" r="3" fill="#fff" />
      <circle cx="25" cy="31" r="2" fill="#fff" strokeWidth="1.3" />
      <circle cx="32" cy="38" r="2" fill="#fff" strokeWidth="1.3" />
      <path d="M33.5 29.5 23.5 39.5" strokeWidth="1.4" />
      <path d="M10 8v10M5 13h10" strokeWidth="1.6" />
      <path d="M54 50v8M50 54h8" strokeWidth="1.6" />
    </svg>
  ),
  /* 신품 타이어: 정면 타이어 하나 */
  tireNew: (
    <svg {...P}>
      <TireFace cx={32} cy={32} r={24} />
    </svg>
  ),
  /* 이월 타이어: 2단 + 시계 */
  tireCarry: (
    <svg {...P}>
      <TireLayer cy={40} />
      <TireLayer cy={27} top />
      <circle cx="50" cy="15" r="9" fill="#fff" />
      <path d="M50 10v5l3 2" />
    </svg>
  ),
  /* 중고 타이어: 2단 + 선별 체크 */
  tireUsed: (
    <svg {...P}>
      <TireLayer cy={40} />
      <TireLayer cy={27} top />
      <circle cx="50" cy="15" r="9" fill="#fff" />
      <path d="m45.5 15.5 3 3 6-6" strokeWidth="2" />
    </svg>
  ),
  /* SUV / 4x4: 굵은 트레드의 휠 */
  suv: (
    <svg {...P}>
      <circle cx="32" cy="32" r="25" fill={FILL} />
      {Array.from({ length: 16 }).map((_, i) => {
        const a = (i / 16) * Math.PI * 2;
        return <line key={i} x1={32 + Math.cos(a) * 24} y1={32 + Math.sin(a) * 24} x2={32 + Math.cos(a) * 18} y2={32 + Math.sin(a) * 18} strokeWidth="2.4" />;
      })}
      <circle cx="32" cy="32" r="15" fill="#fff" />
      {Array.from({ length: 6 }).map((_, i) => {
        const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
        return <path key={i} d={`M${32 + Math.cos(a) * 4} ${32 + Math.sin(a) * 4}L${32 + Math.cos(a) * 13} ${32 + Math.sin(a) * 13}`} strokeWidth="2.6" />;
      })}
      <circle cx="32" cy="32" r="4" fill={FILL} />
    </svg>
  ),
  /* 해피콜: 수화기 + 벨 울림 */
  phone: (
    <svg {...P}>
      <path d="M14 10h9l4 10-5 4a24 24 0 0 0 14 14l4-5 10 4v9a4 4 0 0 1-4 4C24 50 14 40 14 14a4 4 0 0 1 0-4Z" fill={FILL} />
      <path d="M38 12a14 14 0 0 1 14 14M38 5a21 21 0 0 1 21 21" strokeWidth="1.6" />
    </svg>
  ),
  /* 매장 방문: 차양 있는 매장 앞면 */
  store: (
    <svg {...P}>
      <path d="M8 22 13 9h38l5 13" fill="#fff" />
      <path d="M8 22c0 3.5 2.6 6 6 6s6-2.5 6-6c0 3.5 2.6 6 6 6s6-2.5 6-6c0 3.5 2.6 6 6 6s6-2.5 6-6c0 3.5 2.6 6 6 6s6-2.5 6-6" fill={FILL} />
      <path d="M12 28v29h40V28" fill="#fff" />
      <path d="M8 57h48" strokeWidth="2" />
      <rect x="18" y="35" width="11" height="10" fill={FILL} />
      <path d="M36 57V38h10v19" fill={FILL} />
      <circle cx="43.5" cy="48" r="1" fill="currentColor" />
    </svg>
  ),
  /* 장착·결제: 카드 */
  card: (
    <svg {...P}>
      <rect x="6" y="16" width="52" height="34" rx="3" fill="#fff" />
      <rect x="6" y="23" width="52" height="7" fill={FILL} stroke="none" />
      <path d="M6 23h52M6 30h52" />
      <rect x="12" y="36" width="12" height="6" rx="1" fill={FILL} />
      <path d="M30 42h20" />
      <circle cx="49" cy="12" r="6" fill="#fff" />
      <path d="m46 12 2 2 4-4" strokeWidth="1.8" />
    </svg>
  ),
  /* 장착 예약: 달력 + 체크 */
  calendar: (
    <svg {...P}>
      <rect x="9" y="13" width="46" height="44" rx="3" fill="#fff" />
      <path d="M9 24h46" />
      <rect x="9" y="13" width="46" height="11" rx="3" fill={FILL} />
      <path d="M21 8v10M43 8v10" strokeWidth="2.2" />
      {[18, 28, 38, 48].map((x) =>
        [32, 40].map((y) => <rect key={`${x}${y}`} x={x - 2} y={y - 2} width="4" height="4" fill={FILL} stroke="none" />),
      )}
      <circle cx="44" cy="47" r="8.5" fill="#fff" />
      <path d="m40 47 3 3 5.5-6" strokeWidth="2" />
    </svg>
  ),
};
