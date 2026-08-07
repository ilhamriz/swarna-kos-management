"use client"

import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { roomSchema, type RoomInput } from "@/lib/schemas/room"
import { useCreateRoom } from "@/lib/queries/rooms"
import { FormGroup } from "@/components/ui/form/FormGroup"
import { Input } from "@/components/ui/form/Input"
import { CurrencyInput } from "@/components/ui/form/CurrencyInput"
import { Textarea } from "@/components/ui/form/Textarea"
import { Button } from "@/components/ui/Button"
import { PageHeader } from "@/components/layout/PageHeader"

export default function TambahKamarPage() {
  const router = useRouter()
  const createRoom = useCreateRoom()

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RoomInput>({
    resolver: zodResolver(roomSchema),
  })

  async function onSubmit(values: RoomInput) {
    try {
      await createRoom.mutateAsync(values)
      toast.success("Kamar berhasil ditambahkan")
      router.push("/kamar")
    } catch {
      toast.error("Gagal menyimpan data, coba lagi.")
    }
  }

  return (
    <div className="p-4">
      <PageHeader title="Tambah Kamar" action={{ label: "Batal", onClick: () => router.back() }} />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormGroup label="Nomor Kamar" required error={errors.room_number?.message}>
          <Input {...register("room_number")} placeholder="Contoh: 9" />
        </FormGroup>

        <FormGroup label="Harga Sewa" required error={errors.price?.message}>
          <CurrencyInput name="price" control={control} placeholder="500.000" />
        </FormGroup>

        <FormGroup label="Fasilitas" error={errors.facilities?.message}>
          <Textarea
            {...register("facilities")}
            placeholder="Pisahkan dengan koma. Contoh: Kasur, lemari, AC"
            rows={3}
          />
        </FormGroup>

        <Button type="submit" isLoading={isSubmitting} className="w-full">
          Simpan Kamar
        </Button>
      </form>
    </div>
  )
}
