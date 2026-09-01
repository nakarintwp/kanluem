import { createServerClientSSR } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { documentSchema } from "@/features/documents/schemas"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BottomNav } from "@/components/layout/BottomNav"

export default async function DocumentsPage() {
  const supabase = await createServerClientSSR()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")
  const { data: mem } = await supabase.from("family_members").select("family_id").eq("user_id", user.id).limit(1).single()
  const familyId = (mem as unknown as { family_id: string } | null)?.family_id
  if (!familyId) redirect("/onboarding")

  const { data: docs } = await supabase.from("documents").select("*").eq("family_id", familyId).order("created_at", { ascending: false })

  async function createDocument(formData: FormData) {
    "use server"
    const { createServerClientSSR } = await import("@/lib/supabase/server")
    const { documentSchema } = await import("@/features/documents/schemas")
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
      category: String(formData.get("category") || "other"),
      document_number: String(formData.get("document_number") || "") || null,
      notes: String(formData.get("notes") || "") || null,
    }
    const parsed = documentSchema.safeParse(raw)
    if (!parsed.success) throw new Error(parsed.error.issues[0].message)
    // For MVP, storage_path is placeholder private path (Phase 13 stub)
    const storagePath = `${fam.family_id}/${Date.now()}-${parsed.data.name.replace(/\s+/g, "_")}`
    const { error } = await supabase.from("documents").insert({
      family_id: fam.family_id,
      uploaded_by: user.id,
      name: parsed.data.name,
      category: parsed.data.category,
      document_number: parsed.data.document_number,
      storage_path: storagePath,
      notes: parsed.data.notes,
    })
    if (error) throw new Error(error.message)
    revalidatePath("/documents")
  }

  async function deleteDocument(formData: FormData) {
    "use server"
    const { createServerClientSSR } = await import("@/lib/supabase/server")
    const supabase = await createServerClientSSR()
    const id = String(formData.get("id"))
    await supabase.from("documents").delete().eq("id", id)
    revalidatePath("/documents")
  }

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b p-4">
        <h1 className="font-bold">เอกสาร 📄</h1>
        <p className="text-xs text-slate-500">Private Storage • ผูกวันหมดอายุกับ Reminder ได้ (Phase 14)</p>
        <div className="mt-2 flex gap-2 text-[11px]">
          <span className="bg-sky-50 text-sky-700 border border-sky-200 px-2 py-1 rounded-full">All</span>
          <span className="bg-white border px-2 py-1 rounded-full">Vehicle</span>
          <span className="bg-white border px-2 py-1 rounded-full">Medical</span>
          <span className="bg-white border px-2 py-1 rounded-full">Insurance</span>
        </div>
      </header>

      <div className="flex-1 p-4 space-y-4 overflow-auto max-w-2xl mx-auto w-full">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">อัปโหลดเอกสาร</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={createDocument} className="space-y-3">
              <input name="name" placeholder="ชื่อเอกสาร สำเนาทะเบียนรถ" className="w-full border rounded-xl px-3 py-2 text-sm" required />
              <div className="grid grid-cols-2 gap-2">
                <select name="category" className="border rounded-xl px-3 py-2 text-sm">
                  <option value="vehicle">ยานพาหนะ</option>
                  <option value="medical">การแพทย์</option>
                  <option value="insurance">ประกัน</option>
                  <option value="bills">บิล/ใบเสร็จ</option>
                  <option value="school">โรงเรียน</option>
                  <option value="personal">ส่วนตัว</option>
                  <option value="other">อื่น</option>
                </select>
                <input name="document_number" placeholder="เลขที่เอกสาร" className="border rounded-xl px-3 py-2 text-sm" />
              </div>
              <input name="notes" placeholder="หมายเหตุ" className="w-full border rounded-xl px-3 py-2 text-sm" />
              <div className="border-2 border-dashed rounded-xl p-4 text-center text-xs text-slate-400">📷 เลือกไฟล์ PDF/JPG/PNG/WEBP (MVP stub — ไฟล์จริงใช้ Private Bucket)</div>
              <Button type="submit" className="w-full">
                บันทึกเอกสาร
              </Button>
              <p className="text-[11px] text-slate-500">ไฟล์จะถูกเก็บใน Private Storage เท่านั้น ห้ามใช้ Public Bucket (Blueprint §15)</p>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-2">
          {(!docs || docs.length === 0) && (
            <Card>
              <CardContent className="py-6 text-center text-sm text-slate-400">ยังไม่มีเอกสาร — อัปโหลดด้านบน</CardContent>
            </Card>
          )}
          {docs?.map((d: { id: string; name: string; category: string; storage_path: string; document_number: string | null }) => (
            <Card key={d.id}>
              <CardContent className="py-3 flex gap-3 items-center">
                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">📄</div>
                <div className="flex-1">
                  <div className="font-medium text-sm">{d.name}</div>
                  <div className="text-xs text-slate-500">
                    {d.category} {d.document_number ? `• ${d.document_number}` : ""} • {d.storage_path.slice(0, 20)}...
                  </div>
                </div>
                <form action={deleteDocument}>
                  <input type="hidden" name="id" value={d.id} />
                  <Button type="submit" variant="outline" size="sm" className="h-7 text-xs">
                    ลบ
                  </Button>
                </form>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <BottomNav active="docs" />
    </main>
  )
}
