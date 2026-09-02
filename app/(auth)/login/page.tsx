"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export const dynamic = "force-dynamic"

function LoginContent() {
  const searchParams = useSearchParams()
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [debug, setDebug] = useState<string>("")

  useEffect(() => {
    const err = searchParams.get("error")
    const code = searchParams.get("error_code")
    const desc = searchParams.get("error_description")
    if (err) {
      setErrorMsg(`${err}${code ? ` (${code})` : ""}${desc ? `: ${decodeURIComponent(desc)}` : ""}`)
      setDebug(`Callback error: ${err} | ${code} | ${desc?.slice(0, 100)}`)
    }
  }, [searchParams])

  const handleGoogleLogin = async () => {
    setErrorMsg(null)
    setDebug(`URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL?.slice(0, 30)}... | Clicked at ${new Date().toLocaleTimeString()}`)
    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) {
        console.error("Google login error:", error)
        setErrorMsg(`${error.message} (code: ${error.status})`)
        setDebug((d) => `${d} | Error: ${error.message}`)
      } else if (data?.url) {
        setDebug((d) => `${d} | Redirecting to ${data.url.slice(0, 50)}...`)
        window.location.href = data.url
      } else {
        setErrorMsg("No URL returned, check Supabase Google provider is enabled")
        setDebug((d) => `${d} | No URL, data: ${JSON.stringify(data)}`)
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e)
      setErrorMsg(`Exception: ${msg}`)
      setDebug((d) => `${d} | Exception: ${msg}`)
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
          {errorMsg && <div className="mt-3 bg-red-50 border border-red-200 rounded-xl p-2 text-xs text-red-700">{errorMsg}</div>}
          {debug && <div className="mt-2 bg-slate-100 border rounded-xl p-2 text-[10px] font-mono break-all">{debug}</div>}
          <div className="mt-2 text-[10px] text-slate-400">Supabase: {process.env.NEXT_PUBLIC_SUPABASE_URL ? "✅ Env OK" : "❌ Env missing"} • Vercel env must be set + Redeploy</div>
          <div className="mt-4 text-center text-[11px] text-slate-400">
            PWA ติดตั้งได้ • Web Push พร้อม • ครอบครัวปลอดภัยด้วย RLS
          </div>
        </CardContent>
      </Card>
    </main>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">Loading...</div>}>
      <LoginContent />
    </Suspense>
  )
}
