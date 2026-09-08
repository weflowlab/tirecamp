import Link from "next/link";

/*
 * 관리자 공통 UI 조각 — 사이트와 같은 블랙&화이트 톤 (얇은 선, 각진 모서리, eyebrow 라벨)
 * - 페이지 머리 / 카드 / 표 / 배지 / 버튼·입력 클래스 상수
 */

/** 입력창: 사이트 .field 를 관리자 높이(38px)로 */
export const FIELD = "field !h-[38px] !text-[13px]";
export const TEXTAREA = "field !text-[13px]";
/** 검정 채움 버튼 (작게) */
export const BTN = "btn-fill !h-[36px] !px-[16px] !text-[12px] disabled:cursor-not-allowed";
/** 얇은 테두리 버튼 (작게) */
export const BTN_OUTLINE = "btn-outline !h-[36px] !px-[14px] !text-[12px] text-ink hover:bg-ink hover:text-white hover:!no-underline disabled:opacity-40";
/** 표 안의 아주 작은 텍스트 버튼 */
export const BTN_TEXT = "text-[12px] text-muted underline underline-offset-4 hover:text-ink disabled:opacity-40";
/** 위험(삭제) 텍스트 버튼 */
export const BTN_DANGER = "text-[12px] text-muted underline underline-offset-4 hover:text-[#B3261E] disabled:opacity-40";
export const LABEL = "mb-[6px] block text-[12px] tracking-[0.02em] text-muted";

/** 페이지 머리: eyebrow + 제목 + 설명, 우측 액션 */
export function PageHead({
  eyebrow,
  title,
  desc,
  action,
  back,
}: {
  eyebrow: string;
  title: string;
  desc?: string;
  action?: React.ReactNode;
  back?: { href: string; label: string };
}) {
  return (
    <div className="mb-[24px] flex items-end justify-between gap-[16px] border-b border-line pb-[18px] max-pc:flex-col max-pc:items-start">
      <div className="flex items-start gap-[14px]">
        {/* 뒤로가기 (편집 화면 → 목록) */}
        {back && (
          <Link
            href={back.href}
            title={back.label}
            aria-label={back.label}
            className="mt-[22px] flex h-[36px] w-[36px] shrink-0 items-center justify-center border border-line bg-white !text-graphite transition-colors hover:border-ink hover:bg-ink hover:!text-white hover:!no-underline max-pc:mt-[18px]"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </Link>
        )}
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="mt-[4px] text-[24px] font-bold leading-[1.2] tracking-[-0.03em] text-ink max-pc:text-[20px]">{title}</h1>
          {desc && <p className="mt-[8px] text-[13px] leading-[20px] text-muted">{desc}</p>}
        </div>
      </div>
      {action && <div className="shrink-0 max-pc:w-full">{action}</div>}
    </div>
  );
}

/** 흰 카드 (얇은 선) */
export function Card({
  title,
  eyebrow,
  action,
  className = "",
  children,
}: {
  title?: string;
  eyebrow?: string;
  action?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={`border border-line bg-white ${className}`}>
      {(title || eyebrow || action) && (
        // 우측 액션은 제목 줄(아래 줄)에 맞춰 정렬 — 모든 카드가 같은 시작선을 갖는다
        <div className="flex items-end justify-between gap-[12px] border-b border-line px-[22px] py-[14px] max-pc:flex-col max-pc:items-stretch max-pc:px-[16px]">
          <div>
            {eyebrow && <p className="eyebrow">{eyebrow}</p>}
            {title && <h2 className="whitespace-nowrap text-[15px] font-bold tracking-[-0.01em] text-ink">{title}</h2>}
          </div>
          {/* 모바일에서는 제목 아래 줄로 내려가고, 버튼들은 줄바꿈되지 않는다 */}
          {action && <div className="shrink-0 whitespace-nowrap [&_button]:whitespace-nowrap max-pc:flex max-pc:justify-end">{action}</div>}
        </div>
      )}
      <div className="p-[22px] max-pc:p-[16px]">{children}</div>
    </section>
  );
}

