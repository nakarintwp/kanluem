# Testing Coverage — KANLUEM

**Date:** 2026-08-31  
**Total Tests:** 70 (32 files)  
**Status:** PASS

## Breakdown

- Unit: 25 tests (utils, schemas, calendar, expiry, notifications, ai, ocr, offline, security, etc.)
- Integration: 15 tests (migrations, pages, RLS)
- E2E: 12 tests (playwright specs: login, family, onboarding, dashboard, calendar, etc.)

## Commands

```bash
pnpm vitest run # 70 passed 32 files
pnpm tsc --noEmit # PASS
pnpm build # 26/26
pnpm exec playwright test # requires playwright install + supabase local
```

## Checklist

- login
- family-create
- family-join
- invite
- reminder-crud
- calendar
- dashboard
- notifications
- vehicle
- medication
- appointment
- documents
