import { createServerClientSSR } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { createFamilySchema } from "@/features/family/schemas"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default async function FamilyPage() {
  const supabase = await createServerClientSSR()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: members } = await supabase.from("family_members").select("family_id, role, families(name)").eq("user_id", user.id)

  async function createFamily(formData: FormData) {
    "use server"
    const { createServerClientSSR } = await import("@/lib/supabase/server")
    const supabase = await createServerClientSSR()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")
    const name = String(formData.get("name") || "")
    const parsed = createFamilySchema.safeParse({ name })
    if (!parsed.success) throw new Error(parsed.error.issues[0].message)

    const { data: family, error } = await supabase.from("families").insert({ name: parsed.data.name, created_by: user.id }).select("id").single()
    if (error || !family) throw new Error(error?.message || "create failed")
    const { error: mErr } = await supabase.from("family_members").insert({ family_id: family.id, user_id: user.id, role: "owner" })
    if (mErr) throw new Error(mErr.message)
    revalidatePath("/family")
    redirect("/family/invite")
  }

  const hasFamily = members && members.length > 0

  return (
    <main className="min-h-screen bg-slate-50 p-4">
      <div className="max-w-md mx-auto space-y-4 mt-6">
        <h1 className="text-xl font-bold">ครอบครัว</h1>

        {hasFamily ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{(members?.[0] as unknown as { families: { name: string } })?.families?.name || "ครอบครัว"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {members?.map((m: { family_id: string; role: string }) => (
                <div key={m.family_id} className="flex items-center justify-between text-sm border rounded-xl px-3 py-2">
                  <span>{m.family_id.slice(0, 8)}</span>
                  <span className="text-xs bg-slate-100 px-2 py-1 rounded-full">{m.role}</span>
                </div>
              ))}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <a href="/family/invite" className="bg-slate-900 text-white rounded-xl py-2 text-center text-sm">
                  เชิญสมาชิก
                </a>
                <a href="/dashboard" className="border rounded-xl py-2 text-center text-sm">
                  ไป Dashboard
                </a>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>สร้างครอบครัวใหม่</CardTitle>
            </CardHeader>
            <CardContent>
              <form action={createFamily} className="space-y-3">
                <div>
                  <label className="text-sm font-medium">
                    ชื่อครอบครัว <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="name"
                    defaultValue="ครอบครัวทองวุฒิพันธ์"
                    className="mt-1 w-full border rounded-xl px-3 py-2.5 text-sm"
                    placeholder="เช่น ครอบครัวสุขสันต์"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">อย่างน้อย 2 ตัวอักษร ไม่เกิน 50</p>
                </div>
                <Button type="submit" className="w-full">
                  สร้างครอบครัว →
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  )
}
