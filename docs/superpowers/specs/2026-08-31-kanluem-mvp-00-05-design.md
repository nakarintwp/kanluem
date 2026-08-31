# KANLUEM MVP 00-05 — Design Spec

**Version:** 1.0.0  
**Date:** 2026-08-31  
**Scope:** Phase 00-05 (Foundation → Dashboard Today)  
**Stack:** Next.js 15 App Router + TypeScript + Tailwind + shadcn/ui + Supabase + Vercel + PWA  
**Approach:** Feature-Sliced Monolith (Approved)  
**Style:** Minimal Clean, Thai Primary, Mobile-First  
**Status:** Design Approved → Ready for Mockup → Implementation

---

## 1. Goals & Non-Goals

### Goals (MVP)
- ใช้งานจริงได้ด้วย Google Login → Create/Join Family → Invite QR → Reminder CRUD → Dashboard Today
- Security First: RLS ทุก table ครอบครัว, Private Storage, ไม่ส่ง Service Role ไป Browser
- ทำทีละ Phase พร้อมหลักฐานเต็มรูปแบบ (Test Matrix + Build Log + RLS + Screenshot + Gate Report)
- Mockup interactive ก่อนโค้ดทุก Phase

### Non-Goals (เลื่อนไปหลัง MVP)
- Voice/STT, AI Intent, OCR, LINE/Telegram, Offline Sync, Finance/Home/Medication/Vehicle เต็มระบบ
- รองรับภาษาอื่นนอกจากไทยใน MVP, Payment, Admin Panel แยก

---

## 2. Architecture Overview

```
Browser (PWA) ──→ Next.js 15 App Router (Vercel)
                   ├── app/ (RSC + Client Components)
                   ├── components/ui (shadcn)
                   ├── features/* (family, reminders, dashboard)
                   ├── lib/supabase (client/server/middleware)
                   └── middleware.ts (auth guard)
                           │
Supabase ──────────┼── Auth (Google OAuth PKCE)
                   ├── Postgres + RLS
                   ├── Storage (private buckets)
                   └── Realtime (reminder updates)
```

- SSR/SSG ใช้ Server Components เป็นหลัก, Client เฉพาะ interactive
- PWA: `next-pwa` หรือ `serwist`, `public/manifest.json`, icons 192/512, standalone, offline cache shell
- Env: `NEXT_PUBLIC_SUPABASE_URL/ANON_KEY` client, `SUPABASE_SERVICE_ROLE_KEY` เฉพาะ server/edge เท่านั้น

---

## 3. Project Structure & Conventions

```
kanluem/
├── app/
│   ├── layout.tsx, globals.css
│   ├── (auth)/login/page.tsx
│   ├── (onboarding)/onboarding/page.tsx
│   ├── (protected)/dashboard/page.tsx
│   ├── (protected)/reminders/page.tsx
│   ├── (protected)/family/page.tsx
│   ├── (protected)/family/invite/page.tsx
│   └── api/ (เฉพาะถ้าจำเป็น, เน้น Server Actions)
├── components/
│   ├── ui/ (shadcn: button, card, dialog, input, etc.)
│   └── layout/ (Header, BottomNav, Sidebar)
├── lib/
│   ├── supabase/{client.ts, server.ts, middleware.ts}
│   ├── auth/{guards.ts, roles.ts}
│   └── utils.ts
├── features/
│   ├── family/{components, hooks, schemas}
│   ├── reminders/{components, hooks, schemas}
│   └── dashboard/{components}
├── supabase/
│   ├── migrations/
│   ├── seed/
│   └── config.toml
├── tests/{unit,integration,e2e}
├── public/{icons, manifest.json}
├── mockups/ (HTML interactive)
├── docs/superpowers/specs/
└── README.md
```

Conventions:
- DB: `snake_case`, TS: `camelCase`, RLS ทุก table มี `family_id`
- TypeScript `strict:true`, `eslint` + `prettier`, `pnpm` (หรือ `npm`), `zod` validate input
- Commit: `feat(phase-00): ...`, `fix(phase-01): ...`

---

## 4. Data Model & RLS (MVP 00-05)

### 4.1 Tables

**profiles** (Phase 00-01)
```sql
profiles(id uuid PK FK auth.users, email text, display_name text, avatar_url text, created_at timestamptz)
```

**families** (Phase 02)
```sql
families(id uuid PK, name text not null, created_by uuid FK profiles, created_at timestamptz)
```

