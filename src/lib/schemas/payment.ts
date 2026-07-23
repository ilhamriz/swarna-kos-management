import { z } from "zod"

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"]

const proofPhotoSchema = z
  .instanceof(File)
  .refine((file) => file.size <= MAX_FILE_SIZE, "Ukuran foto maksimal 5MB")
  .refine(
    (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
    "Format foto harus JPG, PNG, atau WebP"
  )

export const paymentSchema = z.object({
  amount: z.number().min(1, "Nominal wajib diisi"),
  payment_method: z.enum(["cash", "transfer"], {
    message: "Metode pembayaran wajib dipilih",
  }),
  paid_at: z.string().min(1, "Tanggal bayar wajib diisi"),
  proof: proofPhotoSchema.optional(),
  notes: z.string().optional(),
})

export type PaymentInput = z.infer<typeof paymentSchema>
