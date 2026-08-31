# KANLUEM — กันลืม Family Life Assistant
## Master Blueprint & Phase Roadmap

**Version:** 1.0.0  
**วันที่:** 2026-08-31  
**สถานะ:** Blueprint / Ready for Phase 00  
**เป้าหมาย:** Web App + PWA สำหรับครอบครัว ใช้บันทึกเรื่องต่าง ๆ และแจ้งเตือนอัตโนมัติ โดยรองรับการพูดบันทึก, เอกสาร, รถ, ยา/สุขภาพ, นัดหมาย, บ้าน, การเงิน และข้อมูลครอบครัว

---

# 1. Product Vision

KANLUEM คือ Family Life Assistant ที่ช่วยให้สมาชิกครอบครัว “ไม่ต้องจำเอง”

ผู้ใช้สามารถ:
- พิมพ์หรือพูดสิ่งที่ต้องทำ
- สร้าง Reminder แบบครั้งเดียวหรือทำซ้ำ
- บันทึกข้อมูลรถ ยา นัดหมาย บ้าน การเงิน และเรื่องอื่น ๆ
- เก็บเอกสารสำคัญ
- ผูกวันหมดอายุของเอกสารกับ Reminder
- แชร์ข้อมูลภายในครอบครัว
- รับ Notification บนมือถือ
- ติดตั้งเป็น PWA เหมือน App
- ใช้ Google Account เข้าสู่ระบบ

หลักการสำคัญ:

> Capture once → Understand → Organize → Remind → Confirm → Keep history

---

# 2. Technology Stack

## Frontend
- Next.js
- TypeScript
- Tailwind CSS
- PWA
- Responsive / Mobile First

## Hosting
- Vercel Hobby / Free

## Backend / Database
- Supabase
- PostgreSQL
- Supabase Auth
- Supabase Storage
- Supabase Realtime
- Supabase Edge Functions ตามความเหมาะสม

## Authentication
- Google OAuth ผ่าน Supabase Auth
- ไม่มี Local Password ใน V1

## AI
- Speech-to-Text
- LLM สำหรับแยก Intent / Date / Time / Category / Person / Reminder
- ออกแบบ AI Provider เป็น abstraction เพื่อเปลี่ยน provider ได้

## Notification
- Web Push
- Notification Center ภายในระบบ
- LINE / Telegram เป็น Phase ถัดไป

---

# 3. Free-Tier First Strategy

V1 ต้องออกแบบให้ใช้งานบน Free Tier ก่อน:
- Vercel Free
- Supabase Free
- Google OAuth
- PWA
- Web Push

ไม่ผูกกับ VPS

ข้อจำกัดของ Free Tier ต้องตรวจสอบกับผู้ให้บริการอีกครั้งก่อน Production เพราะ quota และเงื่อนไขอาจเปลี่ยนได้

---

# 4. Authentication & Family Security

## 4.1 Login

```text
User
 ↓
Google Login
 ↓
Supabase Auth
 ↓
User Profile
 ↓
Create Family OR Join Family
```

ไม่มีการอนุญาตให้ Gmail ใด ๆ เข้าครอบครัวโดยอัตโนมัติ

## 4.2 Family Owner

สมาชิกคนแรก:
1. Login Google
2. Create Family
3. กลายเป็น Owner
4. ระบบสร้าง Invitation
5. แสดง Invite Code + QR Code

ตัวอย่าง:

```text
Family: ครอบครัวทองวุฒิพันธ์
Invite Code: KAN-8F42
```

## 4.3 Join Family

สมาชิกใหม่:
1. เปิด KANLUEM
2. กด Join Family
3. Scan QR หรือกรอก Invite Code
4. Login Google
5. ตรวจสอบ Invitation
6. สร้าง Family Membership
7. กำหนด Profile / Role

## 4.4 Invitation Rules

Invitation ต้องรองรับ:
- Expire 1 ชั่วโมง
- Expire 1 วัน
- Expire 7 วัน
- ไม่หมดอายุ
- จำกัดจำนวนครั้ง
- Revoke
- Regenerate
- Active / Used / Expired / Revoked

ห้ามใส่ข้อมูลส่วนตัวสำคัญไว้ใน QR โดยตรง

---

# 5. Roles

