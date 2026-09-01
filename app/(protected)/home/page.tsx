import { createServerClientSSR } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { homeItemSchema } from "@/features/home/schemas"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BottomNav } from "@/components/layout/BottomNav"

export default async function HomePage() {
  const supabase = await createServerClientSSR()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")
  const { data: mem } = await supabase.from("family_members").select("family_id").eq("user_id", user.id).limit(1).single()
  const familyId = (mem as unknown as { family_id: string } | null)?.family_id
  if (!familyId) redirect("/onboarding")

  const { data: items } = await supabase.from("home_items").select("*").eq("family_id", familyId).order("created_at")

  async function createItem(formData: FormData) {
    "use server"
    const { createServerClientSSR } = await import("@/lib/supabase/server")
    const { homeItemSchema } = await import("@/features/home/schemas")
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
      category: String(formData.get("category") || "other"),
      description: String(formData.get("description") || "") || null,
    }
    const parsed = homeItemSchema.safeParse(raw)
    if (!parsed.success) throw new Error(parsed.error.issues[0].message)
    const { error } = await supabase.from("home_items").insert({
      family_id: fam.family_id,
      created_by: user.id,
      title: parsed.data.title,
      category: parsed.data.category,
      description: parsed.data.description,
    })
    if (error) throw new Error(error.message)
    revalidatePath("/home")
  }

  async function deleteItem(formData: FormData) {
    "use server"
    const { createServerClientSSR } = await import("@/lib/supabase/server")
    const supabase = await createServerClientSSR()
    const id = String(formData.get("id"))
    await supabase.from("home_items").delete().eq("id", id)
    revalidatePath("/home")
  }

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b p-4">
        <h1 className="font-bold">บ้าน 🏠</h1>
        <p className="text-xs text-slate-500">ค่าไฟ ค่าน้ำ แอร์ เครื่องใช้ + เตือนซ่อมบำรุง</p>
      </header>
      <div className="flex-1 p-4 space-y-4 overflow-auto max-w-2xl mx-auto w-full">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">เพิ่มรายการบ้าน</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={createItem} className="space-y-3">
              <input name="title" placeholder="เช่น ล้างแอร์, ค่าไฟ" className="w-full border rounded-xl px-3 py-2 text-sm" required />
              <div className="grid grid-cols-2 gap-2">
                <select name="category" className="border rounded-xl px-3 py-2 text-sm">
                  <option value="utility">สาธารณูปโภค</option>
                  <option value="maintenance">ซ่อมบำรุง</option>
                  <option value="appliance">เครื่องใช้ไฟฟ้า</option>
                  <option value="other">อื่น</option>
                </select>
                <input name="description" placeholder="รายละเอียด" className="border rounded-xl px-3 py-2 text-sm" />
              </div>
              <Button type="submit" className="w-full">
                บันทึก
              </Button>
            </form>
          </CardContent>
        </Card>
        <div className="space-y-2">
          {(!items || items.length === 0) && (
            <Card>
              <CardContent className="py-6 text-center text-sm text-slate-400">ยังไม่มีรายการบ้าน</CardContent>
            </Card>
          )}
          {items?.map((it: { id: string; title: string; category: string; description: string | null }) => (
            <Card key={it.id}>
              <CardContent className="py-3 flex gap-3 items-center">
                <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">🏠</div>
                <div className="flex-1">
                  <div className="font-medium text-sm">{it.title}</div>
                  <div className="text-xs text-slate-500">
                    {it.category} {it.description ? `• ${it.description}` : ""}
                  </div>
                </div>
                <form action={deleteItem}>
                  <input type="hidden" name="id" value={it.id} />
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
