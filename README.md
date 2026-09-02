# KANLUEM กันลืม — Family Life Assistant

Next.js 15 + TypeScript + Tailwind + shadcn/ui + Supabase + Vercel + PWA

> Capture once → Understand → Organize → Remind → Keep history

## Quick Start

```bash
pnpm install
cp .env.example .env.local # ใส่ Supabase URL/Keys
pnpm dev # http://localhost:3000
```

## Mockup (ก่อนโค้ด)

ดับเบิลคลิก `mockups/index.html:1` — 7 หน้า Mobile/Desktop toggle

## Spec & Plan

- Spec: `docs/superpowers/specs/2026-08-31-kanluem-mvp-00-05-design.md:1`
- Plan: `docs/superpowers/plans/2026-08-31-kanluem-mvp-00-05.md:1`
- Gate Reports: `docs/gate-reports/phase-*.md` (26 phases 00-25)
- Production: `docs/production/checklist.md:1` + `docs/production/deploy.md:1`

## Testing

```bash
pnpm vitest run # 76 passed (35 files)
pnpm tsc --noEmit
pnpm build # 26/26 routes
```

## Deploy

ดู `docs/production/deploy.md:1` — Vercel + Supabase Free Tier

## Project Structure

```
app/(auth)/login, (protected)/dashboard, family, reminders, calendar, ...
features/{family, reminders, vehicles, ...}
supabase/migrations/00001_*.sql → 00013_*.sql
tests/unit, tests/integration
```

26 commits `b3fcd9a → 1e4d079` — 76 tests, 26 routes, 13 migrations, middleware 63.6kB, sw.js 5559B
