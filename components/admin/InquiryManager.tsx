"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Inquiry } from "@/lib/inquiries";
import { Badge, BTN, BTN_DANGER, BTN_OUTLINE, Empty, Msg, NUM, TABLE, TD, TEXTAREA, TH, TR_HOVER } from "./ui";

/**
 * 문의 목록 (클라이언트) — 행을 누르면 아래로 펼쳐져 내용·메모·처리 버튼이 나온다
 * - 상태 변경 / 메모 저장 / 삭제 → /api/admin/inquiries/:id
 */
export default function InquiryManager({ rows, openId }: { rows: Inquiry[]; openId: number }) {
  const router = useRouter();
  const [open, setOpen] = useState<number>(openId);
  const [busy, setBusy] = useState<number | null>(null);
  const [msg, setMsg] = useState<Record<number, { ok: boolean; text: string }>>({});
  const [memo, setMemo] = useState<Record<number, string>>({});

  const note = (id: number, ok: boolean, text: string) => setMsg((m) => ({ ...m, [id]: { ok, text } }));

  async function call(id: number, method: "PATCH" | "DELETE", body?: unknown) {
    setBusy(id);
    try {
      const res = await fetch(`/api/admin/inquiries/${id}`, {
        method,
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      });
      const data = (await res.json()) as { ok: boolean; error?: string };
      if (!res.ok || !data.ok) throw new Error(data.error || "처리에 실패했습니다.");
      return true;
    } catch (e) {
      note(id, false, e instanceof Error ? e.message : "처리에 실패했습니다.");
      return false;
    } finally {
      setBusy(null);
    }
  }

  async function setStatus(i: Inquiry, status: Inquiry["status"]) {
    if (await call(i.id, "PATCH", { status })) {
      note(i.id, true, status === "done" ? "처리완료로 바꿨습니다." : "신규로 되돌렸습니다.");
      router.refresh();
    }
  }

  async function saveMemo(i: Inquiry) {
    if (await call(i.id, "PATCH", { memo: memo[i.id] ?? i.memo ?? "" })) {
      note(i.id, true, "메모를 저장했습니다.");
      router.refresh();
    }
  }

  async function remove(i: Inquiry) {
    if (!confirm(`${i.name}님의 문의를 삭제할까요? 되돌릴 수 없습니다.`)) return;
    if (await call(i.id, "DELETE")) router.refresh();
  }

  if (rows.length === 0) return <Empty>조건에 맞는 문의가 없습니다.</Empty>;

  return (
    <div className="overflow-x-auto border-t border-ink bg-white">
      <table className={TABLE}>
        <thead>
          <tr>
            <th className={`${TH} !border-t-0`}>상태</th>
            <th className={TH}>이름</th>
            <th className={TH}>연락처</th>
            <th className={TH}>유형</th>
            <th className={`${TH} w-full`}>내용</th>
            <th className={TH}>접수일</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((i) => {
            const isOpen = open === i.id;
            return (
              <FragmentRow key={i.id}>
                <tr className={`${TR_HOVER} cursor-pointer ${isOpen ? "bg-surface" : ""}`} onClick={() => setOpen(isOpen ? 0 : i.id)}>
                  <td className={TD}>
                    <Badge tone={i.status === "new" ? "ink" : "faint"}>{i.status === "new" ? "신규" : "완료"}</Badge>
                  </td>
                  <td className={`${TD} whitespace-nowrap font-semibold text-ink`}>{i.name}</td>
                  <td className={`${TD} whitespace-nowrap`} style={NUM}>
                    {i.phone}
                  </td>
                  <td className={`${TD} whitespace-nowrap`}>{i.type}</td>
                  <td className={`${TD} max-w-[360px]`}>
                    <span className="block truncate">{i.content}</span>
                    {i.memo && <span className="mt-[2px] block truncate text-[11px] text-faint">메모: {i.memo}</span>}
                  </td>
                  <td className={`${TD} whitespace-nowrap text-faint`} style={NUM}>
                    {i.date}
                  </td>
                </tr>
                {isOpen && (
                  <tr>
                    {/* 펼침 영역 — 좌우 여백을 표 셀(px-[10px])과 맞춰 왼쪽 라벨은 상태 칸, 오른쪽 메모는 접수일 칸 끝선에 정렬.
                        양쪽 모두 [내용 / 하단 버튼 줄] 구조라 버튼 줄이 같은 높이에 오도록 flex-col + mt-auto */}
                    <td colSpan={6} className="border-b border-line bg-surface px-[10px] py-[20px]">
                      <div className="grid grid-cols-[1fr_360px] gap-[24px] max-pc:grid-cols-1">
                        <div className="flex flex-col">
                          <dl className="grid grid-cols-[80px_1fr] gap-x-[12px] gap-y-[8px] text-[13px]">
                            <dt className="text-muted">차종/사이즈</dt>
                            <dd className="text-ink">{i.car || "-"}</dd>
                            <dt className="text-muted">접수 시각</dt>
                            <dd className="text-ink" style={NUM}>
                              {new Date(i.createdAt).toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })}
                            </dd>
                            <dt className="text-muted">문의 내용</dt>
                            <dd className="whitespace-pre-line leading-[22px] text-ink">{i.content}</dd>
                          </dl>
                          <div className="mt-auto flex flex-wrap items-center gap-[8px] pt-[16px]">
                            <a href={`tel:${i.phone.replace(/-/g, "")}`} className={`${BTN_OUTLINE} !no-underline`}>
                              전화 걸기
                            </a>
                            <a href={`sms:${i.phone.replace(/-/g, "")}`} className={`${BTN_OUTLINE} !no-underline`}>
                              문자 보내기
                            </a>
                            {i.status === "new" ? (
                              <button type="button" disabled={busy === i.id} className={BTN} onClick={() => setStatus(i, "done")}>
                                처리완료로 변경
                              </button>
                            ) : (
                              <button type="button" disabled={busy === i.id} className={BTN_OUTLINE} onClick={() => setStatus(i, "new")}>
                                신규로 되돌리기
                              </button>
                            )}
                            <button type="button" disabled={busy === i.id} className={`${BTN_DANGER} ml-[4px]`} onClick={() => remove(i)}>
                              삭제
                            </button>
                          </div>
                        </div>
                        <div className="flex flex-col">
                          <p className="mb-[6px] text-[12px] tracking-[0.02em] text-muted">관리자 메모</p>
                          <textarea
                            className={`${TEXTAREA} h-[110px] flex-1`}
                            value={memo[i.id] ?? i.memo ?? ""}
                            maxLength={1000}
                            placeholder="통화 내용, 견적, 예약일 등"
                            onChange={(e) => setMemo((m) => ({ ...m, [i.id]: e.target.value }))}
                          />
                          <div className="mt-auto flex items-center justify-between gap-[10px] pt-[16px]">
                            <Msg msg={msg[i.id] ?? null} />
                            <button type="button" disabled={busy === i.id} className={`${BTN_OUTLINE} ml-auto`} onClick={() => saveMemo(i)}>
                              메모 저장
                            </button>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </FragmentRow>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* key 를 가진 Fragment (tr 두 줄을 하나로 묶기 위함) */
function FragmentRow({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
