/**
 * 타이어 상세 팝업 열기 — 원본 comfuc.js 의 tireinfowin(tinfokey) 와 동일
 *
 * 795x675 크기의 새 창("tireinfopagewin")을 화면 중앙에 띄운다.
 * 목록 카드, 사이즈 검색 결과 등 여러 페이지에서 공용으로 사용.
 */
export function openTireInfo(seq: string | number): void {
  const w = 795;
  const h = 675;
  const winl = (screen.width - w) / 2;
  const wint = (screen.height - h) / 2;

  window.open(
    "/product/tinfo/view?tinfoseq=" + seq,
    "tireinfopagewin",
    "toolbar=no,directories=no,status=no,menubar=no,location=no,scrollbars=yes,resizable=no,width=" +
      w +
      ",height=" +
      h +
      ",left=" +
      winl +
      ",top=" +
      wint,
  );
}
