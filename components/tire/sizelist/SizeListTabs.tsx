import Link from "next/link";
import { buildSizeListHref, type SizeListQuery } from "@/lib/sizelistQuery";

/* 탭 이미지 (원본 /images/findsize/tab/*.gif, 선택 시 *_select.gif) — tiregpost(g) 의 g 값 */
const TABS: { g: string; img: string; w: number; tdw: number }[] = [
  { g: "all", img: "all", w: 79, tdw: 79 },
  { g: "main", img: "best", w: 79, tdw: 79 },
  { g: "10", img: "primium", w: 79, tdw: 79 },
  { g: "15", img: "top", w: 79, tdw: 79 },
  { g: "20", img: "mtop", w: 79, tdw: 79 },
  { g: "25", img: "econo", w: 79, tdw: 95 },
];

type Props = { query: SizeListQuery; total: number };

/**
 * 타이어 구분 탭 행 (전체/베스트/프리미엄/고급/중급/실속 | 스노우) + "총 : N 개"
 * 원본 tiregpost(g): 제조사 체크를 전체로 리셋하고 seltireg 변경, 페이지 리셋 (정렬은 유지)
 */
export default function SizeListTabs({ query, total }: Props) {
  const href = (g: string) => buildSizeListHref({ ...query, seltireg: g, brandop: [], spage: 1, lpage: 1 });
  const src = (img: string, g: string) => `/images/findsize/tab/${img}${query.seltireg === g ? "_select" : ""}.gif`;

  return (
    /* 모바일(.m-wrap): 탭 이미지들이 화면 폭에 맞춰 줄바꿈, "총 : N 개" 는 오른쪽 끝으로 */
    <table border={0} width={900} style={{ height: 5 }} cellSpacing={0} cellPadding={0} className="m-wrap">
      <tbody>
        <tr>
          {TABS.map((t) => (
            <td key={t.g} height={18} width={t.tdw} className="max-pc:pb-[4px]">
              <Link href={href(t.g)}>
                <img src={src(t.img, t.g)} alt="" width={t.w} height={26} style={{ border: 0 }} />
              </Link>
            </td>
          ))}
          <td height={18} width={13} className="max-pc:hidden"></td>
          <td height={18} width={81} className="max-pc:pb-[4px]">
            <Link href={href("snow")}>
              <img src={src("snow", "snow")} alt="" width={81} height={26} style={{ border: 0 }} />
            </Link>
          </td>
          <td height={18} width={191} align="center" className="max-pc:hidden"></td>
          <td height={18} width={125} align="center" className="max-pc:ml-auto max-pc:pb-[4px]">
            총 : {total} 개
          </td>
        </tr>
        <tr>
          {/* 2px 회색 밑줄 (모바일에서는 셀 높이가 0 이 되므로 border 로 표현) */}
          <td height={2} width={675} style={{ backgroundColor: "#DDDDDD" }} colSpan={10} className="max-pc:basis-full max-pc:border-t-2 max-pc:border-[#DDDDDD]"></td>
        </tr>
      </tbody>
    </table>
  );
}