## Owner
- จัดการ Family
- จัดการสมาชิก
- จัดการ Invitation
- จัดการสิทธิ์
- เข้าถึงข้อมูลที่ Owner มีสิทธิ์
- ลบ Family

## Admin
- จัดการสมาชิกตามสิทธิ์
- จัดการข้อมูลครอบครัว
- จัดการ Reminder / Documents

## Member
- สร้าง Reminder
- แก้ไขข้อมูลที่ได้รับอนุญาต
- สร้างเอกสาร
- ดูข้อมูลตาม Permission

## Viewer
- อ่านข้อมูลที่ได้รับอนุญาต
- ไม่แก้ไขข้อมูลสำคัญ

---

# 6. Main Modules

```text
KANLUEM
├── Dashboard / Today
├── Calendar
├── Reminders
├── Voice / AI
├── Family
├── Vehicles
├── Medication / Health
├── Appointments
├── Home
├── Finance
├── Documents
├── Notifications
├── History
└── Settings
```

---

# 7. Reminder Engine

Reminder เป็น Core Engine ของระบบ

รองรับ:
- One-time
- Daily
- Weekly
- Monthly
- Yearly
- Custom recurrence
- วันหมดอายุ
- เตือนก่อนกำหนด
- หลายช่วงเวลา
- Snooze
- Complete
- Skip
- Reschedule

ข้อมูลหลัก:

```text
Reminder
├── title
├── description
├── category
├── family_id
├── created_by
├── assignee
├── due_at
├── timezone
├── recurrence
├── reminder_offsets
├── priority
├── status
├── visibility
└── linked_entity
```

---

# 8. Smart Reminder

ระบบควรเข้าใจข้อความธรรมชาติ

ตัวอย่าง:

> พรุ่งนี้ 8 โมงเอา Civic ไปเปลี่ยนน้ำมันเครื่อง

แปลงเป็น:

```text
Category: Vehicle
Vehicle: Civic
Task: เปลี่ยนน้ำมันเครื่อง
Date: tomorrow
Time: 08:00
Assignee: current user
Reminder: 1 day, 1 hour
```

ระบบต้องแสดง Preview ก่อนบันทึก

```text
ผมเข้าใจว่า

🚗 Civic
🔧 เปลี่ยนน้ำมันเครื่อง
📅 1 ก.ย. 2026
⏰ 08:00

[บันทึก] [แก้ไข]
```

---

# 9. Voice Input

Flow:

```text
🎤
 ↓
Record Audio
 ↓
Speech-to-Text
 ↓
Intent Parser
 ↓
Entity Extraction
 ↓
Reminder Draft
 ↓
User Confirm
 ↓
Database
```

ต้องรองรับภาษาไทยเป็นหลัก และ English ในอนาคต

กรณีข้อมูลไม่ครบ ให้ถามเฉพาะ field ที่จำเป็น

---

# 10. Vehicle Module

ข้อมูล:
- Brand
- Model
- Registration
- Year
- VIN/ข้อมูลระบุรถตามความเหมาะสม
- Current Mileage
- Insurance
- Compulsory Insurance
- Tax
- Service
- Oil Change
- Tire
- Battery
- Repair History
- Expense

ระบบสามารถสร้าง Reminder จาก:
- วันหมดอายุ
- ระยะทาง
- รอบเวลา

---

# 11. Medication / Health Module

รองรับ:
- ชื่อยา
- ขนาด
- จำนวน
- หน่วย
- เวลา
- ความถี่
- วันเริ่ม
- วันสิ้นสุด
- จำนวนคงเหลือ
- เตือนยาใกล้หมด
- นัดแพทย์
- เอกสารเกี่ยวข้อง

หมายเหตุ:
ระบบเป็นเครื่องมือบันทึกและแจ้งเตือน ไม่ควรให้ AI วินิจฉัยหรือเปลี่ยนคำสั่งแพทย์เอง

---

# 12. Appointment Module

รองรับ:
- หมอ
- โรงพยาบาล
- โรงเรียน
- ธนาคาร
- หน่วยงาน
- นัดส่วนตัว
- นัดครอบครัว

Fields:
- Title
- Date
- Time
- Location
- Person
- Assignee
- Notes
- Attachments
- Reminder

---

# 13. Home Module

