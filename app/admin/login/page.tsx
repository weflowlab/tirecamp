import type { Metadata } from "next";
import { redirect } from "next/navigation";
import LoginForm from "@/components/admin/LoginForm";
import { isAdmin } from "@/lib/adminAuth";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: `관리자 로그인 | ${SITE.name}`,
  robots: { index: false, follow: false },
};

/** 관리자 로그인 (/admin/login) — 이미 로그인돼 있으면 대시보드로 */
export default async function AdminLoginPage() {
  if (await isAdmin()) redirect("/admin");

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-surface px-[16px] font-sans">
      <div className="w-[380px] max-w-full border border-line bg-white px-[36px] py-[40px] max-pc:px-[24px] max-pc:py-[32px]">
        <p className="eyebrow">Admin</p>
        <h1 className="mt-[6px] text-[24px] font-bold leading-none tracking-[-0.04em] text-ink">{SITE.name}</h1>
        <p className="mt-[12px] text-[13px] leading-[20px] text-muted">관리자 비밀번호를 입력해 주세요.</p>
        <div className="mt-[24px]">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
