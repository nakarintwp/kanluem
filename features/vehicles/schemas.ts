import { z } from "zod"

export const vehicleSchema = z.object({
  brand: z.string().min(1, "ต้องมีแบรนด์").max(50),
  model: z.string().min(1, "ต้องมีรุ่น").max(50),
  registration: z.string().min(1, "ต้องมีทะเบียน").max(20),
  year: z.coerce.number().min(1900).max(2100).optional().nullable(),
  current_mileage: z.coerce.number().min(0).optional().nullable(),
})

export type VehicleInput = z.infer<typeof vehicleSchema>