ตัวอย่าง:
- ค่าไฟ
- ค่าน้ำ
- Internet
- ล้างแอร์
- เปลี่ยนไส้กรอง
- ซ่อมบ้าน
- เครื่องใช้ไฟฟ้า
- ประกันบ้าน
- งานประจำ

รองรับ Recurring Reminder

---

# 14. Finance Module

ตัวอย่าง:
- บัตรเครดิต
- ค่างวด
- ค่าโทรศัพท์
- ประกัน
- ค่าเรียน
- Subscription
- ค่าสาธารณูปโภค

สามารถกำหนด:
- วันครบกำหนด
- จำนวนเงิน
- รอบบิล
- ผู้รับผิดชอบ
- Reminder

---

# 15. Document Center

เอกสารเป็น Module หลัก

```text
Documents
├── All Documents
├── Vehicle
├── Medical
├── Insurance
├── Bills / Receipts
├── School
├── Personal
└── Other
```

รองรับ:
- PDF
- JPG
- PNG
- WEBP

Metadata:
```text
Document
├── family_id
├── uploaded_by
├── name
├── category
├── owner
├── related_entity
├── issue_date
├── expiry_date
├── document_number
├── issuer
├── notes
├── tags
├── storage_path
└── permission
```

เอกสารต้องเป็น Private Storage

ห้ามใช้ Public Bucket สำหรับเอกสารครอบครัว

---

# 16. Document Expiry Reminder

ตัวอย่าง:

```text
กรมธรรม์รถ
หมดอายุ 15/12/2026

Reminder:
60 วันก่อน
30 วันก่อน
7 วันก่อน
1 วันก่อน
```

สามารถเลือกชุด Reminder ได้

---

# 17. OCR Document

Phase ถัดไปสามารถเพิ่ม:

```text
Upload / Camera
 ↓
OCR
 ↓
Extract Date
 ↓
Extract Document Number
 ↓
Extract Person / Vehicle
 ↓
Suggest Reminder
 ↓
User Confirm
```

ห้ามสร้าง Reminder สำคัญโดยไม่ให้ผู้ใช้ยืนยันเมื่อ OCR มีความไม่แน่นอน

---

# 18. Family Permission

แต่ละข้อมูลควรกำหนด:

```text
Visibility
├── Family
├── Owner/Admin
├── Specific Members
└── Private
```

ตัวอย่าง:
- นัดลูก → พ่อ + แม่
- เอกสารประกันรถ → พ่อ + แม่
- Reminder ส่วนตัว → Private
- ค่าไฟ → Family

---

# 19. Notification Center

สถานะ:
- Scheduled
- Sent
- Delivered
- Read
- Failed
- Snoozed
- Dismissed

ช่องทาง V1:
- In-App
- Web Push

Future:
- LINE
- Telegram
- Email

---

# 20. PWA

ต้องรองรับ:
- Installable
- App Icon
- Splash Screen
- Standalone Mode
- Responsive
- Mobile First
- Offline Cache
- Sync เมื่อกลับ Online

ข้อจำกัด Offline:
- ข้อมูลที่เปลี่ยนแปลงต้องใช้ local queue
- Conflict ต้องมี strategy
- Reminder สำคัญต้องไม่พึ่ง browser ที่ปิดอยู่เพียงอย่างเดียว

---

# 21. Database Core

ตารางหลักที่คาดว่าจะมี:

```text
profiles
families
family_members
family_invitations

reminders
reminder_occurrences
reminder_notifications

vehicles
vehicle_services
vehicle_expenses

medications
medication_schedules
medication_logs

appointments

home_items
finance_items

documents
document_permissions

notifications
notification_preferences

voice_inputs
ai_extractions

audit_logs
```

Schema จริงต้องออกแบบและ migrate ใน Phase ที่เกี่ยวข้อง ไม่ควรสร้างทุกอย่างรวดเดียว

---

# 22. Supabase RLS

ทุก table ที่มีข้อมูลครอบครัวต้องมี RLS

หลักการ:

```text
auth.uid()
   ↓
family_members
   ↓
family_id
   ↓
access allowed
```

ห้ามพึ่งเฉพาะ Frontend filtering

Security ต้องบังคับที่ Database

Service Role Key:
- ห้ามส่งไป Browser
- ห้ามใส่ใน Client Component
- ใช้เฉพาะ Server/Edge Function ที่จำเป็น

---

