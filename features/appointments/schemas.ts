import { z } from "zod"

export const appointmentSchema = z.object({
  title: z.string().min(1, "ต้องมีชื่อนัด").max(100),
  date: z.string().min(1, "ต้องมีวันที่"),
  time: z.string().min(1, "ต้องมีเวลา").optional().nullable(),
  location: z.string().max(200).optional().nullable(),
  person: z.string().max(100).optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
})

export type AppointmentInput = z.infer<typeof appointmentSchema>
