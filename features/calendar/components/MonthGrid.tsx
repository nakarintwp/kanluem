"use client"

import { getMonthMatrix, groupByDate } from "@/features/calendar/utils"

type Reminder = { id: string; title: string; due_at: string; category: string }

export function MonthGrid({
  year,
  month,
  reminders,
  selectedDay,
  onSelectDay,
}: {
  year: number
  month: number
  reminders: Reminder[]
  selectedDay: number | null
  onSelectDay: (day: number) => void
}) {
  const matrix = getMonthMatrix(year, month)
  const grouped = groupByDate(reminders as { id: string; title: string; due_at: string }[])
  const today = new Date()
  const isToday = (d: number) => today.getFullYear() === year && today.getMonth() === month && today.getDate() === d

  return (
    <div className="bg-white rounded-2xl border overflow-hidden">
      <div className="grid grid-cols-7 bg-slate-50 border-b text-center text-xs font-medium text-slate-500">
        {["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"].map((d) => (
          <div key={d} className="py-2">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {matrix.flat().map((day, idx) => {
          if (day === null) return <div key={idx} className="h-20 border-r border-b bg-slate-50/50" />
          const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
          const dayReminders = grouped[dateStr] || []
          const selected = selectedDay === day
          const todayFlag = isToday(day)
          return (
            <button
              key={idx}
              onClick={() => onSelectDay(day)}
              className={`h-20 border-r border-b p-1 text-left relative hover:bg-sky-50 transition ${selected ? "bg-sky-100 ring-1 ring-sky-300" : ""}`}
            >
              <span className={`inline-flex w-6 h-6 items-center justify-center rounded-full text-xs ${todayFlag ? "bg-slate-900 text-white" : selected ? "bg-sky-600 text-white" : "text-slate-700"}`}>{day}</span>
              {dayReminders.length > 0 && (
                <div className="mt-1 space-y-0.5">
                  {dayReminders.slice(0, 2).map((r) => (
                    <div key={r.id} className="text-[10px] bg-sky-600 text-white rounded px-1 truncate">
                      {r.title}
                    </div>
                  ))}
                  {dayReminders.length > 2 && <div className="text-[10px] text-slate-500">+{dayReminders.length - 2} อื่นๆ</div>}
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
