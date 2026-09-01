import { createServerClientSSR } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { medicationSchema } from "@/features/medication/schemas"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BottomNav } from "@/components/layout/BottomNav"

export default async function MedicationPage() {
  const supabase = await createServerClientSSR()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")
  const { data: mem } = await supabase.from("family_members").select("family_id").eq("user_id", user.id).limit(1).single()
  const familyId = (mem as unknown as { family_id: string } | null)?.family_id
  if (!familyId) redirect("/onboarding")

  const { data: meds } = await supabase.from("medications").select("*").eq("family_id", familyId).order("created_at")

  async function createMed(formData: FormData) {
    "use server"
    const { createServerClientSSR } = await import("@/lib/supabase/server")
    const { medicationSchema } = await import("@/features/medication/schemas")
    const supabase = await createServerClientSSR()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")
    const { data: mem } = await supabase.from("family_members").select("family_id").eq("user_id", user.id).limit(1).single()
    const fam = mem as unknown as { family_id: string } | null
    if (!fam) throw new Error("No family")
    const raw = {
      name: String(formData.get("name") || ""),
      dosage: String(formData.get("dosage") || ""),
      frequency: String(formData.get("frequency") || "daily"),
      amount_remaining: formData.get("amount_remaining") ? Number(formData.get("amount_remaining")) : null,
      start_date: String(formData.get("start_date") || "") || null,
      end_date: String(formData.get("end_date") || "") || null,
    }
    const parsed = medicationSchema.safeParse(raw)
    if (!parsed.success) throw new Error(parsed.error.issues[0].message)
    const { error } = await supabase.from("medications").insert({
      family_id: fam.family_id,
      created_by: user.id,
      name: parsed.data.name,
      dosage: parsed.data.dosage,
      frequency: parsed.data.frequency,
      amount_remaining: parsed.data.amount_remaining,
      start_date: parsed.data.start_date,
      end_date: parsed.data.end_date,
    })
    if (error) throw new Error(error.message)
    revalidatePath("/medication")
  }

  async function deleteMed(formData: FormData) {
    "use server"
    const { createServerClientSSR } = await import("@/lib/supabase/server")
    const supabase = await createServerClientSSR()
    const id = String(formData.get("id"))
    await supabase.from("medications").delete().eq("id", id)
    revalidatePath("/medication")
  }

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b p-4">
        <h1 className="font-bold">ยา / สุขภาพ 💊</h1>
        <p className="text-xs text-slate-500">บันทึกยา เวลา ความถี่ คงเหลือ + เตือนใกล้หมด</p>
      </header>
      <div className="flex-1 p-4 space-y-4 overflow-auto max-w-2xl mx-auto w-full">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">เพิ่มยา</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={createMed} className="space-y-3">
              <input name="name" placeholder="ชื่อยา Lisinopril" className="w-full border rounded-xl px-3 py-2 text-sm" required />
              <div className="grid grid-cols-2 gap-2">
                <input name="dosage" placeholder="ขนาด 10mg" className="border rounded-xl px-3 py-2 text-sm" required />
                <select name="frequency" className="border rounded-xl px-3 py-2 text-sm">
                  <option value="daily">ทุกวัน</option>
                  <option value="once">ครั้งเดียว</option>
                  <option value="weekly">ทุกสัปดาห์</option>
                  <option value="custom">กำหนดเอง</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input name="amount_remaining" type="number" placeholder="คงเหลือ 30" className="border rounded-xl px-3 py-2 text-sm" />
                <input name="start_date" type="date" className="border rounded-xl px-3 py-2 text-sm" />
              </div>
              <Button type="submit" className="w-full">
                บันทึกยา
              </Button>
              <p className="text-[11px] text-amber-600">ระบบเตือนเมื่อยาใกล้หมด (≤7) — ไม่วินิจฉัยแทนแพทย์</p>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-2">
          {(!meds || meds.length === 0) && (
            <Card>
              <CardContent className="py-6 text-center text-sm text-slate-400">ยังไม่มียา — เพิ่มด้านบน</CardContent>
            </Card>
          )}
          {meds?.map((m: { id: string; name: string; dosage: string; frequency: string; amount_remaining: number | null }) => (
            <Card key={m.id} className={m.amount_remaining !== null && m.amount_remaining <= 7 ? "border-amber-300 bg-amber-50" : ""}>
              <CardContent className="py-3 flex gap-3 items-center">
                <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center">💊</div>
                <div className="flex-1">
                  <div className="font-medium text-sm">
                    {m.name} <span className="text-slate-500">{m.dosage}</span>
                  </div>
                  <div className="text-xs text-slate-500">
                    {m.frequency} • คงเหลือ {m.amount_remaining ?? "-"} {m.amount_remaining !== null && m.amount_remaining <= 7 ? "⚠️ ใกล้หมด" : ""}
                  </div>
                </div>
                <form action={deleteMed}>
                  <input type="hidden" name="id" value={m.id} />
                  <Button type="submit" variant="outline" size="sm" className="h-7 text-xs">
                    ลบ
                  </Button>
                </form>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      <BottomNav active="more" />
    </main>
  )
}
