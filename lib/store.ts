import fs from "node:fs/promises";
import path from "node:path";

/**
 * data/*.json 을 목록 저장소로 쓰는 간단한 파일 스토어 (후기/문의 접수용)
 * - 관리자 페이지/DB 가 붙기 전까지의 임시 저장소. 서버 파일시스템에 쓰므로
 *   읽기 전용 파일시스템(Vercel 등)에서는 동작하지 않는다 → 그 경우 DB 로 교체.
 */
const DATA_DIR = path.join(process.cwd(), "data");

function fileOf(name: string) {
  return path.join(DATA_DIR, `${name}.json`);
}

export async function readList<T>(name: string): Promise<T[]> {
  try {
    const raw = await fs.readFile(fileOf(name), "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

export async function appendItem<T>(name: string, item: T): Promise<void> {
  const list = await readList<T>(name);
  list.push(item);
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(fileOf(name), JSON.stringify(list, null, 2) + "\n", "utf8");
}

/** 오늘 날짜 "YYYY.MM.DD" (한국 시간) */
export function todayKST(): string {
  const d = new Date(Date.now() + 9 * 60 * 60 * 1000);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}.${m}.${day}`;
}

/** 문자열 정리: 공백 트림 + 최대 길이 */
export function clean(v: unknown, max: number): string {
  return String(v ?? "")
    .replace(/\r\n/g, "\n")
    .trim()
    .slice(0, max);
}
