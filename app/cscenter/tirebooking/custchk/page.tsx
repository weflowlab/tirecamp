import type { Metadata } from "next";
import BookingCheckForm from "@/components/cscenter/BookingCheckForm";

export const metadata: Metadata = {
  title: "예약확인 | 타이어공장 - 전브랜드 인터넷가 판매",
};

/**
 * 타이어 예약확인 (원본 /cscenter/tirebooking/custchk.aspx)
 * - tirebookingtitle.gif 타이틀 + 예약 조회 폼(BookingCheckForm)
 */
export default function BookingCheckPage() {
  return (
    <div className="w-[632px] max-pc:w-full">
      {/* 타이틀 */}
      <table style={{ width: 629, height: 70 }} className="m-fluid">
        <tbody>
          <tr>
            <td style={{ height: 70, width: 410, textAlign: "left" }}>
              <img src="/images/cscenter/tirebookingtitle.gif" width={244} height={53} alt="타이어 예약확인" />
            </td>
            <td style={{ height: 70, width: 219, textAlign: "right", verticalAlign: "bottom" }} className="max-pc:hidden">　</td>
          </tr>
        </tbody>
      </table>

      <BookingCheckForm />
    </div>
  );
}
