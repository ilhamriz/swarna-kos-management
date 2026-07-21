import { z } from "zod"

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"]

const ktpPhotoSchema = z
  .instanceof(File)
  .refine((file) => file.size <= MAX_FILE_SIZE, "Ukuran foto maksimal 5MB")
  .refine(
    (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
    "Format foto harus JPG, PNG, atau WebP"
  )

const tenantBaseSchema = z.object({
  full_name: z.string().min(1, "Nama lengkap wajib diisi"),
  phone_number: z.string().min(1, "Nomor HP wajib diisi"),
  room_id: z.string().min(1, "Kamar wajib dipilih"),
  emergency_contact_name: z.string().optional(),
  emergency_contact_phone: z.string().optional(),
  check_in_date: z.string().min(1, "Tanggal masuk wajib diisi"),
})

// Create: KTP photo required
export const tenantCreateSchema = tenantBaseSchema.extend({
  ktp_photo: ktpPhotoSchema,
})

// Edit: KTP photo optional (only upload if replacing the existing one)
export const tenantEditSchema = tenantBaseSchema.extend({
  ktp_photo: ktpPhotoSchema.optional(),
})

export type TenantCreateInput = z.infer<typeof tenantCreateSchema>
export type TenantEditInput = z.infer<typeof tenantEditSchema>

// Separate schema for the "tandai keluar" action
export const tenantCheckOutSchema = z.object({
  check_out_date: z.string().min(1, "Tanggal keluar wajib diisi"),
})

export type TenantCheckOutInput = z.infer<typeof tenantCheckOutSchema>
