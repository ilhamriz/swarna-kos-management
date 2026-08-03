// penghuni/[id]/invoice/[invoiceId]
"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { invoiceSchema, type InvoiceInput } from "@/lib/schemas/invoice"
import {
  useInvoice,
  useUpdateInvoice,
  useDeleteInvoice,
  useTenantInvoices,
} from "@/lib/queries/invoices"
import { useTenantPayments } from "@/lib/queries/payments"
import { deriveInvoiceStatuses } from "@/lib/invoice-status"
import { Button } from "@/components/ui/Button"
import { ConfirmDialog } from "@/components/ui/ConfirmDialog"
import { FormGroup } from "@/components/ui/form/FormGroup"
import { Input } from "@/components/ui/form/Input"
import { CurrencyInput } from "@/components/ui/form/CurrencyInput"
import { Textarea } from "@/components/ui/form/Textarea"
import { PageHeader } from "@/components/layout/PageHeader"
import { cn, formatRupiah } from "@/lib/utils"

const statusStyles = {
  lunas: "bg-success-bg text-success",
  belum: "bg-warning-bg text-warning",
  telat: "bg-danger-bg text-danger",
}

const statusLabels = {
  lunas: "Lunas",
  belum: "Belum",
  telat: "Telat",
}

function formatPeriod(start: string, end: string) {
  const options: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" }
  return `${new Date(start).toLocaleDateString("id-ID", options)} - ${new Date(
    end
  ).toLocaleDateString("id-ID", {
    ...options,
    year: "numeric",
  })}`
}

export default function InvoiceDetailPage() {
  const { id: tenantId, invoiceId } = useParams<{ id: string; invoiceId: string }>()
  const router = useRouter()
  const { data: invoice, isLoading: invoiceLoading } = useInvoice(invoiceId)
  const { data: payments, isLoading: paymentsLoading } = useTenantPayments(tenantId)
  const { data: allInvoices, isLoading: allInvoicesLoading } = useTenantInvoices(tenantId)
  const updateInvoice = useUpdateInvoice()
  const deleteInvoice = useDeleteInvoice()
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  const totalPaid = payments?.reduce((sum, payment) => sum + payment.amount, 0) ?? 0

  const invoicesWithStatus = deriveInvoiceStatuses(allInvoices ?? [], totalPaid)
  const derivedInvoice = invoicesWithStatus.find((inv) => inv.id === invoiceId) ?? null

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<InvoiceInput>({
    resolver: zodResolver(invoiceSchema),
  })

  useEffect(() => {
    if (invoice) {
      reset({
        period_start: invoice.period_start,
        period_end: invoice.period_end,
        due_date: invoice.due_date,
        amount_due: invoice.amount_due,
        notes: invoice.notes ?? "",
      })
    }
  }, [invoice, reset])

  async function onSubmit(values: InvoiceInput) {
    if (!invoice) return
    await updateInvoice.mutateAsync({ id: invoiceId, tenantId, data: values })
    setIsEditing(false)
  }

  async function handleDeleteConfirm() {
    await deleteInvoice.mutateAsync({ id: invoiceId, tenantId })
    router.push(`/penghuni/${tenantId}`)
  }

  if (invoiceLoading || paymentsLoading || allInvoicesLoading || !invoice) {
    return (
      <div className="p-4 space-y-3">
        <div className="h-6 w-32 bg-bg-elevated rounded animate-pulse" />
        <div className="h-48 bg-bg-elevated rounded-xl animate-pulse" />
      </div>
    )
  }

  return (
    <div className="p-4">
      <PageHeader
        title="Detail Invoice"
        showBack
        action={{
          label: isEditing ? "Batal" : "Edit",
          onClick: () => setIsEditing((value) => !value),
          variant: "ghost",
        }}
      />

      {isEditing ? (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormGroup label="Periode Mulai" required error={errors.period_start?.message}>
            <Input {...register("period_start")} type="date" />
          </FormGroup>

          <FormGroup label="Periode Akhir" required error={errors.period_end?.message}>
            <Input {...register("period_end")} type="date" />
          </FormGroup>

          <FormGroup label="Nominal" required error={errors.amount_due?.message}>
            <CurrencyInput name="amount_due" control={control} />
          </FormGroup>

          <FormGroup label="Jatuh Tempo" required error={errors.due_date?.message}>
            <Input {...register("due_date")} type="date" />
          </FormGroup>

          <FormGroup label="Catatan" error={errors.notes?.message}>
            <Textarea {...register("notes")} placeholder="Opsional" rows={3} />
          </FormGroup>

          <div className="flex flex-col gap-3">
            <Button type="submit" isLoading={isSubmitting} className="w-full">
              Simpan Perubahan
            </Button>
            <Button
              type="button"
              variant="danger"
              className="text-sm"
              onClick={() => setIsDeleteOpen(true)}
            >
              Hapus Invoice
            </Button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="bg-bg-surface rounded-xl border border-border p-4 space-y-4">
            <div>
              <p className="text-xs text-text-muted">Periode</p>
              <p className="text-sm font-medium text-text-primary">
                {formatPeriod(invoice.period_start, invoice.period_end)}
              </p>
            </div>

            <div>
              <p className="text-xs text-text-muted">Nominal</p>
              <p className="text-sm font-medium text-text-primary">
                {formatRupiah(invoice.amount_due)}
              </p>
            </div>

            <div>
              <p className="text-xs text-text-muted">Jatuh Tempo</p>
              <p className="text-sm font-medium text-text-primary">
                {new Date(invoice.due_date).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>

            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs text-text-muted">Status</p>
                <span
                  className={cn(
                    "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium",
                    statusStyles[derivedInvoice?.status ?? "belum"]
                  )}
                >
                  {statusLabels[derivedInvoice?.status ?? "belum"]}
                </span>
              </div>
            </div>

            {invoice.notes ? (
              <div>
                <p className="text-xs text-text-muted">Catatan</p>
                <p className="text-sm text-text-primary whitespace-pre-line">{invoice.notes}</p>
              </div>
            ) : null}
          </div>

          <Button
            type="button"
            variant="danger"
            className="text-sm"
            onClick={() => setIsDeleteOpen(true)}
          >
            Hapus Invoice
          </Button>
        </div>
      )}

      <ConfirmDialog
        isOpen={isDeleteOpen}
        title="Hapus Invoice?"
        description="Menghapus invoice ini akan mengubah alokasi pembayaran dan status invoice lain secara otomatis. Tindakan ini tidak bisa dibatalkan."
        onConfirm={handleDeleteConfirm}
        onCancel={() => setIsDeleteOpen(false)}
        confirmLabel="Hapus"
        cancelLabel="Batal"
        variant="danger"
        isLoading={deleteInvoice?.isPending}
      />
    </div>
  )
}
