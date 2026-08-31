import { createServerClientSSR } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function DashboardPage() {
  const supabase = await createServerClientSSR()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <main className="min-h-screen bg-slate-50 p-4">
      <Card className="max-w-md mx-auto mt-10">
        <CardHeader>
          <CardTitle>Dashboard — Phase 01 Auth OK</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600">สวัสดี {user.email}</p>
          <p className="text-xs text-slate-500 mt-1">Protected route ทำงานถูกต้อง (middleware + server guard)</p>
          <Link href="/login" className="inline-block mt-4 text-sm text-sky-600 underline">
            ออกจากระบบ (stub)
          </Link>
        </CardContent>
      </Card>
    </main>
  )
}
