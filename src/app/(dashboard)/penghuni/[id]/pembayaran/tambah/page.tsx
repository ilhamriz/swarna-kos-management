"use client"

import { useParams, useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { paymentSchema, type PaymentInput } from "@/lib/schemas/payment"
import { useCreatePayment } from "@/lib/queries/payments"
import { FormGroup } from "@/components/ui/form/FormGroup"
import { Input } from "@/components/ui/form/Input"
import { Textarea } from "@/components/ui/form/Textarea"
import { Select } from "@/components/ui/form/Select"
import { FileInput } from "@/components/ui/form/FileInput"
import { Button } from "@/components/ui/Button"
import { PageHeader } from "@/components/layout/PageHeader"

export default function TambahPembayaranPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const createPayment = useCreatePayment()

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PaymentInput>({
    resolver: zodResolver(paymentSchema),
  })

  async function onSubmit(values: PaymentInput) {
    await createPayment.mutateAsync({ tenantId: id, data: values })
    router.push(`/penghuni/${id}`)
  }

  return (
    <div className="p-4">
      <PageHeader
        title="Catat Pembayaran"
        action={{ label: "Batal", onClick: () => router.back() }}
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormGroup label="Nominal" required error={errors.amount?.message}>
          <Input prefix="Rp" type="number" {...register("amount", { valueAsNumber: true })} />
        </FormGroup>

        <FormGroup label="Metode Pembayaran" required error={errors.payment_method?.message}>
          <Select {...register("payment_method")} defaultValue="">
            <option value="" disabled>
              Pilih metode
            </option>
            <option value="cash">Tunai</option>
            <option value="transfer">Transfer</option>
          </Select>
        </FormGroup>

        <FormGroup label="Tanggal Bayar" required error={errors.paid_at?.message}>
          <Input {...register("paid_at")} type="date" />
        </FormGroup>

        <FormGroup label="Foto Bukti" hint="Opsional" error={errors.proof?.message}>
          <FileInput name="proof" control={control} />
        </FormGroup>

        <FormGroup label="Catatan" error={errors.notes?.message}>
          <Textarea {...register("notes")} placeholder="Opsional" rows={3} />
        </FormGroup>

        <Button type="submit" isLoading={isSubmitting} className="w-full">
          Simpan Pembayaran
        </Button>
      </form>
    </div>
  )
}