**family_members** (Phase 02)
```sql
family_members(id uuid PK, family_id uuid FK families, user_id uuid FK profiles, role text check (owner/admin/member/viewer), joined_at timestamptz, unique(family_id,user_id))
```

**family_invitations** (Phase 03)
```sql
family_invitations(
  id uuid PK, family_id uuid FK, code text unique, -- e.g. KAN-8F42
  created_by uuid, expires_at timestamptz, max_uses int, used_count int default 0,
  status text check (active/used/expired/revoked), created_at timestamptz
)
-- QR payload = code only, ไม่ใส่ PII
```

**reminders** (Phase 04)
```sql
reminders(
  id uuid PK, family_id uuid FK, created_by uuid FK, assignee uuid FK nullable,
  title text not null, description text, category text, -- vehicle/medical/appointment/home/finance/other
  due_at timestamptz not null, timezone text default 'Asia/Bangkok',
  recurrence text, -- null/one-time/daily/weekly/monthly/yearly/custom (jsonb)
  reminder_offsets int[] default '{60,1440}', -- minutes before
  priority text check (low/medium/high), status text check (pending/done/snoozed/skipped),
  visibility text check (family/private/specific), linked_entity jsonb, created_at timestamptz
)
reminder_occurrences(id uuid PK, reminder_id uuid FK, occurs_at timestamptz, status text)
```

### 4.2 RLS Policy (บังคับที่ DB)

```sql
-- ทุก query ต้องผ่าน family_members
create policy "family access" on reminders for all using (
  exists (select 1 from family_members where family_members.family_id = reminders.family_id and family_members.user_id = auth.uid())
);
-- family_invitations: owner/admin สร้าง/revoke ได้, ผู้อื่น join ได้ถ้า code active
-- families: member อ่านได้, owner ลบ/แก้ได้
```

Service Role ห้ามใช้ใน Client Component โดยเด็ดขาด

### 4.3 Storage
- Bucket `documents` private, RLS ตรวจ `family_id` ผ่าน metadata, ไม่ใช้ public bucket (Blueprint §15)

---

## 5. Auth / Family / Invite Flows

### 5.1 Auth (Phase 01)
- Supabase Auth Google OAuth PKCE, `lib/supabase/middleware.ts` refresh session, `middleware.ts` guard `/(protected)/*`
- Routes: `/login` (Google button), callback `/auth/callback`, `/logout` signOut + redirect
- Empty/Loading/Error states ครบ, Thai copy

### 5.2 Family (Phase 02)
- Onboarding: ถ้า `family_members` ไม่มี → `/onboarding` ให้เลือก Create / Join
- Create Family: form name → insert families → insert family_members role=owner → redirect dashboard
- Roles: owner (ลบ/เชิญ/เปลี่ยน role), admin (เชิญ/จัดการข้อมูล), member (CRUD), viewer (read)

### 5.3 Invite Code + QR (Phase 03)
- Owner/Admin → `/family/invite` → เลือก expire 1h/1d/7d/never + max_uses → gen code `KAN-XXXX` → แสดง QR (qrcode.react) + Copy
- Actions: Revoke, Regenerate
- Join: `/join` หรือ `/onboarding` → กรอก code / scan QR → validate active/not expired/uses < max → insert family_members
- QR ห้ามฝัง PII, เก็บแค่ code

---

## 6. Reminder Engine & Dashboard

### 6.1 Reminder (Phase 04)
- CRUD ที่ `/reminders` + Quick Create จาก Dashboard
- Fields: title*, due_at* (date+time), category, assignee (เลือกสมาชิกครอบครัว), priority, recurrence, offsets
- Status: pending → done/snoozed/skipped, snooze เลือก 10m/1h/1d/custom
- Validation: zod, timezone Asia/Bangkok, due_at ไม่ย้อนอดีต (ยกเว้น edit)
- Realtime: subscribe `reminders` filter `family_id`

### 6.2 Dashboard Today (Phase 05)
- Route `/dashboard` (protected, Mobile BottomNav: Today/Calendar/Reminders/Documents/Family/More)
- Sections:
  1. Header: ชื่อครอบครัว + Notification bell
  2. Today: reminders due today (overdue แยกสีแดง)
  3. Upcoming 7 วัน
  4. Quick Actions: 🎤 (disabled stub), ➕ Reminder, 📷 Document stub, 🚗/💊/📅 stubs
  5. Summary cards: พลาด/วันนี้/กำลังมา
- Desktop: Sidebar + Main + Notification Panel (Blueprint §23)

