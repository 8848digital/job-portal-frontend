# CLAUDE.md

Guidance for Claude Code (and humans) working in this repository.

## Project

Job portal frontend for 8848 Digital — job seekers browse openings, apply, and
manage their profile/resume. Built with **Next.js 13 (pages router)**, React 18,
TypeScript, Redux Toolkit + redux-persist, React Query, react-bootstrap / MUI,
Formik + Yup. The backend is a Frappe app (`job_portal`).

## Commands

```bash
npm install
npm run dev      # http://localhost:3000
npm run build
npm run lint
```

## Environment

All backend/site URLs come from environment variables — **do not hardcode URLs**.

1. `cp .env.example .env` (or `.env.local`) and adjust values.
2. Restart `npm run dev` after any change — `NEXT_PUBLIC_*` values are inlined at build time.

| Variable | Purpose | Default |
| --- | --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | Frappe backend base URL (no trailing slash) | `https://careersportal.8848digital.com` |
| `NEXT_PUBLIC_API_MANDATE_PARAMS` | SDK API method path appended to the base URL | `/api/method/job_portal.sdk.api` |
| `NEXT_PUBLIC_API_VERSION` | Default `?version=` sent to the SDK API | `v2` |
| `NEXT_PUBLIC_SITE_URL` | Public URL of this frontend (used for the reset-password email link) | `https://careers.8848digital.com` |

`.env` is git-ignored; only `.env.example` is committed. Anything with the
`NEXT_PUBLIC_` prefix ships to the browser, so never put secrets there.

## Code layout

- `pages/` — routes (`index`, `jobs`, `job-details/[jobID]`, `login`, `register`, `profile`, password flows).
- `components/` — page sections and feature masters (jobs listing, job details, profile, auth forms).
- `cards/` — reusable card components (job cards, profile info card, etc.).
- `hooks/` — data hooks wrapping the API services.
- `services/api/` — axios calls grouped by feature (`auth_api`, `jobs-list`, `job-detail`, `profile_api`, `home-page`).
- `services/config/app-config.ts` — `CONSTANTS`, the single place env values are read.
- `services/config/api-config.ts` — shared axios headers / timeout.
- `store/` — Redux store, persisted slices (auth token lives in `auth_slice/login_slice`).
- `interfaces/`, `validation/`, `datasets/` (static/mock data), `styles/`, `public/`.

## Conventions

- Build API URLs as `${CONSTANTS.API_BASE_URL}${CONSTANTS.API_MANDATE_PARAMS}?version=${CONSTANTS.VERSION}&method=<method>&entity=<entity>`.
  Frappe built-ins (`/api/method/logout`, `/api/method/upload_file`) use `CONSTANTS.API_BASE_URL` directly.
- Files uploaded to Frappe return relative paths — prefix them with `CONSTANTS.API_BASE_URL`.
- Read env only via `CONSTANTS`; when adding a new variable, use literal
  `process.env.NEXT_PUBLIC_X` access in `app-config.ts`, and add it to `.env.example` and the table above.
- Import alias `@/*` maps to the repo root.
- Commit messages follow `feat: … :sk` / `fix: … :sk` style used in history.
