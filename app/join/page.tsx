import { createServerClientSSR } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { isInviteValid } from "@/features/family/invite"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default async function JoinPage() {
  async function joinFamily(formData: FormData) {
    "use server"
    const { createServerClientSSR } = await import("@/lib/supabase/server")
    const { isInviteValid } = await import("@/features/family/invite")
    const supabase = await createServerClientSSR()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized - login first")
    const code = String(formData.get("code") || "")
      .trim()
      .toUpperCase()
    if (!code) throw new Error("กรุณากรอกรหัส")

    const { data: invite, error } = await supabase.from("family_invitations").select("*").eq("code", code).single()
    if (error || !invite) throw new Error("ไม่พบรหัสเชิญ")
    const inv = invite as { id: string; family_id: string; status: string; expires_at: string | null; max_uses: number | null; used_count: number }
    if (!isInviteValid(inv)) throw new Error("รหัสหมดอายุ / ถูกยกเลิก / ครบจำนวนแล้ว")

    const { error: memErr } = await supabase.from("family_members").insert({ family_id: inv.family_id, user_id: user.id, role: "member" })
    if (memErr) throw new Error(memErr.message)
    await supabase.from("family_invitations").update({ used_count: inv.used_count + 1 }).eq("id", inv.id)

    revalidatePath("/family")
    redirect("/dashboard")
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 flex items-center justify-center">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>เข้าร่วมครอบครัว</CardTitle>
          <p className="text-xs text-slate-500">กรอกรหัส KAN-XXXX หรือสแกน QR</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="w-full h-28 border-2 border-dashed rounded-xl flex items-center justify-center text-slate-400 text-xs">Camera Preview (Phase 03 stub — กล้องจริง Phase ถัดไป)</div>
          <form action={joinFamily} className="space-y-3">
            <div className="flex gap-2">
              <input name="code" placeholder="KAN-XXXX" defaultValue="" className="flex-1 border rounded-xl px-3 py-2.5 font-mono text-sm tracking-widest uppercase" />
              <Button type="submit">เข้าร่วม</Button>
            </div>
            <p className="text-[11px] text-slate-500">รหัสมีวันหมดอายุและจำกัดจำนวนครั้ง — ตรวจสอบสถานะ active/expired/revoked</p>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}
