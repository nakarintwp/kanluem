"use client"

import { useState } from "react"
import { extractDate, suggestReminder } from "@/features/ocr/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BottomNav } from "@/components/layout/BottomNav"

export default function OCRPage() {
  const [text, setText] = useState("กรมธรรม์รถ หมดอายุ 15/12/2026 เลขที่ AB123")
  const date = extractDate(text)
  const suggestion = date ? suggestReminder(date, "กรมธรรม์รถ") : null

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b p-4">
        <h1 className="font-bold">OCR เอกสาร 📄🔍</h1>
        <p className="text-xs text-slate-500">Upload/Camera → OCR → Extract Date → Suggest Reminder → User Confirm</p>
      </header>
      <div className="flex-1 p-4 space-y-4 overflow-auto max-w-2xl mx-auto w-full">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">ทดสอบ OCR (stub)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="border-2 border-dashed rounded-xl p-6 text-center text-xs text-slate-400">📷 อัปโหลด/ถ่ายรูปเอกสาร — OCR จะอ่านวันที่ (stub)</div>
            <textarea value={text} onChange={(e) => setText(e.target.value)} className="w-full border rounded-xl px-3 py-2 text-sm" rows={2} />
            <div className="bg-slate-50 border rounded-xl p-3 text-sm">
              <div className="text-xs font-medium">OCR สกัดได้:</div>
              <div className="text-xs mt-1">วันที่: {date || "-"}</div>
              <div className="text-xs">เลขที่: AB123 (stub)</div>
              {suggestion && (
                <div className="mt-2 bg-sky-50 border border-sky-200 rounded-xl p-2">
                  <div className="text-xs font-medium">เสนอ Reminder:</div>
                  <div className="text-xs">{suggestion.title}</div>
                  <div className="text-[11px] text-slate-500">เตือนก่อน: {suggestion.offsets.join(", ")} วัน</div>
                  <div className="mt-2 flex gap-2">
                    <Button size="sm" className="flex-1">
                      ยืนยันสร้าง
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      แก้ไข
                    </Button>
                  </div>
                </div>
              )}
            </div>
            <p className="text-[11px] text-amber-600">ห้ามสร้าง Reminder สำคัญโดยไม่ให้ผู้ใช้ยืนยันเมื่อ OCR ไม่แน่นอน (Blueprint §17)</p>
          </CardContent>
        </Card>
      </div>
      <BottomNav active="more" />
    </main>
  )
}
