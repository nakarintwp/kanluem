import { createServerClientSSR } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { reminderSchema } from "@/features/reminders/schemas"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default async function RemindersPage() {
  const supabase = await createServerClientSSR()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: members } = await supabase.from("family_members").select("family_id").eq("user_id", user.id).limit(1).single()
  const familyId = (members as unknown as { family_id: string } | null)?.family_id
  if (!familyId) redirect("/onboarding")

  const { data: reminders } = await supabase.from("reminders").select("*").eq("family_id", familyId).order("due_at", { ascending: true })
  const { data: familyMembers } = await supabase.from("family_members").select("user_id, profiles(display_name)").eq("family_id", familyId)

  async function createReminder(formData: FormData) {
    "use server"
    const { createServerClientSSR } = await import("@/lib/supabase/server")
    const { reminderSchema } = await import("@/features/reminders/schemas")
    const supabase = await createServerClientSSR()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")
    const { data: mem } = await supabase.from("family_members").select("family_id").eq("user_id", user.id).limit(1).single()
    const fam = mem as unknown as { family_id: string } | null
    if (!fam) throw new Error("No family")

    const title = String(formData.get("title") || "")
    const dueDate = String(formData.get("due_date") || "")
    const dueTime = String(formData.get("due_time") || "")
    const category = String(formData.get("category") || "other")
    const priority = String(formData.get("priority") || "medium")
    const assignee = String(formData.get("assignee") || "") || null
    const recurrence = String(formData.get("recurrence") || "") || null

    const due_at = dueDate && dueTime ? new Date(`${dueDate}T${dueTime}:00+07:00`).toISOString() : dueDate ? new Date(dueDate).toISOString() : ""

    const parsed = reminderSchema.safeParse({
      title,
      due_at,
      category,
      priority,
      assignee,
      recurrence,
      timezone: "Asia/Bangkok",
    })
    if (!parsed.success) throw new Error(parsed.error.issues[0].message)

    const { error } = await supabase.from("reminders").insert({
      family_id: fam.family_id,
      created_by: user.id,
      assignee: parsed.data.assignee || null,
      title: parsed.data.title,
      category: parsed.data.category,
      due_at: parsed.data.due_at,
      priority: parsed.data.priority,
      recurrence: parsed.data.recurrence,
      status: "pending",
    })
    if (error) throw new Error(error.message)
    revalidatePath("/reminders")
    revalidatePath("/dashboard")
  }

  async function updateStatus(formData: FormData) {
    "use server"
    const { createServerClientSSR } = await import("@/lib/supabase/server")
    const supabase = await createServerClientSSR()
    const id = String(formData.get("id"))
    const status = String(formData.get("status"))
    const snooze = formData.get("snooze")
    let update: Record<string, unknown> = { status }
    if (snooze) {
      const mins = Number(snooze)
      const newDue = new Date(Date.now() + mins * 60000).toISOString()
      update = { status: "snoozed", due_at: newDue }
    }
    await supabase.from("reminders").update(update).eq("id", id)
    revalidatePath("/reminders")
    revalidatePath("/dashboard")
  }

  return (
    <main className="min-h-screen bg-slate-50 p-4">
      <div className="max-w-2xl mx-auto space-y-4 mt-2">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold">Reminders</h1>
          <span className="text-xs bg-slate-100 px-2 py-1 rounded-full">{reminders?.length || 0} รายการ</span>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">สร้าง Reminder ใหม่</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={createReminder} className="space-y-3">
              <input name="title" placeholder="เช่น พรุ่งนี้ 8 โมงเอา Civic ไปเปลี่ยนน้ำมันเครื่อง" className="w-full border rounded-xl px-3 py-2.5 text-sm" required />
              <div className="grid grid-cols-2 gap-2">
                <input name="due_date" type="date" className="border rounded-xl px-3 py-2 text-sm" required />
                <input name="due_time" type="time" className="border rounded-xl px-3 py-2 text-sm" required defaultValue="08:00" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <select name="category" className="border rounded-xl px-3 py-2 text-sm">
                  <option value="other">ทั่วไป</option>
                  <option value="vehicle">รถ</option>
                  <option value="medical">ยา/สุขภาพ</option>
                  <option value="appointment">นัด</option>
                  <option value="home">บ้าน</option>
                  <option value="finance">การเงิน</option>
                </select>
                <select name="priority" className="border rounded-xl px-3 py-2 text-sm">
                  <option value="medium">ปานกลาง</option>
                  <option value="high">สูง</option>
                  <option value="low">ต่ำ</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <select name="assignee" className="border rounded-xl px-3 py-2 text-sm">
                  <option value="">มอบหมาย: ฉัน</option>
                  {(familyMembers as unknown as { user_id: string; profiles: { display_name: string } | null }[])?.map((m) => (
                    <option key={m.user_id} value={m.user_id}>
                      {m.profiles?.display_name || m.user_id.slice(0, 6)}
                    </option>
                  ))}
                </select>
                <select name="recurrence" className="border rounded-xl px-3 py-2 text-sm">
                  <option value="">ครั้งเดียว</option>
                  <option value="daily">ทุกวัน</option>
                  <option value="weekly">ทุกสัปดาห์</option>
                  <option value="monthly">ทุกเดือน</option>
                  <option value="yearly">ทุกปี</option>
                </select>
              </div>
              <Button type="submit" className="w-full">
                บันทึก Reminder
              </Button>
              <p className="text-[11px] text-slate-500">Preview: 🚗 Civic 🔧 เปลี่ยนน้ำมันเครื่อง 📅 ตามวันที่เลือก ⏰ ตามเวลาที่เลือก</p>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-2">
          {(!reminders || reminders.length === 0) && (
            <Card>
              <CardContent className="py-8 text-center text-sm text-slate-500">ยังไม่มี Reminder — สร้างรายการแรกด้านบน</CardContent>
            </Card>
          )}
          {reminders?.map((r: { id: string; title: string; due_at: string; category: string; priority: string; status: string }) => {
            const isOverdue = new Date(r.due_at) < new Date() && r.status === "pending"
            const bg = isOverdue ? "bg-red-50 border-red-200" : "bg-white"
            return (
              <Card key={r.id} className={bg}>
                <CardContent className="py-3 flex gap-3 items-center">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-sm">
                    {r.category === "vehicle" ? "🚗" : r.category === "medical" ? "💊" : r.category === "appointment" ? "📅" : "🔔"}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm flex items-center gap-2">
                      {r.title}
                      {isOverdue && <span className="text-[10px] bg-red-500 text-white px-1.5 py-0.5 rounded-full">เกินกำหนด</span>}
                      {r.status === "done" && <span className="text-[10px] bg-emerald-500 text-white px-1.5 py-0.5 rounded-full">เสร็จ</span>}
                    </div>
                    <div className="text-xs text-slate-600">
                      {new Date(r.due_at).toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })} • {r.category} • {r.priority}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {r.status === "pending" && (
                      <>
                        <form action={updateStatus}>
                          <input type="hidden" name="id" value={r.id} />
                          <input type="hidden" name="status" value="done" />
                          <Button type="submit" size="sm" className="h-7 text-xs">
                            เสร็จ
                          </Button>
                        </form>
                        <form action={updateStatus}>
                          <input type="hidden" name="id" value={r.id} />
                          <input type="hidden" name="status" value="snoozed" />
                          <input type="hidden" name="snooze" value="10" />
                          <Button type="submit" variant="outline" size="sm" className="h-7 text-xs">
                            เลื่อน 10น
                          </Button>
                        </form>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </main>
  )
}
