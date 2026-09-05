import Link from "next/link";

type Props = {
  /** 현재 페이지 (원본 spage) */
  page: number;
  /** 전체 페이지 수 */
  totalPages: number;
  /** 링크 기준 경로 (예: /cscenter/news) */
  basePath: string;
  /** 한 블록에 보여줄 페이지 수 (원본 lpage 블록) */
  blockSize?: number;
};

/**
 * 게시판 페이지 번호 (원본 javascript:MovePage(spage,lpage) 폼 POST 를 링크로 대체)
 * - 원본: <a><b><font face="Arial" color="#008000" size=3>1</font></b></a>&nbsp;
 */
export default function BoardPager({ page, totalPages, basePath, blockSize = 10 }: Props) {
  if (totalPages < 1) return null;
  const lpage = Math.floor((page - 1) / blockSize) + 1;
  const start = (lpage - 1) * blockSize + 1;
  const end = Math.min(start + blockSize - 1, totalPages);
  const pages: number[] = [];
  for (let p = start; p <= end; p++) pages.push(p);

  return (
    <>
      {pages.map((p) => (
        <span key={p}>
          <Link href={`${basePath}?spage=${p}&lpage=${lpage}`}>
            <b
              style={{
                fontFamily: "Arial, sans-serif",
                fontSize: "16px",
                color: p === page ? "#008000" : "#757575",
              }}
            >
              {p}
            </b>
          </Link>
          &nbsp;
        </span>
      ))}
    </>
  );
}
