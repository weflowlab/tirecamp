/**
 * 타이어 상세 열기 — 목록 카드, 사이즈 검색 결과 등에서 공용
 * - 새 창 대신 사이트 전역에 마운트된 TireDetailModal 에 이벤트로 알린다
 */
export function openTireInfo(seq: string | number): void {
  window.dispatchEvent(new CustomEvent("tire:open", { detail: String(seq) }));
}
