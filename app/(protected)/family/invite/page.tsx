import { createServerClientSSR } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { generateCode, getExpiry } from "@/features/family/invite"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import QRCode from "react-qr-code"

export default async function InvitePage() {
  const supabase = await createServerClientSSR()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: members } = await supabase.from("family_members").select("family_id, role, families(name)").eq("user_id", user.id).limit(1).single()
  const family = members as unknown as { family_id: string; role: string; families: { name: string } } | null
  if (!family) redirect("/onboarding")
  if (!["owner", "admin"].includes(family.role)) redirect("/family")

  const { data: invites } = await supabase
    .from("family_invitations")
    .select("*")
    .eq("family_id", family.family_id)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)

  const activeInvite = invites?.[0] as { code: string; expires_at: string | null; max_uses: number | null; used_count: number } | undefined

  async function createInvite(formData: FormData) {
    "use server"
    const { createServerClientSSR } = await import("@/lib/supabase/server")
    const { generateCode, getExpiry } = await import("@/features/family/invite")
    const supabase = await createServerClientSSR()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")
    const { data: mem } = await supabase.from("family_members").select("family_id, role").eq("user_id", user.id).limit(1).single()
    const fam = mem as unknown as { family_id: string; role: string } | null
    if (!fam || !["owner", "admin"].includes(fam.role)) throw new Error("Forbidden")
    const exp = String(formData.get("expiry") || "7d")
    const maxUses = Number(formData.get("maxUses") || 5)
    const code = generateCode()
    const expiresAt = getExpiry(exp)
    const { error } = await supabase.from("family_invitations").insert({
      family_id: fam.family_id,
      code,
      created_by: user.id,
      expires_at: expiresAt?.toISOString() || null,
      max_uses: maxUses,
      status: "active",
    })
    if (error) throw new Error(error.message)
    revalidatePath("/family/invite")
  }

  async function revokeInvite(formData: FormData) {
    "use server"
    const { createServerClientSSR } = await import("@/lib/supabase/server")
    const supabase = await createServerClientSSR()
    const id = String(formData.get("id"))
    await supabase.from("family_invitations").update({ status: "revoked" }).eq("id", id)
    revalidatePath("/family/invite")
  }

  return (
    <main className="min-h-screen bg-slate-50 p-4">
      <div className="max-w-md mx-auto space-y-4 mt-4">
        <div className="flex items-center gap-2">
          <a href="/family" className="w-8 h-8 rounded-full bg-white border flex items-center justify-center">
            ←
          </a>
          <h1 className="font-bold">เชิญสมาชิก — {family.families.name}</h1>
          <span className="ml-auto text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-1 rounded-full">Active</span>
        </div>

        {activeInvite ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="w-48 h-48 mx-auto bg-white p-2 border-2 border-slate-900 rounded-xl flex items-center justify-center">
                <QRCode value={activeInvite.code} size={180} />
              </div>
              <div className="mt-3 inline-flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-full font-mono text-sm tracking-widest">
                {activeInvite.code}
              </div>
              <p className="text-[11px] text-slate-500 mt-2">QR มีแค่ code ไม่ฝัง PII • สแกนด้วยกล้อง</p>
              <div className="mt-3 text-xs flex justify-between bg-slate-50 border rounded-xl px-3 py-2">
                <span>ใช้ไป {activeInvite.used_count}/{activeInvite.max_uses ?? "∞"}</span>
                <span className="text-slate-500">{activeInvite.expires_at ? new Date(activeInvite.expires_at).toLocaleDateString("th-TH") : "ไม่หมดอายุ"}</span>
              </div>
              <form action={revokeInvite} className="mt-3">
                <input type="hidden" name="id" value={(invites?.[0] as { id: string })?.id} />
                <Button type="submit" variant="outline" className="w-full text-red-600 border-red-200 bg-red-50">
                  ยกเลิกคำเชิญ
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">สร้างคำเชิญใหม่</CardTitle>
            </CardHeader>
            <CardContent>
              <form action={createInvite} className="space-y-3">
                <div>
                  <label className="text-sm font-medium">หมดอายุ</label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <label className="border rounded-xl p-2 flex items-center gap-2 bg-sky-50 border-sky-200 text-sm">
                      <input type="radio" name="expiry" value="7d" defaultChecked /> 7 วัน
                    </label>
                    <label className="border rounded-xl p-2 flex items-center gap-2 text-sm">
                      <input type="radio" name="expiry" value="1d" /> 1 วัน
                    </label>
                    <label className="border rounded-xl p-2 flex items-center gap-2 text-sm">
                      <input type="radio" name="expiry" value="1h" /> 1 ชั่วโมง
                    </label>
                    <label className="border rounded-xl p-2 flex items-center gap-2 text-sm">
                      <input type="radio" name="expiry" value="never" /> ไม่หมดอายุ
                    </label>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">จำกัดครั้ง</label>
                  <select name="maxUses" className="mt-1 w-full border rounded-xl px-3 py-2 text-sm">
                    <option value="1">1 ครั้ง</option>
                    <option value="5" selected>5 ครั้ง</option>
                    <option value="10">10 ครั้ง</option>
                    <option value="">ไม่จำกัด</option>
                  </select>
                </div>
                <Button type="submit" className="w-full">
                  สร้าง Invite Code
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-slate-500">
              รหัสมีวันหมดอายุและจำกัดจำนวนครั้ง (Blueprint §4.4) — สมาชิกใหม่ไปที่ <span className="font-mono">/join</span> กรอก <span className="font-mono">KAN-XXXX</span>
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
