import CsSideMenu from "@/components/cscenter/CsSideMenu";

/**
 * 고객센터(/cscenter/*) 공통 2단 프레임
 * - 원본: <table width=900> 좌측 201px (cstitle.gif + 서브메뉴 + rline.gif) / 우측 699px (각 페이지 내용, 가운데 정렬)
 * - 우측 내용은 각 page.tsx 가 렌더링
 */
export default function CsCenterLayout({ children }: LayoutProps<"/cscenter">) {
  return (
    <table style={{ width: 900, minHeight: 479 }}>
      <tbody>
        <tr>
          {/* 좌측: 고객센터 타이틀 + 서브메뉴 */}
          <td style={{ width: 201, verticalAlign: "top", textAlign: "left" }}>
            <table style={{ width: 195, height: 469 }}>
              <tbody>
                <tr>
                  <td style={{ width: 193, verticalAlign: "top", textAlign: "left" }}>
                    <table style={{ width: 193 }}>
                      <tbody>
                        <tr>
                          <td style={{ height: 93, textAlign: "center" }}>
                            <img src="/images/cscenter/cstitle.gif" width={193} height={93} alt="고객센터" className="inline" />
                          </td>
                        </tr>
                        <tr>
                          <td style={{ height: 15 }} />
                        </tr>
                        <tr>
                          <td style={{ height: 265, verticalAlign: "top" }}>
                            <div className="flex justify-end">
                              <CsSideMenu />
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                  {/* 세로 구분선 rline.gif (2x412) */}
                  <td style={{ width: 2, verticalAlign: "top", textAlign: "left" }}>
                    <img src="/images/cscenter/rline.gif" width={2} height={412} alt="" />
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
          {/* 우측: 페이지별 내용 (원본 align=center valign=top) */}
          <td style={{ width: 699, verticalAlign: "top", textAlign: "center" }}>
            <div className="inline-block text-left">{children}</div>
          </td>
        </tr>
      </tbody>
    </table>
  );
}