# 23. Navigation

Mobile:

```text
Today
Calendar
Reminders
Documents
Family
More
```

Quick Actions:

```text
🎤 พูด
➕ Reminder
📷 Document
🚗 รถ
💊 ยา
📅 นัด
```

Desktop:
- Sidebar
- Dashboard
- Main Content
- Notification Panel

---

# 24. Phase Roadmap

## Phase 00 — Project Foundation & Architecture
- Repository
- Next.js
- TypeScript
- Tailwind
- PWA baseline
- Supabase project
- Environment
- Database conventions
- RLS conventions
- CI/basic verification
- Coding standards

## Phase 01 — Google Auth
- Supabase Auth
- Google OAuth
- Login / Logout
- Session
- Profile
- Protected Routes

## Phase 02 — Family
- Create Family
- Owner
- Family Profile
- Members
- Roles

## Phase 03 — Invite Code + QR
- Invitation
- Code
- QR
- Expiration
- Usage limit
- Revoke
- Join flow

## Phase 04 — Core Reminder Engine
- CRUD
- Due date/time
- Recurrence
- Priority
- Assignee
- Status
- Snooze
- Complete

## Phase 05 — Dashboard / Today
- Today
- Upcoming
- Overdue
- Quick Actions
- Summary

## Phase 06 — Calendar
- Month
- Week
- Day
- Reminder integration

## Phase 07 — Notification Center
- In-app
- Web Push
- Preferences
- Notification history

## Phase 08 — Vehicle
- Vehicle CRUD
- Mileage
- Service
- Insurance
- Tax
- Expiry Reminder

## Phase 09 — Medication / Health
- Medication
- Schedule
- Logs
- Refill Reminder
- Appointment linkage

## Phase 10 — Appointment
- Appointment CRUD
- People
- Location
- Reminder
- Attachments

## Phase 11 — Home
- Home items
- Maintenance
- Recurring reminders
- Utilities

## Phase 12 — Finance
- Bills
- Payment dates
- Recurring payments
- Reminder

## Phase 13 — Document Center
- Upload
- Storage
- Metadata
- Preview
- Download
- Permissions

## Phase 14 — Document Expiry
- Expiry dates
- Reminder rules
- Linked entities

## Phase 15 — Voice Input
- Audio recording
- Speech-to-text
- Draft creation

## Phase 16 — AI Assistant
- Intent extraction
- Thai natural language
- Date/time parsing
- Entity linking
- Confirmation workflow

## Phase 17 — OCR
- Document OCR
- Extraction
- Reminder suggestions

## Phase 18 — Family Intelligence
- Smart suggestions
- Repeated events
- Missing reminder detection
- Upcoming expiry detection

## Phase 19 — LINE / Telegram / External Notifications
- Provider abstraction
- User linking
- Delivery logs
- Preferences

## Phase 20 — Offline / Sync
- Local cache
- Mutation queue
- Retry
- Conflict handling

## Phase 21 — History / Audit
- Activity
- Changes
- Reminder history
- Document history

## Phase 22 — Security Hardening
- RLS audit
- Storage policy audit
- Input validation
- Rate limits
- Secrets
- Abuse protection

## Phase 23 — Testing
- Unit
- Integration
- E2E
- Security
- Mobile/PWA
- Notification
- AI parsing

## Phase 24 — Performance / Cost
- Supabase quota
- Vercel usage
- Query optimization
- Storage optimization
- AI cost controls

## Phase 25 — Production Readiness
- Backup strategy
- Monitoring
- Error handling
- Recovery
- Documentation
- Production deployment

---

# 25. Mandatory Gate ทุก Phase

ทุก Phase ต้องมี:

## Test Matrix
ระบุ:
- Feature
- Scenario
- Expected
- Actual
- Status

## Bug Loop

```text
Implement
 ↓
Test
 ↓
Bug
 ↓
Fix
 ↓
Retest
 ↓
Pass
```

## Automated Verification
อย่างน้อยตามความเหมาะสม:
- TypeScript check
- Lint
- Build
- Unit test
- Integration test
- E2E

## Phase Gate

ห้ามเริ่ม Phase ถัดไปจนกว่า:
- Acceptance Criteria ผ่าน
- Critical bugs = 0
- Build ผ่าน
- Security checks ผ่าน
- Database migration ผ่าน
- RLS ผ่านสำหรับ phase ที่เกี่ยวข้อง

