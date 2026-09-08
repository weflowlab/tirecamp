/*
 * 차량검색 데이터 타입 + 순수 헬퍼 — 클라이언트 컴포넌트에서도 import 하므로 node 전용 모듈을 넣지 않는다.
 * (파일/DB 읽기는 lib/carfind.ts)
 */
import { formatSize, normalizeSize } from "@/lib/sizelistQuery";

export type CarName = { code: string; name: string };

/** 차종의 순정 타이어 사이즈 1줄 (원본 getcartsizelist 응답과 같은 형태) */
export type TireSizeRow = {
  frtype: string; // "1": 앞뒤 동일, "2": 앞뒤 다름
  oesize: string; // "1": 순정, 그 외: 옵션 (화면에는 표시하지 않음)
  ftsize: string; // 앞 사이즈 숫자만 (예 2454518)
  rtsize: string; // 뒤 사이즈 숫자만
  ftsizev: string; // 앞 사이즈 표시용 (예 245/45R18)
  rtsizev: string; // 뒤 사이즈 표시용
};

export type SizeListResult = { carimg: string | null; sizes: TireSizeRow[] };

/**
 * 관리자가 고친 내용 1건 (제조사·연식·차종 단위). 수집한 원본 위에 덮어씌운다.
 * - name / carimg / sizes 는 있는 항목만 덮어쓴다 (undefined = 원본 그대로)
 * - carimg "" = 사진 없음으로 처리
 * - hidden = 사이트에서 숨김, added = 관리자가 새로 등록한 차종 (원본에 없음)
 */
export type CarOverride = {
  id: string; // `${maker}-${year}-${code}`
  maker: string;
  year: string;
  code: string;
  name?: string;
  carimg?: string;
  sizes?: TireSizeRow[];
  hidden?: boolean;
  added?: boolean;
  updatedAt: string;
};

export const CAR_OVERRIDES_FILE = "carOverrides";

/** 관리자 목록 한 줄 (원본 + 수정 내용을 합친 결과) */
export type AdminCar = {
  code: string;
  name: string;
  hidden: boolean;
  added: boolean;
  /** 사진 파일이 실제로 있는지 */
  hasPhoto: boolean;
  /** 이름·사진·사이즈 중 하나라도 관리자가 고쳤는지 */
  edited: boolean;
  sizeCount: number;
};

/** 관리자 편집 화면용 사이즈 입력 행 */
export type SizeDraft = { front: string; rear: string };

/** 입력 행 → 저장 형태. 사이즈 형식이 틀리면 null */
export function toSizeRow(d: SizeDraft): TireSizeRow | null {
  const f = normalizeSize(d.front);
  const r = normalizeSize(d.rear) || f;
  if (!/^\d{7}$/.test(f) || !/^\d{7}$/.test(r)) return null;
  return { frtype: f === r ? "1" : "2", oesize: "1", ftsize: f, rtsize: r, ftsizev: formatSize(f), rtsizev: formatSize(r) };
}

export function toSizeDraft(r: TireSizeRow): SizeDraft {
  return { front: r.ftsizev, rear: r.frtype === "2" ? r.rtsizev : "" };
}
