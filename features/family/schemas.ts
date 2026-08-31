import { z } from "zod"

export const createFamilySchema = z.object({
  name: z.string().min(2, "ชื่ออย่างน้อย 2 ตัวอักษร").max(50, "ชื่อยาวเกิน 50 ตัวอักษร").trim(),
})

export type CreateFamilyInput = z.infer<typeof createFamilySchema>
