import fs from "node:fs/promises";
import path from "node:path";
import { ensureSchema, getSql, hasDb } from "@/lib/db";

/**
 * 목록 저장소 (후기/문의/회원/공지/FAQ/팝업)
 * - DATABASE_URL 이 있으면 Neon Postgres 의 documents 테이블 (컬렉션 이름 → JSON 배열)
 *   · 처음 읽을 때 DB 에 행이 없으면 data/<name>.json 내용을 옮겨 심는다 (기존 공지/FAQ 유지)
 * - 없으면 data/*.json 파일 (로컬 개발용). 읽기 전용 호스팅(Vercel 등)에서는 반드시 DB 를 쓴다.
 * - 관리자 페이지의 모든 수정은 writeList/updateItem/removeItem 을 거친다.
 */
const DATA_DIR = path.join(process.cwd(), "data");

function fileOf(name: string) {
  return path.join(DATA_DIR, `${name}.json`);
}

async function readFileList<T>(name: string): Promise<T[]> {
  try {
    const raw = await fs.readFile(fileOf(name), "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

async function writeFileList<T>(name: string, list: T[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(fileOf(name), JSON.stringify(list, null, 2) + "\n", "utf8");
}

export async function readList<T>(name: string): Promise<T[]> {
  if (!hasDb()) return readFileList<T>(name);
  await ensureSchema();
  const sql = getSql();
  const rows = await sql`SELECT data FROM documents WHERE name = ${name}`;
  if (rows.length) return Array.isArray(rows[0].data) ? (rows[0].data as T[]) : [];
  // DB 에 아직 없는 컬렉션 → 파일 내용을 초기값으로 심는다
  const seed = await readFileList<T>(name);
  await sql`INSERT INTO documents (name, data) VALUES (${name}, ${JSON.stringify(seed)}::jsonb) ON CONFLICT (name) DO NOTHING`;
  return seed;
}

export async function writeList<T>(name: string, list: T[]): Promise<void> {
  if (!hasDb()) return writeFileList(name, list);
  await ensureSchema();
  const sql = getSql();
  await sql`INSERT INTO documents (name, data, updated_at) VALUES (${name}, ${JSON.stringify(list)}::jsonb, now())
            ON CONFLICT (name) DO UPDATE SET data = EXCLUDED.data, updated_at = now()`;
}

export async function appendItem<T>(name: string, item: T): Promise<void> {
  const list = await readList<T>(name);
  list.push(item);
  await writeList(name, list);
}

/** 조건에 맞는 항목 1건을 patch 로 갱신. 갱신된 항목을 돌려주고, 없으면 null */
export async function updateItem<T extends object>(name: string, match: (item: T) => boolean, patch: Partial<T>): Promise<T | null> {
  const list = await readList<T>(name);
  const idx = list.findIndex(match);
  if (idx < 0) return null;
  list[idx] = { ...list[idx], ...patch };
  await writeList(name, list);
  return list[idx];
}

/** 조건에 맞는 항목 삭제. 삭제 여부 반환 */
export async function removeItem<T>(name: string, match: (item: T) => boolean): Promise<boolean> {
  const list = await readList<T>(name);
  const next = list.filter((it) => !match(it));
  if (next.length === list.length) return false;
  await writeList(name, next);
  return true;
}

/** 오늘 날짜 "YYYY.MM.DD" (한국 시간) */
export function todayKST(): string {
  return kstDate().replace(/-/g, ".");
}

/** 한국 시간 기준 날짜 "YYYY-MM-DD" (ms 생략 시 현재) */
export function kstDate(ms = Date.now()): string {
  return new Date(ms + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

/** 문자열 정리: 공백 트림 + 최대 길이 */
export function clean(v: unknown, max: number): string {
  return String(v ?? "")
    .replace(/\r\n/g, "\n")
    .trim()
    .slice(0, max);
}
