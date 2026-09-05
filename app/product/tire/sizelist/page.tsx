import type { Metadata } from "next";
import { getSizeList, parseSizeListQuery } from "@/lib/sizelist";
import SizeListFilter from "@/components/tire/sizelist/SizeListFilter";
import SizeListTabs from "@/components/tire/sizelist/SizeListTabs";
import TireCard from "@/components/tire/sizelist/TireCard";
import SizeListPagination from "@/components/tire/sizelist/SizeListPagination";

/* 원본 <title>: "2254518 타이어가격 | 타이어공장 - 전브랜드 인터넷가 판매" */
export async function generateMetadata({ searchParams }: PageProps<"/product/tire/sizelist">): Promise<Metadata> {
  const q = parseSizeListQuery(await searchParams);
  return { title: `${q.ftsize} 타이어가격 | 타이어공장 - 전브랜드 인터넷가 판매` };
}

/* 빈 줄 여백 테이블 (원본의 spacer table 패턴) */
function Spacer({ w, h }: { w: number; h: number }) {
  return (
    <table border={0} width={w} style={{ height: h }} cellSpacing={0} cellPadding={0}>
      <tbody>
        <tr>
          <td height={h} width={w}></td>
        </tr>
      </tbody>
    </table>
  );
}

/**
 * 타이어 사이즈 검색 결과 페이지 (원본 /product/tire/sizelist.aspx)
 * URL query(find_ftsize, find_rtsize, seltireg, sorttireop, brandop, spage, lpage) 가 원본 form 필드 역할.
 * 서버 컴포넌트: query → 정적 데이터 조회(lib/sizelist.ts, data/sizelist/*.json) → 카드 목록 렌더. 네트워크 호출 없음.
 */
export default async function SizeListPage({ searchParams }: PageProps<"/product/tire/sizelist">) {
  const query = parseSizeListQuery(await searchParams);
  const result = await getSizeList(query);

  return (
    <>
      <table border={0} width={900} style={{ height: 10 }} cellSpacing={0} cellPadding={0}>
        <tbody>
          {/* 타이틀 행: tirelisttitle.gif + orderproc.gif 배경 */}
          <tr>
            <td height={53} width={900} align="right" valign="top">
              <table border={0} width={900} style={{ height: 64 }} cellSpacing={0} cellPadding={0}>
                <tbody>
                  <tr>
                    <td height={64} width={194} align="left">
                      <img src="/images/findsize/carfind/tirelisttitle.gif" alt="타이어 리스트" width={183} height={52} style={{ border: 0 }} />
                    </td>
                    <td height={64} width={12} align="center" valign="middle">　</td>
                    <td
                      height={64}
                      width={694}
                      align="left"
                      style={{ background: "url(/images/findsize/carfind/orderproc.gif)" }}
                    >
                      　
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>

          {/* 회색 필터 박스 (사이즈 재검색 / 정렬 / 제조사) */}
          <tr>
            <td height={10} width={900} align="center">
              <Spacer w={50} h={5} />
              <SizeListFilter query={query} />
              <Spacer w={50} h={15} />
            </td>
          </tr>

          {/* 탭 + 결과 카드 목록 */}
          <tr>
            <td height={10} width={900} align="center" valign="top">
              <SizeListTabs query={query} total={result.total} />
              <Spacer w={50} h={5} />
              {/* 베스트 타이어 (주황 테두리) 이후 일반 리스트 — 원본 출력 순서 그대로 */}
              {result.tires.map((t, i) => (
                <TireCard key={`${t.tinfoseq}-${i}`} tire={t} />
              ))}
            </td>
          </tr>
        </tbody>
      </table>

      {/* 페이지 번호 (2페이지 이상일 때만) + 하단 20px 여백 */}
      <SizeListPagination query={query} pages={result.pages} />
      <Spacer w={172} h={20} />
    </>
  );
}