## Production Readiness Gate

ก่อน Production:
- No critical security issue
- No broken authentication
- No cross-family data leakage
- Storage permissions verified
- Notification failure handled
- Backup/recovery plan
- Environment variables verified

---

# 26. Acceptance Principles

KANLUEM ต้องให้ความสำคัญตามลำดับ:

1. Security
2. Reliability
3. Simplicity
4. Mobile UX
5. Notification correctness
6. Data integrity
7. AI convenience

AI ห้ามทำให้ข้อมูลผิดแล้วบันทึกแบบเงียบ ๆ

---

# 27. V1 MVP

MVP ที่ควรทำให้ใช้งานจริงก่อน:

```text
Google Login
      ↓
Create / Join Family
      ↓
Invite Code / QR
      ↓
Dashboard
      ↓
Reminder
      ↓
Calendar
      ↓
Web Push
      ↓
Vehicle
Medication
Appointment
      ↓
Documents
      ↓
PWA
```

Voice + AI + OCR ทำหลัง Core Stable

---

# 28. Future Architecture

```text
                    KANLUEM
                       │
          ┌────────────┼────────────┐
          │            │            │
       Next.js      Supabase       AI Layer
          │            │            │
          │       PostgreSQL       STT
          │       Auth             LLM
          │       Storage          OCR
          │       Realtime
          │
         PWA
          │
    ┌─────┼─────┐
    │     │     │
  Push  LINE  Telegram
```

---

# 29. Development Rule

พัฒนาทีละ Phase เท่านั้น

เมื่อ Phase หนึ่งเสร็จ:
1. Run tests
2. ตรวจ Bug
3. ตรวจ Security
4. ตรวจ Build
5. ตรวจ Acceptance Criteria
6. ปิด Phase
7. จึงเริ่ม Phase ต่อไป

คำสั่งสำหรับการทำงานต่อ:

> **“ทำต่อ Phase XX”**

ตัวอย่าง:

> ทำต่อ Phase 00

ระบบควรสร้าง/แก้ไขเฉพาะ Scope ของ Phase ที่ระบุ และไม่ข้าม Gate โดยไม่ได้รับการยืนยัน

---

# 30. Initial Project Folder

```text
kanluem/
├── app/
├── components/
├── lib/
│   ├── supabase/
│   ├── auth/
│   ├── reminder/
│   ├── notification/
│   ├── ai/
│   └── storage/
├── features/
│   ├── family/
│   ├── reminders/
│   ├── vehicles/
│   ├── medication/
│   ├── appointments/
│   ├── home/
│   ├── finance/
│   └── documents/
├── public/
│   ├── icons/
│   └── manifest/
├── supabase/
│   ├── migrations/
│   ├── functions/
│   └── seed/
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── docs/
└── README.md
```

---

# 31. Definition of Done

Phase จะถือว่า Done เมื่อ:
- Feature ทำงานตาม Acceptance Criteria
- TypeScript ผ่าน
- Lint ผ่าน
- Build ผ่าน
- Tests ผ่านตาม Scope
- RLS ผ่าน
- ไม่มี Critical Bug
- Mobile UI ผ่าน
- Error state มี
- Loading state มี
- Empty state มี
- Permission ถูกต้อง
- Documentation ของ Phase ถูกอัปเดต

---

# 32. First Implementation Order

เริ่มจริงตามลำดับ:

```text
PHASE 00
Foundation
   ↓
PHASE 01
Google Auth
   ↓
PHASE 02
Family
   ↓
PHASE 03
Invite Code / QR
   ↓
PHASE 04
Reminder Engine
   ↓
PHASE 05
Dashboard
```

หลังจาก Core ใช้งานได้ จึงเพิ่ม Module อื่น ๆ

---

## Current Status

**Project:** KANLUEM  
**Architecture:** Next.js + Supabase + Vercel + PWA  
**Authentication:** Google OAuth via Supabase Auth  
**Family Access:** Invite Code / QR only  
**Database:** Supabase PostgreSQL  
**Documents:** Supabase Private Storage  
**Deployment:** Vercel  
**Cost Target:** Free Tier First  
**Development Mode:** Phase-by-Phase

**Next:** Phase 00 — Project Foundation & Architecture
