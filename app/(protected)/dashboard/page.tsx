import { createServerClientSSR } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { TodaySection } from "@/features/dashboard/components/TodaySection"
import { QuickActions } from "@/features/dashboard/components/QuickActions"
import { BottomNav } from "@/components/layout/BottomNav"

export default async function DashboardPage() {
  const supabase = await createServerClientSSR()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: members } = await supabase.from("family_members").select("family_id, families(name)").eq("user_id", user.id).limit(1).single()
  const fam = members as unknown as { family_id: string; families: { name: string } } | null
  if (!fam) redirect("/onboarding")

  const { data: reminders } = await supabase
    .from("reminders")
    .select("id, title, due_at, category, priority, status")
    .eq("family_id", fam.family_id)
    .order("due_at", { ascending: true })

  const now = new Date()
  const todayStr = now.toISOString().slice(0, 10)
  const all = (reminders as unknown as { id: string; title: string; due_at: string; category: string; priority: string; status: string }[]) || []
  const overdue = all.filter((r) => new Date(r.due_at) < now && r.status === "pending")
  const today = all.filter((r) => r.due_at.slice(0, 10) === todayStr && r.status === "pending")
  const upcoming = all.filter((r) => new Date(r.due_at) > now && r.due_at.slice(0, 10) !== todayStr && r.status === "pending").slice(0, 10)

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b p-4">
        <div className="flex items-center gap-2">
          <div>
            <div className="font-bold">สวัสดี, {user.email?.split("@")[0]} 👋</div>
            <div className="text-xs text-slate-500">{fam.families.name} • {now.toLocaleDateString("th-TH", { weekday: "long", day: "numeric", month: "short", year: "numeric" })}</div>
          </div>
          <div className="ml-auto w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center relative">
            🔔<span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">{overdue.length + today.length}</span>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-3">
          <div className="bg-red-50 border border-red-200 rounded-xl p-2 text-center">
            <div className="text-lg font-bold text-red-600">{overdue.length}</div>
            <div className="text-[11px] text-red-700">เกินกำหนด</div>
          </div>
          <div className="bg-sky-50 border border-sky-200 rounded-xl p-2 text-center">
            <div className="text-lg font-bold text-sky-700">{today.length}</div>
            <div className="text-[11px] text-sky-700">วันนี้</div>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-2 text-center">
            <div className="text-lg font-bold text-amber-700">{upcoming.length}</div>
            <div className="text-[11px] text-amber-700">7 วันข้างหน้า</div>
          </div>
        </div>
      </header>

      <div className="flex-1 p-4 space-y-4 overflow-auto">
        <TodaySection overdue={overdue} today={today} upcoming={upcoming} />
        <QuickActions />
        {all.length === 0 && (
          <div className="bg-white border rounded-xl p-4 text-center text-sm text-slate-500">ยังไม่มี Reminder — เริ่มที่ <a href="/reminders" className="text-sky-600 underline">สร้าง Reminder แรก</a></div>
        )}
      </div>

      <BottomNav active="today" />
    </main>
  )
}
