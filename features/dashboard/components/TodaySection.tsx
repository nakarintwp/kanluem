type Reminder = {
  id: string
  title: string
  due_at: string
  category: string
  priority: string
  status: string
}

export function TodaySection({
  overdue,
  today,
  upcoming,
}: {
  overdue: Reminder[]
  today: Reminder[]
  upcoming: Reminder[]
}) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-xs font-semibold text-slate-500 tracking-wide mb-2">เกินกำหนด</h3>
        {overdue.length === 0 ? (
          <p className="text-xs text-slate-400 bg-white border rounded-xl p-3 text-center">ไม่มีรายการเกินกำหนด ✓</p>
        ) : (
          <div className="space-y-2">
            {overdue.map((r) => (
              <div key={r.id} className="bg-white border-l-4 border-red-500 rounded-xl p-3 border-y border-r flex gap-3 items-center">
                <span className="text-lg">{r.category === "vehicle" ? "🚗" : r.category === "medical" ? "💊" : "🔔"}</span>
                <div className="flex-1">
                  <div className="text-sm font-medium">{r.title}</div>
                  <div className="text-xs text-slate-500">{new Date(r.due_at).toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}</div>
                </div>
                <span className="text-xs bg-red-500 text-white px-2 py-1 rounded-full">เกิน</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h3 className="text-xs font-semibold text-slate-500 tracking-wide mb-2">วันนี้</h3>
        {today.length === 0 ? (
          <p className="text-xs text-slate-400 bg-white border rounded-xl p-3 text-center">ไม่มีรายการวันนี้ — พักผ่อนได้</p>
        ) : (
          <div className="space-y-2">
            {today.map((r) => (
              <div key={r.id} className="bg-white rounded-xl p-3 border flex gap-3 items-center">
                <span className="text-lg">{r.category === "vehicle" ? "🚗" : r.category === "medical" ? "💊" : r.category === "appointment" ? "📅" : "🏠"}</span>
                <div className="flex-1">
                  <div className="text-sm font-medium">{r.title}</div>
                  <div className="text-xs text-slate-500">{new Date(r.due_at).toLocaleTimeString("th-TH", { timeZone: "Asia/Bangkok", hour: "2-digit", minute: "2-digit" })} • {r.category}</div>
                </div>
                <span className="text-xs border px-2 py-1 rounded-full">วันนี้</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h3 className="text-xs font-semibold text-slate-500 tracking-wide mb-2">7 วันข้างหน้า</h3>
        {upcoming.length === 0 ? (
          <p className="text-xs text-slate-400 bg-white border rounded-xl p-3 text-center">ไม่มีรายการล่วงหน้า</p>
        ) : (
          <div className="space-y-2">
            {upcoming.slice(0, 5).map((r) => (
              <div key={r.id} className="bg-white rounded-xl p-3 border flex gap-3 items-center opacity-90">
                <span className="text-lg">🔔</span>
                <div className="flex-1">
                  <div className="text-sm font-medium">{r.title}</div>
                  <div className="text-xs text-slate-500">{new Date(r.due_at).toLocaleDateString("th-TH", { timeZone: "Asia/Bangkok" })} • {r.category}</div>
                </div>
                <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2 py-1 rounded-full">เร็วๆ นี้</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
