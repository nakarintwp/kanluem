"use client"

import { useState } from "react"
import { parseVoiceInput } from "@/features/voice/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BottomNav } from "@/components/layout/BottomNav"

export default function VoicePage() {
  const [text, setText] = useState("พรุ่งนี้ 8 โมงเอา Civic ไปเปลี่ยนน้ำมันเครื่อง")
  const [recording, setRecording] = useState(false)
  const parsed = parseVoiceInput(text)

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b p-4">
        <h1 className="font-bold">พูดบันทึก 🎤</h1>
        <p className="text-xs text-slate-500">Record → STT → Intent Parser → Preview → Confirm</p>
      </header>
      <div className="flex-1 p-4 space-y-4 overflow-auto max-w-2xl mx-auto w-full">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">ทดสอบ STT (stub)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-center">
              <button
                onClick={() => setRecording(!recording)}
                className={`w-24 h-24 rounded-full flex items-center justify-center text-3xl ${recording ? "bg-red-500 text-white animate-pulse" : "bg-sky-600 text-white"}`}
              >
                🎤
              </button>
            </div>
            <p className="text-xs text-center text-slate-500">{recording ? "กำลังอัด..." : "กดเพื่ออัด (stub)"} — Phase 15 STT จะต่อ provider จริง (Blueprint §9)</p>
            <textarea value={text} onChange={(e) => setText(e.target.value)} className="w-full border rounded-xl px-3 py-2 text-sm" rows={3} placeholder="พิมพ์หรือพูดสิ่งที่ต้องทำ" />
            <div className="bg-sky-50 border border-sky-200 rounded-xl p-3 text-sm">
              <div className="font-medium">ผมเข้าใจว่า</div>
              <div className="mt-1 space-y-1 text-xs">
                <div>🚗 {parsed.category === "vehicle" ? "Civic" : "-"} </div>
                <div>🔧 เปลี่ยนน้ำมันเครื่อง</div>
                <div>📅 พรุ่งนี้ (stub)</div>
                <div>⏰ {parsed.time || "-"}</div>
                <div className="text-slate-500">Category: {parsed.category}</div>
              </div>
              <div className="mt-2 flex gap-2">
                <Button size="sm" className="flex-1">
                  บันทึก
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  แก้ไข
                </Button>
              </div>
            </div>
            <p className="text-[11px] text-slate-500">ต้องให้ผู้ใช้ยืนยันก่อนบันทึก — ห้ามสร้าง Reminder สำคัญโดยไม่ยืนยัน</p>
          </CardContent>
        </Card>
      </div>
      <BottomNav active="more" />
    </main>
  )
}
