import { z } from "zod"

export const invoiceSchema = z
  .object({
    period_start: z.string().min(1, "Tanggal mulai periode wajib diisi"),
    period_end: z.string().min(1, "Tanggal akhir periode wajib diisi"),
    amount_due: z.number().min(1, "Nominal wajib diisi"),
    due_date: z.string().min(1, "Jatuh tempo wajib diisi"),
    notes: z.string().optional(),
  })
  .refine((data) => new Date(data.due_date) >= new Date(data.period_start), {
    message: "Jatuh tempo tidak boleh sebelum periode mulai",
    path: ["due_date"],
  })
  .refine((data) => new Date(data.period_end) >= new Date(data.period_start), {
    message: "Periode akhir tidak boleh sebelum periode mulai",
    path: ["period_end"],
  })

export type InvoiceInput = z.infer<typeof invoiceSchema>
