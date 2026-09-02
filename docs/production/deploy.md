# Deploy — Vercel + Supabase (Free Tier First)

## 1. GitHub

```bash
# ที่เครื่องคุณ
git remote add origin https://github.com/<your-user>/kanluem.git
git push -u origin master
```

## 2. Supabase

1. สร้าง project ที่ https://supabase.com (Free)
2. Settings → API → Copy `Project URL` + `anon key` + `service_role key` (server only)
3. SQL Editor → รัน migrations ตามลำดับ:
   - `supabase/migrations/00001_profiles.sql`
   - `00002_families.sql` → `00003_invitations.sql` → `00004_reminders.sql` → `00005_notifications.sql` → `00006_vehicles.sql` → `00007_medications.sql` → `00008_appointments.sql` → `00009_home.sql` → `00010_finance.sql` → `00011_documents.sql` → `00012_voice.sql` → `00013_history.sql`
   - หรือ `supabase db push` ถ้าติดตั้ง CLI
4. Auth → Providers → Enable Google → ใส่ Client ID/Secret (จาก Google Cloud Console) → Redirect URL: `https://<project>.supabase.co/auth/v1/callback`
5. Storage → Create bucket `documents` → **Private** (ไม่ public) → Policies: allow family_members RLS (ดู `00011_documents.sql` comment)

## 3. Vercel

1. Import GitHub repo ที่ https://vercel.com/new
2. Framework: Next.js (auto)
3. Environment Variables (Production + Preview):
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon>
   SUPABASE_SERVICE_ROLE_KEY=<service> # เฉพาะ server, ห้าม NEXT_PUBLIC
   ```
4. Deploy → ได้ URL `https://kanluem.vercel.app`
5. Supabase → Auth → URL Configuration → Site URL = `https://kanluem.vercel.app` → Additional Redirect: `https://kanluem.vercel.app/auth/callback`

## 4. Verify

```bash
# หลัง deploy
pnpm build # 26/26
pnpm vitest run # 76 passed
# เปิด https://kanluem.vercel.app/login → Google → Onboarding → Create Family → Invite QR → Dashboard
```

## 5. PWA

- `public/manifest.json` + `next-pwa` → Installable, standalone
- หลัง deploy ทดสอบ Add to Home Screen บนมือถือ

## 6. Free Tier Notes

- Vercel Hobby: 100GB bandwidth, Serverless 100GB-Hrs
- Supabase Free: 500MB DB, 1GB Storage, 2GB bandwidth, 50k MAU
- ตรวจสอบ quota ก่อน Production (อาจเปลี่ยน)

## 7. Rollback

```bash
git log --oneline # 26 commits b3fcd9a → 1e4d079
git revert <commit>
vercel --prod # redeploy
```

Ready: `docs/production/checklist.md:1` — Backup/PITR, Monitoring, Recovery, Env verified
