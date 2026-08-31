import { createServerClientSSR } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default async function OnboardingPage() {
  const supabase = await createServerClientSSR()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: members } = await supabase.from("family_members").select("family_id").eq("user_id", user.id).limit(1)
  if (members && members.length > 0) {
    redirect("/dashboard")
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 flex items-center justify-center">
      <div className="w-full max-w-md space-y-4">
        <div className="text-center">
          <h1 className="text-xl font-bold">ยินดีต้อนรับ 👋</h1>
          <p className="text-sm text-slate-500">คุณยังไม่มีครอบครัว เลือกวิธีเริ่มต้น</p>
        </div>

        <Card className="border-sky-200 bg-sky-50">
          <CardHeader>
            <CardTitle className="text-sky-900">สร้างครอบครัวใหม่</CardTitle>
            <CardDescription>คุณจะเป็น Owner • ได้ Invite Code</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/family">
              <Button className="w-full bg-sky-600 hover:bg-sky-700">สร้างครอบครัวใหม่ →</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>เข้าร่วมครอบครัว</CardTitle>
            <CardDescription>ใส่ Invite Code หรือสแกน QR</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/join">
              <Button variant="outline" className="w-full">
                เข้าร่วมครอบครัว →
              </Button>
            </Link>
          </CardContent>
        </Card>

        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-3">
          ไม่ให้ Gmail ใดเข้าครอบครัวอัตโนมัติ ต้องมี Invite Code เท่านั้น (Blueprint §4)
        </p>
      </div>
    </main>
  )
}
