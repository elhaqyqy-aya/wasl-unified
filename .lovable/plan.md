
## Goal

One web app that fully runs in Lovable. Mobile-first responsive (PWA-installable). All Python/Docker infra replaced by Lovable Cloud (Supabase) + TanStack server functions. Firebase replaced by Supabase auth. Rebranded **Wasl by Humanai**.

## Phase 1 — Foundation
- Enable **Lovable Cloud** (provisions Supabase).
- Provision **LOVABLE_API_KEY** for the AI assistant.
- Copy the `Frontend/` source from your repo into this project (routes, components, hooks, assets, styles).
- Replace placeholder `src/routes/index.tsx` with the real landing page.
- Set preview to mobile viewport.

## Phase 2 — Database (migration)
Port the SQLAlchemy models to Postgres tables with RLS + grants:
- `organisations`, `profiles` (linked to `auth.users`)
- `app_role` enum (`admin`, `rh`, `manager`, `collaborator`) + `user_roles` table + `has_role()` security-definer fn
- `employees`, `absences`, `documents`, `alerts`, `onboarding`, `offboarding`, `engagement`, `audit_logs`, `rag_chunks` (without pgvector if unsupported — use text search)
- RLS policies scoped by role (admin sees all, RH sees org, manager sees team, collaborator sees self)
- Storage bucket `documents` for file uploads (replaces MinIO)

## Phase 3 — Auth
- Supabase email/password auth (replaces Firebase).
- `/auth` page (sign in only — admins create accounts, no public signup for HR/Manager/Collab).
- `_authenticated/` layout gate (integration-managed).
- Trigger: on new `auth.users` insert → create `profiles` row.

## Phase 4 — Admin account creation
- `dashboard.admin.users.tsx`: form to create HR / Manager / Collaborator accounts (email, name, role, org).
- Server function `createUserAccount` using `supabaseAdmin.auth.admin.createUser` + assign role in `user_roles`.
- List/edit/disable users.

## Phase 5 — Backend port (TanStack server functions)
Replace each FastAPI router with `.functions.ts` server functions:
- `employees.functions.ts`, `absences.functions.ts`, `documents.functions.ts`, `alerts.functions.ts`, `onboarding.functions.ts`, `offboarding.functions.ts`, `engagement.functions.ts`, `dashboard.functions.ts`, `audit.functions.ts`, `assistant.functions.ts` (Lovable AI Gateway — Gemini), `admin.functions.ts`, `supervision.functions.ts`.
- All use `requireSupabaseAuth` middleware (RLS-scoped) except admin-only ones which check `has_role`.
- Audit logging via a shared helper.

## Phase 6 — Wire dashboards
Connect existing dashboard pages (`dashboard.admin/*`, `dashboard.rh/*`, `dashboard.manager/*`, `dashboard.collab/*`) to real server functions via TanStack Query.

## Phase 7 — Seed data
Insert a realistic dataset via migration: 1 organisation, ~25 employees across departments, varied absences (vacation/sick/remote), onboarding cohorts, documents, alerts, engagement scores, audit entries. Lets the app feel real on first load.

## Phase 8 — Rebrand & polish
- Logo/wordmark → **Wasl** with subtitle "by Humanai" everywhere it appears.
- Update `<title>`, meta description, OG tags, favicon.
- Manifest + apple-touch-icon for PWA install.
- Mobile-first responsive review of dashboard layouts.

## Technical notes
- The original `humain-ai-main/` Python code is **not** copied into this project — it would never run on Cloudflare Workers. It stays in your GitHub repo as historical reference.
- `firebase-admin` middleware is dropped; Supabase JWT validation replaces it.
- `pgvector` for RAG is replaced with Postgres full-text search (`tsvector`) — Lovable Cloud's Supabase may not have pgvector enabled by default. If you need true vector RAG later, we can enable the extension.
- `weasyprint` PDF generation has no Workers equivalent. PDF exports become **client-side** with `jspdf` or are dropped from v1.
- `minio` → Supabase Storage.
- `redis` caching → in-process / TanStack Query cache (Workers have no persistent Redis; KV is possible later).

## Delivery cadence
This is a multi-turn build. I'll start with **Phases 1–3** (foundation + DB + auth) in the next turn so we have a working signed-in shell, then iterate phase by phase. After each phase I'll check the preview and report what works.
