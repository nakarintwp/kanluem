import { createServerClientSSR } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { appointmentSchema } from "@/features/appointments/schemas"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BottomNav } from "@/components/layout/BottomNav"

export default async function AppointmentsPage() {
  const supabase = await createServerClientSSR()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")
  const { data: mem } = await supabase.from("family_members").select("family_id").eq("user_id", user.id).limit(1).single()
  const familyId = (mem as unknown as { family_id: string } | null)?.family_id
  if (!familyId) redirect("/onboarding")

  const { data: appointments } = await supabase.from("appointments").select("*").eq("family_id", familyId).order("appointment_date", { ascending: true })

  async function createAppointment(formData: FormData) {
    "use server"
    const { createServerClientSSR } = await import("@/lib/supabase/server")
    const { appointmentSchema } = await import("@/features/appointments/schemas")
    const supabase = await createServerClientSSR()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")
    const { data: mem } = await supabase.from("family_members").select("family_id").eq("user_id", user.id).limit(1).single()
    const fam = mem as unknown as { family_id: string } | null
    if (!fam) throw new Error("No family")
    const raw = {
      title: String(formData.get("title") || ""),
      date: String(formData.get("date") || ""),
      time: String(formData.get("time") || "") || null,
      location: String(formData.get("location") || "") || null,
      person: String(formData.get("person") || "") || null,
      notes: String(formData.get("notes") || "") || null,
    }
    const parsed = appointmentSchema.safeParse(raw)
    if (!parsed.success) throw new Error(parsed.error.issues[0].message)
    const { error } = await supabase.from("appointments").insert({
      family_id: fam.family_id,
      created_by: user.id,
      title: parsed.data.title,
      appointment_date: parsed.data.date,
      appointment_time: parsed.data.time,
      location: parsed.data.location,
      person: parsed.data.person,
      notes: parsed.data.notes,
    })
    if (error) throw new Error(error.message)
    revalidatePath("/appointments")
  }

  async function deleteAppointment(formData: FormData) {
    "use server"
    const { createServerClientSSR } = await import("@/lib/supabase/server")
    const supabase = await createServerClientSSR()
    const id = String(formData.get("id"))
    await supabase.from("appointments").delete().eq("id", id)
    revalidatePath("/appointments")
  }

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b p-4">
        <h1 className="font-bold">นัดหมาย 📅</h1>
        <p className="text-xs text-slate-500">หมอ โรงเรียน ธนาคาร หน่วยงาน — ผูก Reminder ได้</p>
      </header>
      <div className="flex-1 p-4 space-y-4 overflow-auto max-w-2xl mx-auto w-full">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">เพิ่มนัด</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={createAppointment} className="space-y-3">
              <input name="title" placeholder="ชื่อนัด หมอนัดพ่อ รพ.รามา" className="w-full border rounded-xl px-3 py-2 text-sm" required />
              <div className="grid grid-cols-2 gap-2">
                <input name="date" type="date" className="border rounded-xl px-3 py-2 text-sm" required />
                <input name="time" type="time" className="border rounded-xl px-3 py-2 text-sm" />
              </div>
              <input name="location" placeholder="สถานที่" className="w-full border rounded-xl px-3 py-2 text-sm" />
              <div className="grid grid-cols-2 gap-2">
                <input name="person" placeholder="ผู้เกี่ยวข้อง ลูก/พ่อ/แม่" className="border rounded-xl px-3 py-2 text-sm" />
                <input name="notes" placeholder="หมายเหตุ" className="border rounded-xl px-3 py-2 text-sm" />
              </div>
              <Button type="submit" className="w-full">
                บันทึกนัด
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-2">
          {(!appointments || appointments.length === 0) && (
            <Card>
              <CardContent className="py-6 text-center text-sm text-slate-400">ยังไม่มีนัด — เพิ่มด้านบน</CardContent>
            </Card>
          )}
          {appointments?.map(
            (a: { id: string; title: string; appointment_date: string; appointment_time: string | null; location: string | null; person: string | null }) => (
              <Card key={a.id}>
                <CardContent className="py-3 flex gap-3 items-center">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">📅</div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{a.title}</div>
                    <div className="text-xs text-slate-500">
                      {a.appointment_date} {a.appointment_time ? `• ${a.appointment_time}` : ""} {a.location ? `• ${a.location}` : ""} {a.person ? `• ${a.person}` : ""}
                    </div>
                  </div>
                  <form action={deleteAppointment}>
                    <input type="hidden" name="id" value={a.id} />
                    <Button type="submit" variant="outline" size="sm" className="h-7 text-xs">
                      ลบ
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )
          )}
        </div>
      </div>
      <BottomNav active="more" />
    </main>
  )
}
