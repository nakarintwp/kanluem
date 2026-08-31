import { z } from "zod"

export const reminderSchema = z.object({
  title: z.string().min(1, "ต้องมีชื่อ").max(100, "ชื่อยาวเกิน 100").trim(),
  description: z.string().max(500).optional().nullable(),
  category: z.enum(["vehicle", "medical", "appointment", "home", "finance", "other"]).default("other"),
  due_at: z.string().refine((v) => !isNaN(Date.parse(v)), "วันที่ไม่ถูกต้อง"),
  timezone: z.string().default("Asia/Bangkok"),
  recurrence: z.string().nullable().optional(),
  reminder_offsets: z.array(z.number()).default([60, 1440]),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  assignee: z.string().uuid().nullable().optional().or(z.literal("")),
  visibility: z.enum(["family", "private", "specific"]).default("family"),
})

export type ReminderInput = z.infer<typeof reminderSchema>
