import { z } from "zod"

export const financeItemSchema = z.object({
  title: z.string().min(1, "ต้องมีชื่อ").max(100),
  amount: z.coerce.number().min(0, "จำนวนต้อง >=0"),
  due_date: z.string().min(1, "ต้องมีวันครบกำหนด").optional().nullable(),
  category: z.enum(["credit", "loan", "subscription", "utility", "insurance", "other"]).default("other"),
})

export type FinanceItemInput = z.infer<typeof financeItemSchema>
