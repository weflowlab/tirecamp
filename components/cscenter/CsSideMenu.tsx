"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/* 고객센터 좌측 서브메뉴 항목 (원본은 "자주 묻는 질문"(tfaq) 항목이 주석 처리되어 노출되지 않음) */
const ITEMS = [
  { href: "/cscenter/news", label: "소식 & 공지사항", match: "/cscenter/news" },
  { href: "/cscenter/tirebooking/custchk", label: "타이어 예약확인", match: "/cscenter/tirebooking" },
];

/**
 * 고객센터 공통 좌측 메뉴 박스 (158x31, 2px 테두리)
 * - 현재 페이지: bgcolor #c44b1c + 흰 글씨 / 그 외: #E3E3E3 테두리
 * - personal_info, tfaq 등은 어느 항목도 활성화되지 않음 (원본과 동일)
 */
export default function CsSideMenu() {
  const pathname = usePathname();

  return (
    /* 모바일: 각 행(tr)이 flex 가 되어 메뉴 박스가 가로로 나란히 (tbody 도 flex 로 묶음) */
    <table style={{ width: 180 }} className="m-wrap max-pc:[&>tbody]:flex max-pc:[&>tbody]:flex-wrap max-pc:[&>tbody]:gap-[8px]">
      <tbody>
        {ITEMS.map((item, i) => {
          const active = pathname.startsWith(item.match);
          return (
            <tr key={item.href}>
              <td style={{ height: i === 0 ? 45 : 55, width: 170, verticalAlign: i === 0 ? "middle" : "bottom" }}>
                {/* 항목 사이 10px 간격은 두 번째 행 높이(45+10)로 처리 */}
                <table
                  style={{
                    width: 158,
                    height: 31,
                    border: `2px solid ${active ? "#c44b1c" : "#E3E3E3"}`,
                    backgroundColor: active ? "#c44b1c" : undefined,
                  }}
                >
                  <tbody>
                    <tr>
                      <td style={{ height: 27 }}>
                        <span
                          style={{
                            fontFamily: "돋움, 'Nanum Gothic', sans-serif",
                            fontSize: "11pt",
                            fontWeight: 700,
                          }}
                        >
                          &nbsp;
                          <span style={{ letterSpacing: "-1pt" }}>
                            <Link href={item.href} style={active ? { color: "#FFFFFF" } : undefined}>
                              {item.label}
                            </Link>
                          </span>
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
