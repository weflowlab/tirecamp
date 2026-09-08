import type { Metadata } from "next";
import { SITE, pageTitle } from "@/lib/site";

export const metadata: Metadata = {
  title: pageTitle("개인정보처리방침"),
};

/* 각 항목: 제목 + 문단들 (문단 안 줄바꿈은 \n) */
const SECTIONS: { title: string; body: string[] }[] = [
  {
    title: "개인정보 수집에 대한 동의",
    body: ["회사는 이용자가 문의하기 · 후기 작성 시 개인정보 수집 · 이용에 동의하는 절차를 두고 있으며, 동의 체크 후 접수하면 개인정보 수집에 동의한 것으로 봅니다."],
  },
  {
    title: "수집하는 개인정보 항목과 수집 방법",
    body: [
      "회사는 별도의 회원 가입 없이 서비스를 제공합니다. 다만 문의 답변과 예약 확인을 위해 아래 항목을 온라인 입력으로 수집합니다.",
      "문의하기: 이름, 연락처, 차종 · 타이어 사이즈(선택), 문의 내용\n후기 작성: 이름, 차량 유형, 차종(선택), 후기 내용",
      "서비스 이용 과정에서 접속 기록, 브라우저 정보 등이 자동으로 생성되어 통계 목적으로만 이용될 수 있습니다.",
    ],
  },
  {
    title: "개인정보의 수집 · 이용 목적",
    body: ["이름 · 연락처: 문의 확인 및 답변, 타이어 교체 예약 안내\n차종 · 사이즈: 맞는 타이어 견적 안내\n후기 내용: 홈페이지 후기 게시"],
  },
  {
    title: "개인정보의 보유 및 이용 기간",
    body: ["문의 정보는 답변 및 예약 처리가 끝나면 지체 없이 파기합니다. 후기는 이용자가 삭제를 요청하거나 회사가 게시를 종료할 때까지 보관합니다. 관계 법령에 따라 보존이 필요한 경우 해당 기간 동안 보관합니다."],
  },
  {
    title: "개인정보의 제3자 제공",
    body: [
      "회사는 이용자의 개인정보를 위 목적 범위 안에서만 이용하며, 사전 동의 없이 외부에 제공하지 않습니다. 다만 아래 경우는 예외로 합니다.",
      "이용자가 사전에 동의한 경우\n타이어 장착을 위해 장착 담당자와의 연락이 필요한 경우\n법령에 따라 적법한 절차로 정부기관의 요청이 있는 경우",
    ],
  },
  {
    title: "이용자의 권리",
    body: ["이용자는 언제든지 본인의 개인정보 열람 · 정정 · 삭제를 요청할 수 있습니다. 아래 개인정보 관리책임자에게 전화 또는 이메일로 연락하시면 지체 없이 처리해 드립니다."],
  },
  {
    title: "쿠키의 운영",
    body: ["회사는 회원제 사이트가 아니며 로그인 인증에 쿠키를 사용하지 않습니다. 브라우저 설정에서 쿠키 저장을 거부할 수 있으며, 이 경우에도 홈페이지 이용에는 지장이 없습니다."],
  },
  {
    title: "개인정보 보호를 위한 조치",
    body: ["회사는 개인정보가 분실 · 도난 · 유출 · 변조되지 않도록 접근 권한을 담당자로 제한하고, 저장된 자료를 안전하게 관리합니다. 개인정보 취급 담당자에게는 보호 정책 준수를 교육합니다."],
  },
  {
    title: "개인정보 처리의 위탁",
    body: ["회사는 현재 개인정보 처리를 외부에 위탁하지 않습니다. 위탁이 필요해지는 경우 위탁 대상과 업무 내용을 미리 이 방침에 공지합니다."],
  },
  {
    title: "개인정보 관리책임자",
    body: [`책임자: ${SITE.ceo} (${SITE.name} 대표)\n전화: ${SITE.phone}\n이메일: ${SITE.email}`],
  },
  {
    title: "고지의 의무",
    body: ["이 방침의 내용이 추가 · 삭제 · 수정될 때는 홈페이지 공지사항을 통해 알려드립니다."],
  },
];

/**
 * 개인정보처리방침 (/cscenter/personal_info)
 * - 문의하기 · 후기 작성에서 수집하는 정보 기준으로 정리
 */
export default function PersonalInfoPage() {
  return (
    <div className="w-full font-sans">
      <p className="eyebrow">Privacy</p>
      <h1 className="mt-[4px] mb-[20px] text-[24px] font-bold tracking-[-0.03em] text-ink max-pc:text-[20px]">개인정보처리방침</h1>

      <p className="text-[14px] leading-[25px] text-graphite">
        {SITE.name}(이하 &quot;회사&quot;)는 이용자가 홈페이지(이하 &quot;서비스&quot;)를 이용하며 제공한 개인정보가 안전하게 보호되도록 개인정보 보호법 등 관련 법령을
        준수합니다. 이 방침은 회사가 어떤 정보를 왜 수집하고 어떻게 관리하는지 알려드리기 위한 것이며, 법령이나 회사 방침이 바뀌면 수정될 수 있습니다.
      </p>

      <ol className="mt-[32px] border-t border-line">
        {SECTIONS.map((s, i) => (
          <li key={s.title} className="grid grid-cols-[200px_1fr] gap-[20px] border-b border-line py-[22px] max-pc:grid-cols-1 max-pc:gap-[8px]">
            <h2 className="flex items-start gap-[10px] text-[15px] font-bold tracking-[-0.01em] text-ink">
              <span className="eyebrow mt-[3px] shrink-0 !text-faint">{String(i + 1).padStart(2, "0")}</span>
              {s.title}
            </h2>
            <div className="text-[13px] leading-[23px] text-graphite">
              {s.body.map((p, k) => (
                <p key={k} className={`whitespace-pre-line text-[13px] text-graphite ${k > 0 ? "mt-[10px]" : ""}`}>
                  {p}
                </p>
              ))}
            </div>
          </li>
        ))}
      </ol>

      <p className="mt-[20px] text-[12px] text-muted">시행일: 2026년 9월 8일</p>
    </div>
  );
}
