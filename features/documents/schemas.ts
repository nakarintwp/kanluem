import { z } from "zod"

export const documentSchema = z.object({
  name: z.string().min(1, "ต้องมีชื่อเอกสาร").max(100),
  category: z.enum(["vehicle", "medical", "insurance", "bills", "school", "personal", "other"]).default("other"),
  document_number: z.string().max(50).optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
})

export type DocumentInput = z.infer<typeof documentSchema>
