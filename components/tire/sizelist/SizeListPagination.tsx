import Link from "next/link";
import { buildSizeListHref, type PageLink, type SizeListQuery } from "@/lib/sizelistQuery";

type Props = { query: SizeListQuery; pages: PageLink[] };

/**
 * 하단 페이지 번호 (원본 MovePage(spage,lpage) 링크)
 *  - 현재 페이지: Arial 15pt bold #3366CC, 나머지: #808080
 *  - 원본은 페이지가 2개 이상일 때만 40px 높이 테이블을 출력
 */
export default function SizeListPagination({ query, pages }: Props) {
  if (pages.length === 0) return null;
  return (
    <>
      <table border={0} width={172} style={{ height: 10 }} cellSpacing={0} cellPadding={0}>
        <tbody>
          <tr>
            <td height={10} width={172}></td>
          </tr>
        </tbody>
      </table>
      <table border={0} width={900} style={{ height: 40 }} cellSpacing={0} cellPadding={0} className="m-fluid">
        <tbody>
          <tr>
            <td height={40} width={900} align="center" className="max-pc:leading-[32px]">
              {pages.map((p) => (
                <span key={`${p.spage}-${p.lpage}`}>
                  <Link href={buildSizeListHref({ ...query, spage: p.spage, lpage: p.lpage })}>
                    <span
                      style={{
                        fontFamily: "Arial",
                        color: p.current ? "#3366CC" : "#808080",
                        fontSize: "15pt",
                        fontWeight: p.current ? 700 : undefined,
                      }}
                    >
                      {p.label}
                    </span>
                  </Link>
                  &nbsp;{" "}
                </span>
              ))}
            </td>
          </tr>
        </tbody>
      </table>
    </>
  );
}