---

## 7. Navigation & UX

- Mobile BottomNav 6 tab (Today Active เข้ม), FAB ➕ กลาง
- Desktop Sidebar collapsible, Thai label
- Design tokens: `primary` sky-600, `muted` slate-100, radius `0.75rem`, font `Noto Sans Thai` + `Inter`, `shadcn` default theme minimal clean
- States ทุกหน้า: Loading skeleton, Empty (illustration + CTA), Error (retry), Permission denied

---

## 8. Security & Compliance

- RLS audit ทุก migration, `supabase test` หรือ SQL check `auth.uid()` path
- Input validation `zod` ทั้ง client/server, rate limit เตรียมไว้ (Phase 22)
- No secrets in repo, `.env.example` มี placeholder, Vercel Env จริง
- Document storage private only, signed URL expiry 60s

---

## 9. Testing & Verification

- Unit: `vitest` → lib/utils, schemas, rls helpers
- Integration: `vitest` + supabase local → CRUD + RLS cross-family negative test
- E2E: `playwright` → login mock, create family, invite, reminder flow, dashboard render
- Lint/Type/Build: `tsc --noEmit`, `eslint`, `pnpm build` ต้องผ่านทุก Phase
- PWA: Lighthouse PWA score, installable check

---

## 10. Mockup Strategy (ก่อนโค้ด)

- ไฟล์ `mockups/index.html` รวมทุกหน้า แยก section พร้อม switch Mobile/Desktop toggle (JS)
- Pages: Login, Onboarding, Create Family, Invite+QR, Reminders List+Form, Dashboard Today
- Interactive: bottom nav click, dialog open, form validation mock, QR mock
- ส่งเป็น HTML เปิดใน browser ได้เลย ไม่ต้องรัน server
- อนุมัติ Mockup ก่อนเริ่ม Phase 00 implementation

---

## 11. Phase Roadmap & Gates (MVP)

| Phase | Scope | Acceptance | Gate Evidence |
|-------|-------|------------|---------------|
| 00 | Next.js+TS+Tailwind+shadcn+PWA baseline, supabase init, conventions, CI | `pnpm build` ผ่าน, PWA manifest, icons, no critical bug | Build log + Lighthouse + Screenshot |
| 01 | Google OAuth, session, protected routes, profile | Login/logout ทำงาน, guard redirect ถูก | E2E login + RLS profile + Screenshot |
| 02 | Family create, roles, member list | Owner สร้าง Family ได้, role แยกสิทธิ์ | Integration family_members + Screenshot |
| 03 | Invite code/QR, expire, revoke, join | QR สร้าง/หมดอายุ/revoke/join ข้าม account ได้ | Integration invite + E2E join + Screenshot |
| 04 | Reminder CRUD + recurrence + snooze | CRUD ครบ, ไม่ข้าม family | Unit+Integration + Test Matrix + Screenshot |
| 05 | Dashboard Today + Upcoming + Quick Actions | แสดง today/upcoming/overdue ถูกต้อง | E2E dashboard + Screenshot mobile/desktop |

**Mandatory Gate ทุก Phase (Blueprint §25):**
- Test Matrix ครบ, Bug Loop ผ่าน, TS/Lint/Build ผ่าน, RLS ผ่าน (ถ้าเกี่ยว), Critical bugs 0, Mobile UI ผ่าน, มี Loading/Empty/Error, Permission ถูกต้อง
- ห้ามเริ่ม Phase ถัดไปจน Gate ผ่าน

**Definition of Done (§31):** ครบ 13 ข้อ + Phase Gate Report ที่ `docs/gate-reports/phase-XX.md`

---

## 12. Risks & Mitigations

- Supabase Free quota เปลี่ยน → บันทึก quota check ก่อน prod, ออกแบบ query ให้ประหยัด
- Web Push ต้อง HTTPS + Service Worker → ใช้ Vercel HTTPS อัตโนมัติ, fallback เป็น In-App ก่อน
- QR/Invite abuse → rate limit, max_uses, expire, revoke log
- Timezone ผิด → เก็บ `timezone` ทุก reminder, แปลงด้วย `date-fns-tz`

---

## 13. Next Steps

1. ทำ Mockup HTML interactive → รออนุมัติ
2. เขียน `plans/` แยก Phase 00-05 (task ย่อย + test plan)
3. เริ่ม Phase 00 Foundation ทันทีหลัง Mockup อนุมัติ

---

*End of Spec — รอ Spec Review ก่อน lock*
