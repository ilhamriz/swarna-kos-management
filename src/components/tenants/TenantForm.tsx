"use client"

import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { tenantCreateSchema, tenantEditSchema } from "@/lib/schemas/tenant"
import type { TenantEditInput } from "@/lib/schemas/tenant"
import { useRooms } from "@/lib/queries/rooms"
import { useCreateTenant, useUpdateTenant } from "@/lib/queries/tenants"
import { FormGroup } from "@/components/ui/form/FormGroup"
import { Input } from "@/components/ui/form/Input"
import { Select } from "@/components/ui/form/Select"
import { Button } from "@/components/ui/Button"
import { useRouter } from "next/navigation"

interface TenantFormProps {
  mode: "create" | "edit"
  tenantId?: string
  defaultValues?: Partial<TenantEditInput>
  currentKtpUrl?: string | null
}

export function TenantForm({ mode, tenantId, defaultValues, currentKtpUrl }: TenantFormProps) {
  const router = useRouter()
  const { data: rooms } = useRooms()
  const createTenant = useCreateTenant()
  const updateTenant = useUpdateTenant()

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TenantEditInput>({
    resolver: zodResolver(mode === "create" ? tenantCreateSchema : tenantEditSchema),
    defaultValues,
  })

  async function onSubmit(values: TenantEditInput) {
    if (mode === "create") {
      // Zod's tenantCreateSchema already guaranteed ktp_photo exists at this point,
      // even though TenantEditInput's type says it's optional.
      await createTenant.mutateAsync(values as TenantEditInput & { ktp_photo: File })
    } else if (tenantId) {
      await updateTenant.mutateAsync({ id: tenantId, data: values })
    }
    router.push(mode === "create" ? "/penghuni" : `/penghuni/${tenantId}`)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormGroup label="Nama Lengkap" required error={errors.full_name?.message}>
        <Input {...register("full_name")} placeholder="Nama sesuai KTP" />
      </FormGroup>

      <FormGroup label="Nomor HP" required error={errors.phone_number?.message}>
        <Input {...register("phone_number")} placeholder="08xxxxxxxxxx" type="tel" />
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
        <Input {...register("emergency_contact_phone")} placeholder="Opsional" type="tel" />
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
        <Controller
          name="ktp_photo"
          control={control}
          render={({ field: { onChange, onBlur, name, ref } }) => (
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              name={name}
              ref={ref}
              onBlur={onBlur}
              onChange={(e) => onChange(e.target.files?.[0])}
              className="w-full text-sm text-text-secondary file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border file:bg-bg-elevated file:text-text-primary file:text-sm file:border-border-strong hover:file:bg-bg-surface file:transition-all file:duration-300 cursor-pointer file:cursor-pointer"
            />
          )}
        />
      </FormGroup>

      <Button type="submit" isLoading={isSubmitting} className="w-full">
        {mode === "create" ? "Tambah Penghuni" : "Simpan Perubahan"}
      </Button>
    </form>
  )
}
