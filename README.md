This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## 관리자 페이지 (/admin)

- 주소: `/admin` (로그인 `/admin/login`). 비밀번호 1개로 로그인하며, 세션은 7일간 유지됩니다.
- 환경변수는 `.env.example` 을 `.env.local` 로 복사해 채웁니다.
  `DATABASE_URL` (Neon Postgres), `ADMIN_PASSWORD` (운영 필수, 개발 환경에서만 미설정 시 `tirecamp`), `ADMIN_SESSION_SECRET` (선택).
- 메뉴: 대시보드 / 문의 관리 / 타이어 관리 / 공지사항 관리 / FAQ 관리 / 팝업창 관리 / 방문자 통계·유입.
- 저장소: `DATABASE_URL` 이 있으면 Postgres 에 저장합니다 (테이블은 첫 요청 때 자동 생성, 기존 `data/*.json` 내용은 처음 읽을 때 DB 로 옮겨 심음).
  `documents` (문의/후기/공지/FAQ/팝업, 컬렉션별 JSON), `page_views` (방문 기록), `files` (업로드 이미지 → `/api/files/:id`),
  `tires` (타이어 제품 67종) / `tire_prices` (사이즈별 가격 2,046행). 타이어는 `data/tinfo.json`·`tprodintro.json`·`tireNotes.json`·`sizelist/*.json` 을 초기값으로 옮겨 심으며, 이후 관리자 > 타이어 관리에서 사진·이름·설명·가격을 수정합니다.
  `DATABASE_URL` 이 없으면 `data/*.json`, `data/analytics/`, `public/uploads/` 파일에 저장합니다 (로컬 개발용).
- 본인 방문을 통계에서 빼려면 사이트 주소 뒤에 `?notrack=1` 을 붙여 한 번 접속하세요 (`?track=1` 로 해제).
