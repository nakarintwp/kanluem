import { createServerClientSSR } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { detectRepeated, upcomingExpiries } from "@/features/intelligence/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BottomNav } from "@/components/layout/BottomNav"

export default async function IntelligencePage() {
  const supabase = await createServerClientSSR()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")
  const { data: mem } = await supabase.from("family_members").select("family_id").eq("user_id", user.id).limit(1).single()
  const familyId = (mem as unknown as { family_id: string } | null)?.family_id
  if (!familyId) redirect("/onboarding")

  const { data: reminders } = await supabase.from("reminders").select("title, due_at").eq("family_id", familyId).limit(100)
  const { data: docs } = await supabase.from("documents").select("name, expiry_date").eq("family_id", familyId).limit(100)

  const repeated = detectRepeated((reminders as unknown as { title: string; due_at: string }[]) || [])
  const upcoming = upcomingExpiries((docs as unknown as { name: string; expiry_date: string | null }[]) || [], 30)

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b p-4">
        <h1 className="font-bold">Family Intelligence 🧠</h1>
        <p className="text-xs text-slate-500">Smart suggestions • Repeated • Upcoming expiry • Missing</p>
      </header>
      <div className="flex-1 p-4 space-y-4 overflow-auto max-w-2xl mx-auto w-full">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">เหตุการณ์ซ้ำๆ (Repeated)</CardTitle>
          </CardHeader>
          <CardContent>
            {repeated.length === 0 ? (
              <p className="text-xs text-slate-400">ยังไม่พบเหตุการณ์ซ้ำ — ต้องมี title เหมือนกัน ≥2 ครั้ง</p>
            ) : (
              <div className="space-y-1">
                {repeated.map((r) => (
                  <div key={r.title} className="flex justify-between text-sm border rounded-xl px-3 py-2">
                    <span>{r.title}</span>
                    <span className="text-xs bg-slate-100 px-2 py-1 rounded-full">{r.count} ครั้ง</span>
                  </div>
                ))}
              </div>
            )}
            <p className="text-[11px] text-slate-500 mt-2">เช่น &quot;จ่ายค่าไฟ&quot; ทุกเดือน → เสนอสร้าง Recurring Reminder</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">ใกล้หมดอายุ (30 วัน)</CardTitle>
          </CardHeader>
          <CardContent>
            {upcoming.length === 0 ? (
              <p className="text-xs text-slate-400">ไม่มีเอกสารใกล้หมดอายุใน 30 วัน</p>
            ) : (
              <div className="space-y-1">
                {upcoming.map((d) => (
                  <div key={d.name} className="flex justify-between text-sm border border-amber-200 bg-amber-50 rounded-xl px-3 py-2">
                    <span>{d.name}</span>
                    <span className="text-xs">{d.expiry_date}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-4 text-xs text-slate-500">Missing reminder detection — ตรวจสอบรายการที่ควรมีแต่ยังไม่มี (เช่น ประกันรถ) จะเพิ่มใน Phase ถัดไป</CardContent>
        </Card>
      </div>
      <BottomNav active="more" />
    </main>
  )
}
