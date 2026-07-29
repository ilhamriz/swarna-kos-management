"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { tenantCreateSchema, tenantEditSchema } from "@/lib/schemas/tenant"
import type { TenantEditInput } from "@/lib/schemas/tenant"
import { useRooms } from "@/lib/queries/rooms"
import { useCreateTenant, useUpdateTenant } from "@/lib/queries/tenants"
import { FormGroup } from "@/components/ui/form/FormGroup"
import { Input } from "@/components/ui/form/Input"
import { Select } from "@/components/ui/form/Select"
import { FileInput } from "@/components/ui/form/FileInput"
import { Button } from "@/components/ui/Button"
import { useRouter } from "next/navigation"
import { fromWhatsappFormat, toWhatsappFormat } from "@/lib/utils"

interface TenantFormProps {
  mode: "create" | "edit"
  tenantId?: string
  defaultValues?: Partial<TenantEditInput>
  currentKtpUrl?: string | null
  onSuccess?: () => void
}

export function TenantForm({
  mode,
  tenantId,
  defaultValues,
  currentKtpUrl,
  onSuccess,
}: TenantFormProps) {
  const router = useRouter()
  const { data: rooms } = useRooms()
  const createTenant = useCreateTenant()
  const updateTenant = useUpdateTenant()

  const formDefaultValues = defaultValues
    ? {
        ...defaultValues,
        ...(defaultValues.phone_number
          ? { phone_number: fromWhatsappFormat(defaultValues.phone_number) }
          : {}),
      }
    : defaultValues

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TenantEditInput>({
    resolver: zodResolver(mode === "create" ? tenantCreateSchema : tenantEditSchema),
    defaultValues: formDefaultValues,
  })

  const phoneRegister = register("phone_number")
  const emergencyPhoneRegister = register("emergency_contact_phone")

  async function onSubmit(values: TenantEditInput) {
    const payload = {
      ...values,
      phone_number: toWhatsappFormat(values.phone_number),
    }

    if (mode === "create") {
      // Zod's tenantCreateSchema already guaranteed ktp_photo exists at this point,
      // even though TenantEditInput's type says it's optional.
      await createTenant.mutateAsync(payload as TenantEditInput & { ktp_photo: File })
      router.push("/penghuni")
      return
    }

    if (tenantId) {
      await updateTenant.mutateAsync({ id: tenantId, data: payload })
      onSuccess?.()
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormGroup label="Nama Lengkap" required error={errors.full_name?.message}>
        <Input {...register("full_name")} placeholder="Nama sesuai KTP" />
      </FormGroup>

      <FormGroup label="Nomor HP" required error={errors.phone_number?.message}>
        <Input
          {...phoneRegister}
          placeholder="08xxxxxxxxxx"
          type="tel"
          inputMode="numeric"
          onChange={(e) => {
            e.target.value = e.target.value.replace(/\D/g, "")
            phoneRegister.onChange(e)
          }}
        />
      </FormGroup>

      <FormGroup label="Kamar" required error={errors.room_id?.message}>
        <Select {...register("room_id")} defaultValue="">
          <option value="" disabled>
            Pilih kamar
          </option>
          {rooms?.map((room) => (
            <option key={room.id} value={room.id}>
              Kamar {room.room_number}
            </option>
          ))}
        </Select>
      </FormGroup>

      <FormGroup label="Tanggal Masuk" required error={errors.check_in_date?.message}>
        <Input {...register("check_in_date")} type="date" />
      </FormGroup>

      <FormGroup label="Kontak Darurat - Nama" error={errors.emergency_contact_name?.message}>
        <Input {...register("emergency_contact_name")} placeholder="Opsional" />
      </FormGroup>

      <FormGroup label="Kontak Darurat - Nomor HP" error={errors.emergency_contact_phone?.message}>
        <Input
          {...emergencyPhoneRegister}
          placeholder="Opsional"
          type="tel"
          inputMode="numeric"
          onChange={(e) => {
            e.target.value = e.target.value.replace(/\D/g, "")
            emergencyPhoneRegister.onChange(e)
          }}
        />
      </FormGroup>

      <FormGroup
        label="Foto KTP"
        required={mode === "create"}
        hint={
          mode === "edit" && currentKtpUrl
            ? "Biarkan kosong jika tidak ingin mengganti foto"
            : undefined
        }
        error={errors.ktp_photo?.message}
      >
        <FileInput name="ktp_photo" control={control} />
      </FormGroup>

      <Button type="submit" isLoading={isSubmitting} className="w-full">
        {mode === "create" ? "Tambah Penghuni" : "Simpan Perubahan"}
      </Button>
    </form>
  )
}
