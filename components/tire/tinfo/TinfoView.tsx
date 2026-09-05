import type { Tinfo } from "@/lib/tinfo";

const DOTUM = "돋움, 'Nanum Gothic', sans-serif";

/** 점선 구분선 (원본 508x8 테이블, dotline.gif 배경) */
function DotLine() {
  return (
    <table className="w-[508px]">
      <tbody>
        <tr>
          <td className="h-[8px] w-[508px]" style={{ background: "url(/images/findsize/dotline.gif)" }}></td>
        </tr>
      </tbody>
    </table>
  );
}

/**
 * 타이어 상세 팝업 본문 (원본 /product/tinfo/view.aspx, 766px 폭, 헤더/푸터 없음)
 *
 * 구조
 *  - 21px 상단 여백
 *  - [이미지 194x243 | 31px | 530px 정보]
 *      브랜드(검정 18pt 돋움) + 모델(#0066CC 20pt Arial) / 회색 설명
 *      점선 / 속도등급 · 트레드웨어 · 가격대 / 점선
 *      성능 그래프 8항목 (subgrapicon.gif 폭으로 점수 표현) / 점선 / 리뷰평점 · 주장점
 *  - 이미지 아래 "타입 / 등급"
 *  - 회색 구분바(gubunbg.gif) 아래 상세 내용 HTML
 *
 * @param imagePrefix JSON 에 없어 원본 서버에서 실시간으로 가져온 경우 이미지 경로 앞에 붙일 origin
 */
export default function TinfoView({ tinfo: t, imagePrefix = "" }: { tinfo: Tinfo; imagePrefix?: string }) {
  /* 그래프는 좌/우 2열 × 4행 (DOM 순서대로 2개씩) */
  const scoreRows: Tinfo["scores"][] = [];
  for (let i = 0; i < t.scores.length; i += 2) scoreRows.push(t.scores.slice(i, i + 2));

  return (
    // 원본 팝업 <body topmargin=0 leftmargin=0>, TD 9pt, P 상하 margin 1px
    <div className="self-start text-[9pt] [&_p]:my-[1px] [&_td]:text-[9pt]">
      <div className="h-[21px] w-[711px]"></div>

      <table className="w-[766px]">
        <tbody>
          <tr>
            <td className="h-[199px] w-[200px] text-center align-top">
              <img src={imagePrefix + t.image} width={t.imageWidth} height={t.imageHeight} alt={t.model} className="inline-block" />
            </td>
            <td rowSpan={2} className="h-[293px] w-[31px] text-right align-top">

            </td>
            <td rowSpan={2} className="h-[293px] w-[536px] text-left align-top">
              {/* 브랜드 / 모델 / 설명 */}
              <table className="w-[530px]">
                <tbody>
                  <tr>
                    <td colSpan={2} className="h-[45px] w-[530px] text-left align-top">
                      <span className="text-[18pt] font-bold text-black" style={{ fontFamily: DOTUM }}>
                        {t.brandName}
                      </span>{" "}
                      <span className="text-[20pt] font-bold text-[#0066CC]" style={{ fontFamily: "Arial, sans-serif" }}>
                        {t.model}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="h-[20px] w-[441px] text-left align-top">
                      <span className="text-[#808080]" dangerouslySetInnerHTML={{ __html: t.descHtml }} />
                    </td>
                    <td className="h-[20px] w-[89px] text-left align-top">　</td>
                  </tr>
                  <tr>
                    <td colSpan={2} className="h-[15px] w-[530px]"></td>
                  </tr>
                </tbody>
              </table>

              <DotLine />

              {/* 속도등급 / 트레드웨어 / 가격대 */}
              <table className="w-[507px]">
                <tbody>
                  <tr>
                    <td className="h-[22px] w-[109px] text-left align-middle">속도등급 : {t.speedRating}</td>
                    <td className="h-[22px] w-[164px] text-center align-middle">
                      트레드웨어 : {t.treadwear} <span className="text-[8pt]">(평균)</span>
                    </td>
                    <td className="h-[22px] w-[234px] text-center align-middle">가격대 : {t.priceRange}원 까지</td>
                  </tr>
                </tbody>
              </table>

              <DotLine />

              {/* 타이어 점수 */}
              <table className="w-[507px]">
                <tbody>
                  <tr>
                    <td colSpan={4} className="h-[10px] w-[507px]"></td>
                  </tr>
                  {scoreRows.map((row, ri) => (
                    <tr key={ri}>
                      {row.map((s, ci) => (
                        <ScoreCell key={s.label} score={s} left={ci === 0} rowHeight={ri === 0 ? 21 : 22} />
                      ))}
                    </tr>
                  ))}
                  <tr>
                    <td colSpan={4} className="h-[10px] w-[507px]"></td>
                  </tr>
                  <tr>
                    <td colSpan={4} className="h-[10px] w-[507px]" style={{ background: "url(/images/findsize/dotline.gif)" }}></td>
                  </tr>
                  <tr>
                    <td colSpan={2} className="h-[28px] w-[215px] text-left align-middle">
                      <b>&nbsp;리뷰평점</b> : <b>{t.reviewScore}</b> 점
                    </td>
                    <td colSpan={2} className="h-[28px] w-[292px] text-left align-middle">
                      {t.strongPoint && (
                        <>
                          주장점 : <b>{t.strongPoint}</b>
                        </>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
          <tr>
            {/* 이미지 아래 타입 / 등급 */}
            <td className="h-[39px] w-[200px] text-center">
              <table className="w-[174px] mx-auto">
                <tbody>
                  <tr>
                    <td className="h-[25px] w-[174px] text-center align-middle">{t.typeLevel}</td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>

      <div className="h-[21px] w-[366px]"></div>

      {/* 회색 구분바 */}
      <table className="w-[766px]">
        <tbody>
          <tr>
            <td className="h-[17px] w-[766px]" style={{ background: "url(/images/findsize/view/gubunbg.gif)" }}></td>
          </tr>
        </tbody>
      </table>

      {/* 상세 내용 (원본 HTML 그대로: 주로 <CENTER><IMG width=670>) */}
      <table className="w-[766px]">
        <tbody>
          <tr>
            <td className="h-[21px] w-[766px] text-left [&_center]:text-center [&_img]:inline-block" dangerouslySetInnerHTML={{ __html: t.contentHtml }} />
          </tr>
        </tbody>
      </table>
    </div>
  );
}

/** 점수 한 항목: 라벨(우측정렬 8pt 돋움) + subgrapicon.gif 막대 (좌열 68/147px, 우열 76/216px) */
function ScoreCell({ score, left, rowHeight }: { score: Tinfo["scores"][number]; left: boolean; rowHeight: number }) {
  // 행 높이는 원본대로 1행 21px, 나머지 22px (동적 값이므로 Tailwind 클래스 대신 inline style)
  const h = { height: rowHeight };
  return (
    <>
      <td style={h} className={`${left ? "w-[68px]" : "w-[76px]"} text-right align-middle`}>
        <span className="text-[8pt]" style={{ fontFamily: DOTUM }}>
          {left ? "" : " "}
          {score.label}&nbsp;&nbsp;{" "}
        </span>
      </td>
      <td style={h} className={`${left ? "w-[147px]" : "w-[216px]"} align-middle`}>
        <img src="/images/subgrapicon.gif" width={score.width} height={score.height} alt="" className="inline-block align-middle" />
      </td>
    </>
  );
}
