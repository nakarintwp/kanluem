import { z } from "zod"

export const homeItemSchema = z.object({
  title: z.string().min(1, "ต้องมีชื่อ").max(100),
  category: z.enum(["utility", "maintenance", "appliance", "other"]).default("other"),
  description: z.string().max(500).optional().nullable(),
})

export type HomeItemInput = z.infer<typeof homeItemSchema>
