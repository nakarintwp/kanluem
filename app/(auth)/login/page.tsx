"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function LoginPage() {
  const handleGoogleLogin = async () => {
    const supabase = createClient()
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) {
      console.error("Google login error:", error)
      alert(`Login failed: ${error.message}`)
    } else if (data?.url) {
      window.location.href = data.url
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="w-12 h-12 mx-auto rounded-xl bg-sky-600 flex items-center justify-center text-white font-bold">
            ก
          </div>
          <CardTitle className="mt-2">KANLUEM กันลืม</CardTitle>
          <CardDescription>เข้าสู่ระบบด้วย Google Account</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-slate-500 mb-4 text-center">
            ใช้ Google OAuth ผ่าน Supabase Auth — ไม่มีรหัสผ่านใน V1
          </p>
          <Button onClick={handleGoogleLogin} variant="outline" className="w-full">
            <span className="w-5 h-5 rounded-full bg-gradient-to-br from-red-500 via-yellow-400 to-blue-500 flex items-center justify-center text-[10px] text-white font-bold">
              G
            </span>
            ดำเนินการต่อด้วย Google
          </Button>
          <div className="mt-4 text-center text-[11px] text-slate-400">
            PWA ติดตั้งได้ • Web Push พร้อม • ครอบครัวปลอดภัยด้วย RLS
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
