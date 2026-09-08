import fs from "node:fs/promises";
import path from "node:path";
import { ensureSchema, getSql, hasDb } from "@/lib/db";

/**
 * 업로드 이미지 저장 (팝업/공지)
 * - DATABASE_URL 이 있으면 Postgres files 테이블(bytea)에 넣고 "/api/files/<id>" 경로를 돌려준다
 * - 없으면 public/uploads/<dir>/ 에 파일로 저장하고 "/uploads/<dir>/<파일명>" 을 돌려준다
 */
const EXT: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/gif": "gif", "image/webp": "webp" };

export function extOf(mime: string): string | undefined {
  return EXT[mime];
}

export async function saveUpload(dir: string, file: File): Promise<string> {
  const ext = extOf(file.type);
  if (!ext) throw new Error("지원하지 않는 이미지 형식입니다.");
  const id = `${dir}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  const buf = Buffer.from(await file.arrayBuffer());

  if (hasDb()) {
    await ensureSchema();
    await getSql()`INSERT INTO files (id, mime, data) VALUES (${id}, ${file.type}, ${buf})`;
    return `/api/files/${id}`;
  }
  const target = path.join(process.cwd(), "public", "uploads", dir);
  await fs.mkdir(target, { recursive: true });
  await fs.writeFile(path.join(target, `${id}.${ext}`), buf);
  return `/uploads/${dir}/${id}.${ext}`;
}

export async function readUpload(id: string): Promise<{ mime: string; data: Buffer } | null> {
  if (!hasDb()) return null;
  await ensureSchema();
  const rows = await getSql()`SELECT mime, data FROM files WHERE id = ${id}`;
  if (!rows.length) return null;
  const raw = rows[0].data as unknown;
  const data = Buffer.isBuffer(raw) ? raw : typeof raw === "string" ? Buffer.from(raw.replace(/^\\x/, ""), "hex") : Buffer.from(raw as ArrayBuffer);
  return { mime: String(rows[0].mime), data };
}
