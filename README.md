# hchu.me

개인 포트폴리오/블로그 사이트입니다.  
SvelteKit + Cloudflare Workers + D1 기반으로 동작하며, Notion 데이터를 주기적으로 동기화해 프로젝트/블로그 콘텐츠를 서비스합니다.

- 프로젝트 설정 방법 외의 내용은 [hchu.me 프로젝트 상세 페이지](https://hchu.me/project/hchu-me)를 참고해주세요.

## 시작하기

### 1) 의존성 설치

```sh
pnpm install
```

### 2) 개발 서버 실행

```sh
pnpm dev
```

### 3) 빌드/미리보기

```sh
pnpm preview
```

### 4) 배포

```sh
pnpm deploy
```

## 환경 변수 및 Cloudflare 설정

- `SYNC_SECRET`: 수동 동기화 API 인증 토큰
- `NOTION_TOKEN`: Notion API 토큰
- `NOTION_PROJECTS_DATA_SOURCE_ID`
- `NOTION_BLOGS_DATA_SOURCE_ID`
- `NOTION_TECHS_DATA_SOURCE_ID`
- `DB` (D1 바인딩)

민감 정보는 `wrangler secret`으로 설정하거나, 개발 중에는 `.env` 파일에 저장할 수 있습니다.

```sh
wrangler secret put NOTION_TOKEN
wrangler secret put SYNC_SECRET
```

## 데이터베이스 마이그레이션

```sh
pnpm db:generate
pnpm db:migrate:local
pnpm db:migrate:remote
```

## Notion 동기화

### 자동 동기화

- `wrangler.jsonc`의 Cron Trigger에 따라 `scheduled` 핸들러가 실행되어 동기화를 수행합니다.

### 수동 동기화 API

- 엔드포인트: `POST /api/sync`
- 인증: `Authorization: Bearer <SYNC_SECRET>`

예시:

```sh
curl -X POST http://localhost:8787/api/sync \
  -H "Authorization: Bearer <SYNC_SECRET>"
```

## Notion 데이터소스 속성 이름

동기화 로직은 아래 속성명을 기준으로 데이터를 읽습니다.

- 상태: `상태` (`완료`만 동기화)
- 제목: `이름`
- 슬러그: `별명`
- 설명: `설명`
- 기술 스택: `기술 스택`
- GitHub: `GitHub`
- 웹사이트: `웹사이트`

Notion 데이터소스의 컬럼 이름이 다르면 동기화가 정상 동작하지 않을 수 있습니다.
