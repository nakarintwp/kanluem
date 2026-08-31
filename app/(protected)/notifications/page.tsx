import { createServerClientSSR } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BottomNav } from "@/components/layout/BottomNav"

export default async function NotificationsPage() {
  const supabase = await createServerClientSSR()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: members } = await supabase.from("family_members").select("family_id").eq("user_id", user.id).limit(1).single()
  const familyId = (members as unknown as { family_id: string } | null)?.family_id
  if (!familyId) redirect("/onboarding")

  const { data: notifications } = await supabase
    .from("notifications")
    .select("*")
    .or(`family_id.eq.${familyId},user_id.eq.${user.id}`)
    .order("created_at", { ascending: false })
    .limit(20)

  const { data: prefs } = await supabase.from("notification_preferences").select("*").eq("user_id", user.id).single()

  const unreadCount = (notifications as unknown as { read_at: string | null }[] | null)?.filter((n) => !n.read_at).length || 0

  async function markRead(formData: FormData) {
    "use server"
    const { createServerClientSSR } = await import("@/lib/supabase/server")
    const supabase = await createServerClientSSR()
    const id = String(formData.get("id"))
    await supabase.from("notifications").update({ status: "read", read_at: new Date().toISOString() }).eq("id", id)
    revalidatePath("/notifications")
  }

  async function markAllRead() {
    "use server"
    const { createServerClientSSR } = await import("@/lib/supabase/server")
    const supabase = await createServerClientSSR()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from("notifications").update({ status: "read", read_at: new Date().toISOString() }).is("read_at", null).eq("user_id", user.id)
    revalidatePath("/notifications")
  }

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b p-4">
        <div className="flex items-center gap-2">
          <h1 className="font-bold">การแจ้งเตือน</h1>
          <span className="text-xs bg-slate-100 px-2 py-1 rounded-full">{notifications?.length || 0} รายการ</span>
          {unreadCount > 0 && <span className="text-xs bg-red-500 text-white px-2 py-1 rounded-full">{unreadCount} ยังไม่อ่าน</span>}
          <form action={markAllRead} className="ml-auto">
            <Button type="submit" variant="outline" size="sm">
              อ่านทั้งหมด
            </Button>
          </form>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2">
          <div className="bg-sky-50 border border-sky-200 rounded-xl p-2 text-center">
            <div className="text-xs text-sky-700">In-App</div>
            <div className="text-[11px] text-slate-500">{(prefs as unknown as { in_app_enabled: boolean } | null)?.in_app_enabled ?? true ? "เปิด" : "ปิด"}</div>
          </div>
          <div className="bg-slate-50 border rounded-xl p-2 text-center">
            <div className="text-xs">Web Push</div>
            <div className="text-[11px] text-slate-500">{(prefs as unknown as { web_push_enabled: boolean } | null)?.web_push_enabled ?? true ? "เปิด" : "ปิด"}</div>
          </div>
          <div className="bg-slate-50 border rounded-xl p-2 text-center opacity-60">
            <div className="text-xs">LINE/Telegram</div>
            <div className="text-[11px]">เร็วๆ นี้</div>
          </div>
        </div>
      </header>

      <div className="flex-1 p-4 space-y-3 overflow-auto">
        {(!notifications || notifications.length === 0) && (
          <Card>
            <CardContent className="py-8 text-center text-sm text-slate-500">
              ยังไม่มีการแจ้งเตือน — Reminder ที่ถึงเวลาจะมาแสดงที่นี่ + Web Push (Phase 07)
            </CardContent>
          </Card>
        )}

        {notifications?.map((n: { id: string; title: string; body: string | null; status: string; channel: string; created_at: string; read_at: string | null }) => (
          <Card key={n.id} className={n.read_at ? "opacity-60" : "border-sky-200 bg-sky-50/50"}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <span className="text-base">{n.channel === "web_push" ? "🔔" : n.status === "read" ? "✓" : "🔵"}</span>
                {n.title}
                <span className="ml-auto text-[10px] border rounded-full px-2 py-0.5 bg-white">{n.status}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {n.body && <p className="text-xs text-slate-600">{n.body}</p>}
              <div className="flex items-center justify-between mt-2">
                <span className="text-[11px] text-slate-400">{new Date(n.created_at).toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })} • {n.channel}</span>
                {!n.read_at && (
                  <form action={markRead}>
                    <input type="hidden" name="id" value={n.id} />
                    <Button type="submit" size="sm" className="h-7 text-xs">
                      อ่านแล้ว
                    </Button>
                  </form>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">ตั้งค่า Web Push</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-slate-500 space-y-2">
            <p>V1 รองรับ In-App + Web Push — ต้องเปิด Notification permission ใน browser (HTTPS + Service Worker)</p>
            <div className="flex gap-2">
              <button className="border rounded-xl px-3 py-1.5 bg-white">เปิด Web Push (stub)</button>
              <button className="border rounded-xl px-3 py-1.5 bg-white">ทดสอบแจ้งเตือน</button>
            </div>
            <p className="text-[11px]">LINE/Telegram จะมาใน Phase 19 — ตอนนี้เก็บ preference ไว้ก่อน</p>
          </CardContent>
        </Card>
      </div>

      <BottomNav active="today" />
    </main>
  )
}
