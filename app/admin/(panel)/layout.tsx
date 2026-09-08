import type { Metadata } from "next";
import AdminChrome from "@/components/admin/AdminChrome";
import { requireAdmin } from "@/lib/adminAuth";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: { default: "관리자", template: `%s | ${SITE.name} 관리자` },
  robots: { index: false, follow: false },
};

/* 관리자 화면은 항상 최신 데이터 (data/*.json) 를 읽는다 */
export const dynamic = "force-dynamic";

/**
 * 관리자 레이아웃 (/admin/*, 로그인 제외)
 * - 진입 시 세션 쿠키를 검사해 없으면 /admin/login 으로 보낸다 (API 도 각각 재검사)
 * - 사이드바/상단바는 AdminChrome(클라이언트)이 담당
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return <AdminChrome>{children}</AdminChrome>;
}
