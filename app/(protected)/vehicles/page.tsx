import { createServerClientSSR } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { vehicleSchema } from "@/features/vehicles/schemas"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BottomNav } from "@/components/layout/BottomNav"

export default async function VehiclesPage() {
  const supabase = await createServerClientSSR()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")
  const { data: mem } = await supabase.from("family_members").select("family_id").eq("user_id", user.id).limit(1).single()
  const familyId = (mem as unknown as { family_id: string } | null)?.family_id
  if (!familyId) redirect("/onboarding")

  const { data: vehicles } = await supabase.from("vehicles").select("*").eq("family_id", familyId).order("created_at")

  async function createVehicle(formData: FormData) {
    "use server"
    const { createServerClientSSR } = await import("@/lib/supabase/server")
    const { vehicleSchema } = await import("@/features/vehicles/schemas")
    const supabase = await createServerClientSSR()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")
    const { data: mem } = await supabase.from("family_members").select("family_id").eq("user_id", user.id).limit(1).single()
    const fam = mem as unknown as { family_id: string } | null
    if (!fam) throw new Error("No family")
    const raw = {
      brand: String(formData.get("brand") || ""),
      model: String(formData.get("model") || ""),
      registration: String(formData.get("registration") || ""),
      year: formData.get("year") ? Number(formData.get("year")) : null,
      current_mileage: formData.get("current_mileage") ? Number(formData.get("current_mileage")) : null,
    }
    const parsed = vehicleSchema.safeParse(raw)
    if (!parsed.success) throw new Error(parsed.error.issues[0].message)
    const { error } = await supabase.from("vehicles").insert({
      family_id: fam.family_id,
      created_by: user.id,
      brand: parsed.data.brand,
      model: parsed.data.model,
      registration: parsed.data.registration,
      year: parsed.data.year,
      current_mileage: parsed.data.current_mileage,
    })
    if (error) throw new Error(error.message)
    revalidatePath("/vehicles")
  }

  async function deleteVehicle(formData: FormData) {
    "use server"
    const { createServerClientSSR } = await import("@/lib/supabase/server")
    const supabase = await createServerClientSSR()
    const id = String(formData.get("id"))
    await supabase.from("vehicles").delete().eq("id", id)
    revalidatePath("/vehicles")
  }

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b p-4">
        <h1 className="font-bold">ยานพาหนะ 🚗</h1>
        <p className="text-xs text-slate-500">บันทึก รถ ประกัน ภาษี เลขไมล์ + เตือนหมดอายุ</p>
      </header>

      <div className="flex-1 p-4 space-y-4 overflow-auto max-w-2xl mx-auto w-full">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">เพิ่มรถ</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={createVehicle} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <input name="brand" placeholder="ยี่ห้อ Toyota" className="border rounded-xl px-3 py-2 text-sm" required />
                <input name="model" placeholder="รุ่น Civic" className="border rounded-xl px-3 py-2 text-sm" required />
              </div>
              <input name="registration" placeholder="ทะเบียน กข1234" className="border rounded-xl px-3 py-2 text-sm w-full" required />
              <div className="grid grid-cols-2 gap-2">
                <input name="year" type="number" placeholder="ปี 2020" className="border rounded-xl px-3 py-2 text-sm" />
                <input name="current_mileage" type="number" placeholder="เลขไมล์ 50000" className="border rounded-xl px-3 py-2 text-sm" />
              </div>
              <Button type="submit" className="w-full">
                บันทึกรถ
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-2">
          {(!vehicles || vehicles.length === 0) && (
            <Card>
              <CardContent className="py-6 text-center text-sm text-slate-400">ยังไม่มีรถ — เพิ่มคันแรกด้านบน</CardContent>
            </Card>
          )}
          {vehicles?.map((v: { id: string; brand: string; model: string; registration: string; year: number | null; current_mileage: number | null }) => (
            <Card key={v.id}>
              <CardContent className="py-3 flex gap-3 items-center">
                <div className="w-12 h-12 rounded-xl bg-sky-100 flex items-center justify-center">🚗</div>
                <div className="flex-1">
                  <div className="font-medium text-sm">
                    {v.brand} {v.model} {v.year ? `(${v.year})` : ""}
                  </div>
                  <div className="text-xs text-slate-500">
                    {v.registration} • {v.current_mileage ? `${v.current_mileage.toLocaleString("th-TH")} กม.` : "ไม่มีเลขไมล์"}
                  </div>
                  <div className="text-[11px] text-amber-600 mt-1">เตือน ประกัน/ภาษี จะผูกกับ Reminder (Phase 14)</div>
                </div>
                <form action={deleteVehicle}>
                  <input type="hidden" name="id" value={v.id} />
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
