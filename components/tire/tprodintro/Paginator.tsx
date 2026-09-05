"use client";

/**
 * 페이지 번호 (원본 900x41 테이블, MovePage(spage,lpage))
 * - 현재 페이지: Arial #3366CC 15pt bold
 * - 나머지: Arial #808080 14pt
 * - 각 번호 뒤 &nbsp;
 */
export default function Paginator({
  page,
  totalPages,
  onMove,
}: {
  page: number;
  totalPages: number;
  onMove: (p: number) => void;
}) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  return (
    <table className="w-[900px]">
      <tbody>
        <tr>
          <td className="h-[41px] w-[900px] text-center">
            {pages.map((p) => (
              <span key={p}>
                <a
                  href={`?page=${p}`}
                  onClick={(e) => {
                    e.preventDefault();
                    onMove(p);
                  }}
                  className="hover:no-underline"
                  style={{ fontFamily: "Arial, sans-serif", color: p === page ? "#3366CC" : "#808080" }}
                >
                  <span style={p === page ? { fontSize: "15pt", fontWeight: 700 } : { fontSize: "14pt" }}>{p}</span>
                </a>
                &nbsp;
              </span>
            ))}
          </td>
        </tr>
      </tbody>
    </table>
  );
}
