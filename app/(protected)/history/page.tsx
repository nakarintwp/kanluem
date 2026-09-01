import { createServerClientSSR } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BottomNav } from "@/components/layout/BottomNav"

export default async function HistoryPage() {
  const supabase = await createServerClientSSR()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")
  const { data: mem } = await supabase.from("family_members").select("family_id").eq("user_id", user.id).limit(1).single()
  const familyId = (mem as unknown as { family_id: string } | null)?.family_id
  if (!familyId) redirect("/onboarding")

  const { data: logs } = await supabase.from("audit_logs").select("*").eq("family_id", familyId).order("created_at", { ascending: false }).limit(50)

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b p-4">
        <h1 className="font-bold">ประวัติ 📜</h1>
        <p className="text-xs text-slate-500">Activity • Changes • Reminder/Document history</p>
      </header>
      <div className="flex-1 p-4 space-y-4 overflow-auto max-w-2xl mx-auto w-full">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">ตัวกรอง</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-2 text-xs">
            <span className="bg-slate-900 text-white px-3 py-1 rounded-full">ทั้งหมด</span>
            <span className="border px-3 py-1 rounded-full">Reminder</span>
            <span className="border px-3 py-1 rounded-full">Document</span>
            <span className="border px-3 py-1 rounded-full">Vehicle</span>
          </CardContent>
        </Card>
        <div className="space-y-2">
          {(!logs || logs.length === 0) && (
            <Card>
              <CardContent className="py-6 text-center text-sm text-slate-400">ยังไม่มีประวัติ — การเปลี่ยนแปลงจะถูกบันทึกที่นี่ (audit_logs)</CardContent>
            </Card>
          )}
          {logs?.map((l: { id: string; action: string; entity_type: string; entity_id: string | null; created_at: string }) => (
            <Card key={l.id}>
              <CardContent className="py-3 flex gap-3 items-center">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-xs">📝</div>
                <div className="flex-1">
                  <div className="text-sm font-medium">
                    {l.action} {l.entity_type} {l.entity_id ? `• ${l.entity_id.slice(0, 8)}` : ""}
                  </div>
                  <div className="text-xs text-slate-500">{new Date(l.created_at).toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}</div>
                </div>
                <span className="text-[10px] border rounded-full px-2 py-1">{l.entity_type}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      <BottomNav active="more" />
    </main>
  )
}
