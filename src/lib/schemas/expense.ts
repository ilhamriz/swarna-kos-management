import { z } from "zod"

export const expenseCategories = [
  "listrik",
  "sampah",
  "air",
  "wifi",
  "maintenance",
  "lainnya",
] as const

export const expenseSchema = z.object({
  category: z.enum(expenseCategories, {
    message: "Kategori wajib dipilih",
  }),
  amount: z.number().min(1, "Nominal wajib diisi"),
  expense_date: z.string().min(1, "Tanggal wajib diisi"),
  description: z.string().optional(),
})

export type ExpenseInput = z.infer<typeof expenseSchema>

export const expenseCategoryLabels: Record<(typeof expenseCategories)[number], string> = {
  listrik: "Listrik",
  sampah: "Sampah",
  air: "Air",
  wifi: "WiFi",
  maintenance: "Maintenance",
  lainnya: "Lainnya",
}
