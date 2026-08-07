"use client"

import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { invoiceSchema, type InvoiceInput } from "@/lib/schemas/invoice"
import { useCreateInvoice } from "@/lib/queries/invoices"
import { FormGroup } from "@/components/ui/form/FormGroup"
import { Input } from "@/components/ui/form/Input"
import { CurrencyInput } from "@/components/ui/form/CurrencyInput"
import { Textarea } from "@/components/ui/form/Textarea"
import { Button } from "@/components/ui/Button"
import { PageHeader } from "@/components/layout/PageHeader"

export default function TambahInvoicePage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const createInvoice = useCreateInvoice()

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<InvoiceInput>({
    resolver: zodResolver(invoiceSchema),
  })

  async function onSubmit(values: InvoiceInput) {
    try {
      await createInvoice.mutateAsync({ tenantId: id, data: values })
      toast.success("Invoice berhasil dibuat")
      router.push(`/penghuni/${id}`)
    } catch {
      toast.error("Gagal menyimpan data, coba lagi.")
    }
  }

  return (
    <div className="p-4">
      <PageHeader title="Buat Invoice" action={{ label: "Batal", onClick: () => router.back() }} />

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

        <Button type="submit" isLoading={isSubmitting} className="w-full">
          Simpan Invoice
        </Button>
      </form>
    </div>
  )
}
