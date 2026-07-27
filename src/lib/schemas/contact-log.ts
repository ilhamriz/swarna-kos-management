import { z } from "zod"

export const contactMethods = ["whatsapp", "phone", "other"] as const

export const contactLogSchema = z.object({
  method: z.enum(contactMethods, {
    message: "Metode kontak wajib dipilih",
  }),
  notes: z.string().optional(),
})

export type ContactLogInput = z.infer<typeof contactLogSchema>

export const contactMethodLabels: Record<(typeof contactMethods)[number], string> = {
  whatsapp: "WhatsApp",
  phone: "Telepon",
  other: "Lainnya",
}
