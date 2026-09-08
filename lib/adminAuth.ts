import crypto from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

/**
 * 관리자 인증 — 비밀번호 1개(ADMIN_PASSWORD) + HMAC 서명 세션 쿠키
 * - 회원 테이블 없이 관리자 1명이 쓰는 구조. 쿠키에는 만료시각.서명 만 담는다.
 * - 환경변수: ADMIN_PASSWORD (필수, 개발 환경에서만 "tirecamp" 로 대체), ADMIN_SESSION_SECRET (선택)
 * - 페이지 진입은 requireAdmin() (레이아웃), API 는 isAdmin() 으로 각각 재검사한다.
 */
export const ADMIN_COOKIE = "tc_admin";
export const ADMIN_MAX_AGE = 60 * 60 * 24 * 7; // 7일(초)

const DEV_PASSWORD = "tirecamp";

function password(): string {
  const pw = process.env.ADMIN_PASSWORD;
  if (pw) return pw;
  if (process.env.NODE_ENV !== "production") return DEV_PASSWORD;
  return ""; // 운영에서 미설정 → 로그인 불가
}

function secret(): string {
  return process.env.ADMIN_SESSION_SECRET || password() || "tirecamp-dev-secret";
}

function sign(payload: string): string {
  return crypto.createHmac("sha256", secret()).update(payload).digest("hex");
}

export function checkPassword(input: string): boolean {
  const expected = password();
  if (!expected || !input) return false;
  const a = Buffer.from(input);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export function createSession(): string {
  const exp = String(Date.now() + ADMIN_MAX_AGE * 1000);
  return `${exp}.${sign(exp)}`;
}

export function verifySession(token: string | undefined | null): boolean {
  if (!token) return false;
  const [exp, sig] = token.split(".");
  if (!exp || !sig) return false;
  const expected = sign(exp);
  if (expected.length !== sig.length) return false;
  if (!crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(sig))) return false;
  return Number(exp) > Date.now();
}

/** 서버 컴포넌트/API 공통: 현재 요청이 관리자 세션인지 */
export async function isAdmin(): Promise<boolean> {
  const store = await cookies();
  return verifySession(store.get(ADMIN_COOKIE)?.value);
}

/** 관리자 페이지 레이아웃용: 세션이 없으면 로그인 화면으로 */
export async function requireAdmin(): Promise<void> {
  if (!(await isAdmin())) redirect("/admin/login");
}

/** API 라우트용: 세션이 없으면 401 응답을 돌려준다 (있으면 null) */
export async function denyUnlessAdmin(): Promise<Response | null> {
  if (await isAdmin()) return null;
  return Response.json({ ok: false, error: "관리자 로그인이 필요합니다." }, { status: 401 });
}
