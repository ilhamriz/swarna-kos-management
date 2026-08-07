"use client"

import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  expenseSchema,
  expenseCategories,
  expenseCategoryLabels,
  type ExpenseInput,
} from "@/lib/schemas/expense"
import { useCreateExpense } from "@/lib/queries/expenses"
import { FormGroup } from "@/components/ui/form/FormGroup"
import { Input } from "@/components/ui/form/Input"
import { CurrencyInput } from "@/components/ui/form/CurrencyInput"
import { Textarea } from "@/components/ui/form/Textarea"
import { Select } from "@/components/ui/form/Select"
import { Button } from "@/components/ui/Button"
import { PageHeader } from "@/components/layout/PageHeader"

export default function TambahPengeluaranPage() {
  const router = useRouter()
  const createExpense = useCreateExpense()

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ExpenseInput>({
    resolver: zodResolver(expenseSchema),
  })

  async function onSubmit(values: ExpenseInput) {
    try {
      await createExpense.mutateAsync(values)
      toast.success("Pengeluaran berhasil ditambahkan")
      router.push("/keuangan")
    } catch {
      toast.error("Gagal menyimpan data, coba lagi.")
    }
  }

  return (
    <div className="p-4">
      <PageHeader
        title="Tambah Pengeluaran"
        action={{ label: "Batal", onClick: () => router.back() }}
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormGroup label="Kategori" required error={errors.category?.message}>
          <Select {...register("category")} defaultValue="">
            <option value="" disabled>
              Pilih kategori
            </option>
            {expenseCategories.map((cat) => (
              <option key={cat} value={cat}>
                {expenseCategoryLabels[cat]}
              </option>
            ))}
          </Select>
        </FormGroup>

        <FormGroup label="Nominal" required error={errors.amount?.message}>
          <CurrencyInput name="amount" control={control} />
        </FormGroup>

        <FormGroup label="Tanggal" required error={errors.expense_date?.message}>
          <Input {...register("expense_date")} type="date" />
        </FormGroup>

        <FormGroup label="Deskripsi" error={errors.description?.message}>
          <Textarea {...register("description")} placeholder="Opsional" rows={3} />
        </FormGroup>

        <Button type="submit" isLoading={isSubmitting} className="w-full">
          Simpan Pengeluaran
        </Button>
      </form>
    </div>
  )
}
