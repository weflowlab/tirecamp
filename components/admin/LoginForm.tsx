"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { BTN, FIELD } from "./ui";

/** 비밀번호 1개로 로그인 → POST /api/admin/login → /admin */
export default function LoginForm() {
  const router = useRouter();
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!pw) return setError("비밀번호를 입력해 주세요.");
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: pw }) });
      const data = (await res.json()) as { ok: boolean; error?: string };
      if (!res.ok || !data.ok) throw new Error(data.error || "로그인에 실패했습니다.");
      router.replace("/admin");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "로그인에 실패했습니다.");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <input type="password" className={`${FIELD} !h-[44px] !text-[15px]`} value={pw} autoFocus autoComplete="current-password" placeholder="비밀번호" onChange={(e) => setPw(e.target.value)} />
      <p className="mt-[8px] h-[18px] text-[12px] text-[#B3261E]">{error}</p>
      <button type="submit" disabled={busy} className={`${BTN} mt-[10px] w-full !h-[44px] !text-[13px]`}>
        {busy ? "확인 중..." : "로그인"}
      </button>
    </form>
  );
}
