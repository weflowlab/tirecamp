/* 문의 1건 (data/inquiries.json) — 관리자 페이지의 "문의 관리" 데이터 원본 */
export type Inquiry = {
  id: number;
  name: string;
  phone: string;
  /** 문의 유형 */
  type: (typeof INQUIRY_TYPES)[number];
  /** 차종 / 타이어 사이즈 (선택) */
  car: string;
  content: string;
  date: string;
  createdAt: string;
  /** 관리자 처리 상태 (관리자 페이지에서 갱신) */
  status: "new" | "done";
  /** 관리자 메모 (처리 내용 등, 관리자 페이지에서만 입력) */
  memo?: string;
};

export const INQUIRY_TYPES = ["타이어 견적", "교체 예약", "중고 타이어", "기타"] as const;

export const INQUIRIES_FILE = "inquiries";
