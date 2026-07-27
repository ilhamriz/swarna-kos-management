"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  expenseSchema,
  expenseCategories,
  expenseCategoryLabels,
  type ExpenseInput,
} from "@/lib/schemas/expense"
import { useExpense, useUpdateExpense, useDeleteExpense } from "@/lib/queries/expenses"
import { PageHeader } from "@/components/layout/PageHeader"
import { FormGroup } from "@/components/ui/form/FormGroup"
import { Input } from "@/components/ui/form/Input"
import { Textarea } from "@/components/ui/form/Textarea"
import { Select } from "@/components/ui/form/Select"
import { Button } from "@/components/ui/Button"
import { ConfirmDialog } from "@/components/ui/ConfirmDialog"
import { formatRupiah } from "@/lib/utils"

export default function ExpenseDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { data: expense, isLoading } = useExpense(id)
  const updateExpense = useUpdateExpense()
  const deleteExpense = useDeleteExpense()
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ExpenseInput>({
    resolver: zodResolver(expenseSchema),
  })

  useEffect(() => {
    if (expense) {
      reset({
        category: expense.category,
        amount: expense.amount,
        expense_date: expense.expense_date,
        description: expense.description ?? "",
      })
    }
  }, [expense, reset])

  async function onSubmit(values: ExpenseInput) {
    await updateExpense.mutateAsync({ id, data: values })
    setIsEditing(false)
  }

  async function handleDeleteConfirm() {
    await deleteExpense.mutateAsync(id)
    router.push("/keuangan")
  }

  if (isLoading || !expense) {
    return (
      <div className="p-4 space-y-3">
        <div className="h-6 w-32 bg-bg-elevated rounded animate-pulse" />
        <div className="h-40 bg-bg-elevated rounded-xl animate-pulse" />
      </div>
    )
  }

  return (
    <div className="p-4">
      <PageHeader
        title="Detail Pengeluaran"
        showBack
        action={{
          label: isEditing ? "Batal" : "Edit",
          onClick: () => setIsEditing((v) => !v),
          variant: "ghost",
        }}
      />

      {isEditing ? (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormGroup label="Kategori" required error={errors.category?.message}>
            <Select {...register("category")}>
              {expenseCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {expenseCategoryLabels[cat]}
                </option>
              ))}
            </Select>
          </FormGroup>

          <FormGroup label="Nominal" required error={errors.amount?.message}>
            <Input prefix="Rp" type="number" {...register("amount", { valueAsNumber: true })} />
          </FormGroup>

          <FormGroup label="Tanggal" required error={errors.expense_date?.message}>
            <Input {...register("expense_date")} type="date" />
          </FormGroup>

          <FormGroup label="Deskripsi" error={errors.description?.message}>
            <Textarea {...register("description")} placeholder="Opsional" rows={3} />
          </FormGroup>

          <Button type="submit" isLoading={isSubmitting} className="w-full">
            Simpan Perubahan
          </Button>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="bg-bg-surface rounded-xl border border-border p-4 space-y-4">
            <div>
              <p className="text-xs text-text-muted">Kategori</p>
              <p className="text-sm font-medium text-text-primary">
                {expenseCategoryLabels[expense.category]}
              </p>
            </div>
            <div>
              <p className="text-xs text-text-muted">Nominal</p>
              <p className="text-sm font-medium text-text-primary">
                {formatRupiah(expense.amount)}
              </p>
            </div>
            <div>
              <p className="text-xs text-text-muted">Tanggal</p>
              <p className="text-sm font-medium text-text-primary">
                {new Date(expense.expense_date).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
            {expense.description && (
              <div>
                <p className="text-xs text-text-muted">Deskripsi</p>
                <p className="text-sm text-text-primary whitespace-pre-line">
                  {expense.description}
                </p>
              </div>
            )}
          </div>

          <Button variant="ghost_danger" onClick={() => setIsDeleteOpen(true)} className="w-fit">
            Hapus Pengeluaran
          </Button>
        </div>
      )}

      <ConfirmDialog
        isOpen={isDeleteOpen}
        title="Hapus Pengeluaran?"
        description="Tindakan ini tidak bisa dibatalkan."
        onConfirm={handleDeleteConfirm}
        onCancel={() => setIsDeleteOpen(false)}
        confirmLabel="Hapus"
        variant="danger"
        isLoading={deleteExpense.isPending}
      />
    </div>
  )
}
