/*
 * 레이어 팝업 1건 (data/popups.json) — 관리자 "팝업창 관리" 에서 등록, 홈 진입 시 노출
 * (클라이언트 컴포넌트에서도 import 하므로 node 전용 모듈을 넣지 않는다)
 */
export type Popup = {
  id: number;
  title: string;
  /** 노출 시작일 YYYY-MM-DD */
  start: string;
  /** 노출 종료일 YYYY-MM-DD (당일 포함) */
  end: string;
  /** 클릭 시 이동 URL (없으면 "") */
  linkUrl: string;
  newWindow: boolean;
  /** "오늘 하루 열지 않기" 버튼 표시 */
  hideToday: boolean;
  /** PC 이미지 경로 (필수) */
  pcImage: string;
  /** 모바일 이미지 경로 (없으면 PC 이미지 사용) */
  mobImage: string;
  /** 관리자가 잠시 끄기 */
  enabled: boolean;
  /** 노출 위치: 홈만 / 전체 페이지 */
  scope: "home" | "all";
  createdAt: string;
};

export const POPUPS_FILE = "popups";

export type PopupState = "active" | "waiting" | "ended" | "off";

/** 오늘(YYYY-MM-DD) 기준 노출 상태 */
export function popupState(p: Popup, today: string): PopupState {
  if (!p.enabled) return "off";
  if (today < p.start) return "waiting";
  if (today > p.end) return "ended";
  return "active";
}

export const POPUP_STATE_LABEL: Record<PopupState, string> = {
  active: "노출 중",
  waiting: "대기",
  ended: "종료",
  off: "꺼짐",
};
