import Link from "next/link"

export function QuickActions() {
  return (
    <div>
      <h3 className="text-xs font-semibold text-slate-500 tracking-wide mb-2">Quick Actions</h3>
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white border rounded-2xl p-3 text-center opacity-60">
          <div className="text-xl">🎤</div>
          <div className="text-xs font-medium mt-1">พูด</div>
          <div className="text-[10px] text-slate-400">เร็วๆ นี้</div>
        </div>
        <Link href="/reminders" className="bg-sky-600 text-white rounded-2xl p-3 text-center hover:bg-sky-700 transition">
          <div className="text-xl">➕</div>
          <div className="text-xs font-medium mt-1">Reminder</div>
          <div className="text-[10px] text-sky-100">สร้างเลย</div>
        </Link>
        <div className="bg-white border rounded-2xl p-3 text-center opacity-60">
          <div className="text-xl">📷</div>
          <div className="text-xs font-medium mt-1">เอกสาร</div>
          <div className="text-[10px] text-slate-400">เร็วๆ นี้</div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 mt-2">
        <div className="bg-white border rounded-2xl p-3 text-center opacity-40">
          <div>🚗</div>
          <div className="text-xs">รถ</div>
        </div>
        <div className="bg-white border rounded-2xl p-3 text-center opacity-40">
          <div>💊</div>
          <div className="text-xs">ยา</div>
        </div>
        <div className="bg-white border rounded-2xl p-3 text-center opacity-40">
          <div>📅</div>
          <div className="text-xs">นัด</div>
        </div>
      </div>
    </div>
  )
}
