import Link from "next/link"

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
      <div className="w-full max-w-md bg-white rounded-2xl border p-6 text-center shadow-sm">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-sky-600 flex items-center justify-center text-white text-xl font-bold">ก</div>
        <h1 className="mt-3 text-xl font-bold">KANLUEM กันลืม</h1>
        <p className="text-sm text-slate-500">Family Life Assistant — Phase 00 Foundation</p>
        <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-2 rounded-xl">Build: OK</span>
          <span className="bg-sky-50 text-sky-700 border border-sky-200 px-3 py-2 rounded-xl">PWA: Ready</span>
        </div>
        <div className="mt-4 flex gap-2">
          <Link href="/login" className="flex-1 bg-slate-900 text-white rounded-xl py-2.5 text-sm font-medium text-center">ไปหน้า Login</Link>
          <a href="/mockups/index.html" className="flex-1 border rounded-xl py-2.5 text-sm text-center">ดู Mockup</a>
        </div>
        <p className="mt-3 text-[11px] text-slate-400">Next.js 15 + Tailwind + shadcn + Supabase + PWA</p>
      </div>
    </main>
  )
}
