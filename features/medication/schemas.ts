import { z } from "zod"

export const medicationSchema = z.object({
  name: z.string().min(1, "ต้องมีชื่อยา").max(100),
  dosage: z.string().min(1, "ต้องมีขนาด").max(50),
  frequency: z.enum(["once", "daily", "weekly", "custom"]).default("daily"),
  amount_remaining: z.coerce.number().min(0).optional().nullable(),
  start_date: z.string().optional().nullable(),
  end_date: z.string().optional().nullable(),
})

export type MedicationInput = z.infer<typeof medicationSchema>
