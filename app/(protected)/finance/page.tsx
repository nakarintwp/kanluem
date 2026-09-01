import { createServerClientSSR } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { financeItemSchema } from "@/features/finance/schemas"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BottomNav } from "@/components/layout/BottomNav"

export default async function FinancePage() {
  const supabase = await createServerClientSSR()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")
  const { data: mem } = await supabase.from("family_members").select("family_id").eq("user_id", user.id).limit(1).single()
  const familyId = (mem as unknown as { family_id: string } | null)?.family_id
  if (!familyId) redirect("/onboarding")

  const { data: items } = await supabase.from("finance_items").select("*").eq("family_id", familyId).order("due_date", { nullsFirst: false })

  async function createItem(formData: FormData) {
    "use server"
    const { createServerClientSSR } = await import("@/lib/supabase/server")
    const { financeItemSchema } = await import("@/features/finance/schemas")
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
      amount: formData.get("amount") ? Number(formData.get("amount")) : 0,
      due_date: String(formData.get("due_date") || "") || null,
      category: String(formData.get("category") || "other"),
    }
    const parsed = financeItemSchema.safeParse(raw)
    if (!parsed.success) throw new Error(parsed.error.issues[0].message)
    const { error } = await supabase.from("finance_items").insert({
      family_id: fam.family_id,
      created_by: user.id,
      title: parsed.data.title,
      amount: parsed.data.amount,
      due_date: parsed.data.due_date,
      category: parsed.data.category,
    })
    if (error) throw new Error(error.message)
    revalidatePath("/finance")
  }

  async function deleteItem(formData: FormData) {
    "use server"
    const { createServerClientSSR } = await import("@/lib/supabase/server")
    const supabase = await createServerClientSSR()
    const id = String(formData.get("id"))
    await supabase.from("finance_items").delete().eq("id", id)
    revalidatePath("/finance")
  }

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b p-4">
        <h1 className="font-bold">การเงิน 💰</h1>
        <p className="text-xs text-slate-500">บัตรเครดิต ค่างวด ประกัน ค่าเรียน + เตือนครบกำหนด</p>
      </header>
      <div className="flex-1 p-4 space-y-4 overflow-auto max-w-2xl mx-auto w-full">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">เพิ่มรายการการเงิน</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={createItem} className="space-y-3">
              <input name="title" placeholder="เช่น บัตรเครดิต KTC" className="w-full border rounded-xl px-3 py-2 text-sm" required />
              <div className="grid grid-cols-2 gap-2">
                <input name="amount" type="number" placeholder="จำนวน 5000" className="border rounded-xl px-3 py-2 text-sm" required />
                <input name="due_date" type="date" className="border rounded-xl px-3 py-2 text-sm" />
              </div>
              <select name="category" className="w-full border rounded-xl px-3 py-2 text-sm">
                <option value="credit">บัตรเครดิต</option>
                <option value="loan">ค่างวด</option>
                <option value="subscription">Subscription</option>
                <option value="utility">ค่าสาธารณูปโภค</option>
                <option value="insurance">ประกัน</option>
                <option value="other">อื่น</option>
              </select>
              <Button type="submit" className="w-full">
                บันทึก
              </Button>
            </form>
          </CardContent>
        </Card>
        <div className="space-y-2">
          {(!items || items.length === 0) && (
            <Card>
              <CardContent className="py-6 text-center text-sm text-slate-400">ยังไม่มีรายการการเงิน</CardContent>
            </Card>
          )}
          {items?.map((it: { id: string; title: string; amount: number; due_date: string | null; category: string }) => (
            <Card key={it.id}>
              <CardContent className="py-3 flex gap-3 items-center">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">💳</div>
                <div className="flex-1">
                  <div className="font-medium text-sm">{it.title}</div>
                  <div className="text-xs text-slate-500">
                    {it.category} • {Number(it.amount).toLocaleString("th-TH")} บาท {it.due_date ? `• ครบ ${it.due_date}` : ""}
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
