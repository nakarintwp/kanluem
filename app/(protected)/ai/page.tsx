"use client"

import { useState } from "react"
import { parseSmartReminder } from "@/features/ai/parser"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BottomNav } from "@/components/layout/BottomNav"

export default function AIPage() {
  const [input, setInput] = useState("พรุ่งนี้ 8 โมงเอา Civic ไปเปลี่ยนน้ำมันเครื่อง")
  const parsed = parseSmartReminder(input)

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b p-4">
        <h1 className="font-bold">AI Assistant 🤖</h1>
        <p className="text-xs text-slate-500">Thai natural language → Intent / Date / Time / Category / Person</p>
      </header>
      <div className="flex-1 p-4 space-y-4 overflow-auto max-w-2xl mx-auto w-full">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">ทดสอบ Smart Reminder</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <textarea value={input} onChange={(e) => setInput(e.target.value)} className="w-full border rounded-xl px-3 py-2 text-sm" rows={2} />
            <div className="bg-slate-900 text-white rounded-xl p-3 text-xs font-mono">
              <div>Category: {parsed.category}</div>
              <div>Vehicle: {parsed.vehicle || "-"}</div>
              <div>Task: {parsed.task}</div>
              <div>Time: {parsed.time || "-"}</div>
              <div>Date: {parsed.date || "-"}</div>
            </div>
            <div className="bg-sky-50 border border-sky-200 rounded-xl p-3 text-sm">
              <div className="font-medium">ผมเข้าใจว่า</div>
              <div className="mt-1">🚗 {parsed.vehicle || "รถ"} 🔧 {parsed.task} 📅 {parsed.date || "พรุ่งนี้"} ⏰ {parsed.time || "-"}</div>
              <div className="mt-2 flex gap-2">
                <Button size="sm" className="flex-1">
                  บันทึก
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  แก้ไข
                </Button>
              </div>
            </div>
            <p className="text-[11px] text-slate-500">Provider abstraction: `features/ai/provider.ts` — เปลี่ยน LLM ได้โดยไม่แก้ caller (Blueprint §2)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-xs text-slate-500">
            ตัวอย่าง: &quot;พรุ่งนี้ 8 โมงเอา Civic ไปเปลี่ยนน้ำมันเครื่อง&quot; → Category: Vehicle, Vehicle: Civic, Task: เปลี่ยนน้ำมันเครื่อง, Date: tomorrow, Time: 08:00
          </CardContent>
        </Card>
      </div>
      <BottomNav active="more" />
    </main>
  )
}
