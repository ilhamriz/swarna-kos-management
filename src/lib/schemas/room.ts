import { z } from "zod"

export const roomSchema = z.object({
  room_number: z.string().min(1, "Nomor kamar wajib diisi"),
  price: z.number().min(1, "Harga wajib diisi"),
  facilities: z.string().optional(),
})

export type RoomInput = z.infer<typeof roomSchema>
