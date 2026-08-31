import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function JoinPage() {
  return (
    <main className="min-h-screen bg-slate-50 p-6 flex items-center justify-center">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>เข้าร่วมครอบครัว</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500">Phase 03 จะมีกรอก Invite Code KAN-XXXX และสแกน QR</p>
          <div className="mt-3 flex rounded-xl border overflow-hidden">
            <input placeholder="KAN-XXXX" className="flex-1 px-3 py-2.5 text-sm font-mono" />
            <button className="bg-slate-900 text-white px-4 text-sm">เข้าร่วม</button>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
