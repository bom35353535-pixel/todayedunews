# 서울교육 AI 브리핑 센터

서울특별시교육청 보도자료·공지사항, 교육부 보도자료, 연합뉴스 RSS를 서버에서 직접 수집해 보여주는 Next.js 대시보드입니다. 화면용 샘플 뉴스는 사용하지 않습니다.

## 현재 구현 범위

- 네 출처의 실제 HTML/RSS 수집
- 출처별 parser 오류 격리
- Asia/Seoul 기준 오늘 자료 필터
- 오늘 TOP 5 규칙 기반 우선순위
- 제목·본문 검색 및 출처 필터
- 브라우저별 즐겨찾기(localStorage)
- `/admin/collect` 수집 상태 및 수동 재수집
- 수집 결과 10분 서버 캐시

AI 분석과 Supabase 영구 저장은 환경변수가 연결되기 전까지 실행하지 않으며, 화면에서도 AI 분석으로 표시하지 않습니다.

## 실행

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:3000`을 엽니다. 수집 상태는 `http://localhost:3000/admin/collect`에서 확인합니다.

## 검증

```bash
npm run typecheck
npm run build
npm run collect -- 2026-09-09
```

`collect`의 날짜를 확인하려는 Asia/Seoul 기준일로 변경할 수 있습니다. 결과는 `outputs/live-verification-YYYY-MM-DD.json`에 저장됩니다.

## 환경변수

`.env.example`을 `.env.local`로 복사한 뒤 실제 키를 입력합니다. 키를 소스코드나 Git에 저장하지 마세요.

현재 대시보드의 실제 수집 기능에는 별도 API 키가 필요하지 않습니다. OpenAI와 Supabase 변수는 다음 개발 단계에서 AI 분석 및 영구 저장을 연결할 때 사용합니다.
