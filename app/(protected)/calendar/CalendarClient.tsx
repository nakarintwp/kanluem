"use client"

import { useState } from "react"
import { MonthGrid } from "@/features/calendar/components/MonthGrid"
import { formatMonthYear } from "@/features/calendar/utils"
import { BottomNav } from "@/components/layout/BottomNav"
import { Card, CardContent } from "@/components/ui/card"

type Reminder = { id: string; title: string; due_at: string; category: string; priority: string; status: string }

export default function CalendarClient({ initialReminders }: { initialReminders: Reminder[] }) {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [selectedDay, setSelectedDay] = useState<number | null>(today.getDate())
  const [view, setView] = useState<"month" | "week" | "day">("month")

  const navigate = (dir: number) => {
    let y = year, m = month + dir
    if (m < 0) { m = 11; y-- }
    if (m > 11) { m = 0; y++ }
    setYear(y); setMonth(m)
  }

  const selectedDateStr = selectedDay ? `${year}-${String(month + 1).padStart(2, "0")}-${String(selectedDay).padStart(2, "0")}` : null
  const selectedReminders = selectedDateStr ? initialReminders.filter((r) => r.due_at.slice(0, 10) === selectedDateStr) : []

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b p-4">
        <div className="flex items-center justify-between">
          <h1 className="font-bold">Calendar</h1>
          <div className="flex gap-1 bg-slate-100 rounded-full p-1">
            {(["month", "week", "day"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-3 py-1 rounded-full text-xs font-medium ${view === v ? "bg-white shadow" : "text-slate-500"}`}
              >
                {v === "month" ? "เดือน" : v === "week" ? "สัปดาห์" : "วัน"}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between mt-3">
          <button onClick={() => navigate(-1)} className="w-8 h-8 rounded-full border flex items-center justify-center">‹</button>
          <span className="font-medium">{formatMonthYear(year, month)}</span>
          <button onClick={() => navigate(1)} className="w-8 h-8 rounded-full border flex items-center justify-center">›</button>
        </div>
        <div className="flex gap-2 mt-2">
          <button onClick={() => { setYear(today.getFullYear()); setMonth(today.getMonth()); setSelectedDay(today.getDate()) }} className="text-xs border rounded-full px-3 py-1">
            วันนี้
          </button>
          <a href="/reminders" className="ml-auto text-xs bg-slate-900 text-white rounded-full px-3 py-1">
            + Reminder
          </a>
        </div>
      </header>

      <div className="flex-1 p-4 space-y-4 overflow-auto">
        {view === "month" && (
          <MonthGrid year={year} month={month} reminders={initialReminders} selectedDay={selectedDay} onSelectDay={setSelectedDay} />
        )}
        {view === "week" && (
          <Card>
            <CardContent className="py-8 text-center text-sm text-slate-500">Week view — แสดง 7 วันของสัปดาห์ที่เลือก (Phase 06 stub, ใช้ mock data เดียวกับ Month)</CardContent>
          </Card>
        )}
        {view === "day" && (
          <Card>
            <CardContent className="py-8 text-center text-sm text-slate-500">Day view — แสดงรายการทั้งวัน (ใช้ selectedDay เดียวกัน)</CardContent>
          </Card>
        )}

        <div>
          <h3 className="text-xs font-semibold text-slate-500 tracking-wide mb-2">{selectedDateStr ? `วันที่ ${selectedDateStr}` : "เลือกรันที่"} • {selectedReminders.length} รายการ</h3>
          {selectedReminders.length === 0 ? (
            <Card>
              <CardContent className="py-6 text-center text-sm text-slate-400">ไม่มี Reminder — แตะวันที่อื่นหรือ <a href="/reminders" className="text-sky-600 underline">สร้างใหม่</a></CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {selectedReminders.map((r) => (
                <Card key={r.id}>
                  <CardContent className="py-3 flex gap-3 items-center">
                    <span className="text-lg">{r.category === "vehicle" ? "🚗" : r.category === "medical" ? "💊" : "🔔"}</span>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{r.title}</div>
                      <div className="text-xs text-slate-500">{new Date(r.due_at).toLocaleTimeString("th-TH", { timeZone: "Asia/Bangkok", hour: "2-digit", minute: "2-digit" })} • {r.priority} • {r.status}</div>
                    </div>
                    <span className="text-xs border rounded-full px-2 py-1">{r.category}</span>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <BottomNav active="calendar" />
    </main>
  )
}