/** 상태 배지 — 잉크(강조) / 회색(보통) / 연회색(끝남) */
export function Badge({ tone = "muted", children }: { tone?: "ink" | "muted" | "faint" | "outline"; children: React.ReactNode }) {
  const cls = {
    ink: "border-ink bg-ink text-white",
    outline: "border-ink text-ink",
    muted: "border-line bg-surface text-graphite",
    faint: "border-line text-faint",
  }[tone];
  return <span className={`inline-flex h-[20px] shrink-0 items-center whitespace-nowrap border px-[7px] text-[11px] leading-none tracking-[0.02em] ${cls}`}>{children}</span>;
}

/** 표 — 얇은 선, 머리글은 작은 대문자 느낌의 회색 */
export const TABLE = "w-full text-[13px] text-graphite";
export const TH = "border-b border-ink px-[10px] py-[10px] text-left text-[11px] font-medium tracking-[0.08em] text-muted whitespace-nowrap";
export const TD = "border-b border-line px-[10px] py-[12px] align-middle";
export const TR_HOVER = "transition-colors hover:bg-surface";

/** 표가 비었을 때 */
export function Empty({ children }: { children: React.ReactNode }) {
  return <p className="border border-dashed border-line py-[40px] text-center text-[13px] text-muted">{children}</p>;
}

/** 숫자 폰트 */
export const NUM = { fontFamily: "var(--font-num)" } as const;

/** 필드 라벨 래퍼 */
export function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className={LABEL}>
        {label}
        {required && <span className="ml-[2px] text-ink">*</span>}
        {hint && <span className="ml-[6px] text-faint">{hint}</span>}
      </span>
      {children}
    </label>
  );
}

/** 목록 페이지 번호 (관리자용, ?page= 쿼리) */
export function Pager({ page, totalPages, href }: { page: number; totalPages: number; href: (p: number) => string }) {
  if (totalPages <= 1) return null;
  return (
    <nav className="mt-[20px] flex justify-center gap-[4px]" style={NUM} aria-label="페이지">
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
        <Link
          key={p}
          href={href(p)}
          className={`flex h-[32px] min-w-[32px] items-center justify-center px-[6px] text-[13px] hover:!no-underline ${p === page ? "border-b-2 border-ink font-bold !text-ink" : "!text-muted hover:!text-ink"}`}
        >
          {p}
        </Link>
      ))}
    </nav>
  );
}

/** 필터 칩 (링크) */
export function Chip({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      scroll={false}
      className={`inline-flex h-[30px] items-center border px-[12px] text-[12px] transition-colors hover:!no-underline ${
        active ? "border-ink bg-ink !text-white" : "border-line bg-white !text-graphite hover:border-graphite hover:!text-ink"
      }`}
    >
      {children}
    </Link>
  );
}

/** 통계 숫자 타일 */
export function Stat({ label, value, unit, sub }: { label: string; value: string | number; unit?: string; sub?: string }) {
  return (
    <div className="border border-line bg-white px-[20px] py-[18px]">
      <p className="text-[12px] tracking-[0.02em] text-muted">{label}</p>
      <p className="mt-[8px] text-[26px] font-semibold leading-none tracking-[-0.02em] text-ink" style={NUM}>
        {value}
        {unit && <span className="ml-[3px] text-[13px] font-normal text-muted">{unit}</span>}
      </p>
      {sub && <p className="mt-[8px] text-[11px] text-faint">{sub}</p>}
    </div>
  );
}

/** 저장/오류 메시지 한 줄 */
export function Msg({ msg }: { msg: { ok: boolean; text: string } | null }) {
  if (!msg) return null;
  return <p className={`text-[12px] ${msg.ok ? "text-ink" : "text-[#B3261E]"}`}>{msg.text}</p>;
}
