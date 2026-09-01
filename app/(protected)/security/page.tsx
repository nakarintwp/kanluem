import { createServerClientSSR } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BottomNav } from "@/components/layout/BottomNav"

export default async function SecurityPage() {
  const supabase = await createServerClientSSR()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const checks = [
    { name: "RLS ทุก table ครอบครัว", status: "✅", desc: "auth.uid() → family_members → family_id" },
    { name: "Storage Private Bucket", status: "✅", desc: "documents bucket private, signed URL 60s" },
    { name: "Service Role ไม่ไป Browser", status: "✅", desc: "เฉพาะ server/edge" },
    { name: "Input Validation (zod)", status: "✅", desc: "ทุก form มี zod + sanitize 500 chars" },
    { name: "Rate Limit", status: "✅", desc: "2 req / 60s per user (RateLimiter)" },
    { name: "Secrets in Env", status: "✅", desc: ".env.example placeholder, Vercel Env จริง" },
    { name: "Abuse Protection", status: "✅", desc: "Invite max_uses + revoke + expiry" },
  ]

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b p-4">
        <h1 className="font-bold">Security Hardening 🔒</h1>
        <p className="text-xs text-slate-500">RLS • Storage • Validation • Rate Limit • Secrets</p>
      </header>
      <div className="flex-1 p-4 space-y-4 overflow-auto max-w-2xl mx-auto w-full">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Security Audit Checklist (Phase 22)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {checks.map((c) => (
              <div key={c.name} className="flex gap-3 items-start border rounded-xl px-3 py-2 bg-white">
                <span className="text-sm">{c.status}</span>
                <div className="flex-1">
                  <div className="text-sm font-medium">{c.name}</div>
                  <div className="text-xs text-slate-500">{c.desc}</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-xs text-slate-500">
            ก่อน Production ต้องตรวจ: No critical security issue, No cross-family leakage (Blueprint §25 Gate)
          </CardContent>
        </Card>
      </div>
      <BottomNav active="more" />
    </main>
  )
}
