import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

/**
 * Neon(Postgres) 연결 — 코드에서는 store.ts / analytics.ts / files.ts 를 통해서만 DB 에 닿는다.
 * - DATABASE_URL 이 없으면 DB 를 쓰지 않고 data/*.json 파일 저장소로 동작한다 (로컬 개발용).
 * - 지연 초기화: 모듈 로드 시점이 아니라 실제 요청 시점에 연결을 만든다 (next build 단계에서 env 없이도 안전).
 * - 테이블은 처음 쓸 때 CREATE TABLE IF NOT EXISTS 로 만든다 (별도 마이그레이션 없음).
 */
let client: NeonQueryFunction<false, false> | null = null;
let schemaReady: Promise<void> | null = null;

export function hasDb(): boolean {
  return !!process.env.DATABASE_URL;
}

export function getSql(): NeonQueryFunction<false, false> {
  if (client) return client;
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL 환경변수가 설정되지 않았습니다.");
  client = neon(url);
  return client;
}

/** 테이블 생성 (프로세스당 1회) */
export function ensureSchema(): Promise<void> {
  if (schemaReady) return schemaReady;
  schemaReady = (async () => {
    const sql = getSql();
    // 목록형 데이터(문의/후기/회원/공지/FAQ/팝업)는 컬렉션 하나 = JSON 배열 하나
    await sql`CREATE TABLE IF NOT EXISTS documents (
      name TEXT PRIMARY KEY,
      data JSONB NOT NULL DEFAULT '[]'::jsonb,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`;
    // 방문 기록은 양이 늘어나므로 행 단위 테이블
    await sql`CREATE TABLE IF NOT EXISTS page_views (
      id TEXT PRIMARY KEY,
      day TEXT NOT NULL,
      session_id TEXT NOT NULL,
      path TEXT NOT NULL,
      referrer TEXT NOT NULL DEFAULT '',
      source TEXT NOT NULL DEFAULT '',
      medium TEXT NOT NULL DEFAULT '',
      campaign TEXT NOT NULL DEFAULT '',
      device TEXT NOT NULL DEFAULT 'pc',
      ts TIMESTAMPTZ NOT NULL DEFAULT now(),
      duration_ms INTEGER,
      max_scroll INTEGER
    )`;
    await sql`CREATE INDEX IF NOT EXISTS page_views_day_idx ON page_views (day)`;
    // 업로드 이미지(팝업/공지) — 파일시스템 대신 DB 에 보관하고 /api/files/:id 로 서빙
    await sql`CREATE TABLE IF NOT EXISTS files (
      id TEXT PRIMARY KEY,
      mime TEXT NOT NULL,
      data BYTEA NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`;
  })().catch((e) => {
    schemaReady = null; // 실패하면 다음 요청에서 다시 시도
    throw e;
  });
  return schemaReady;
}
