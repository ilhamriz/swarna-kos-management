"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { useRoom, useUpdateRoom, useDeleteRoom } from "@/lib/queries/rooms"
import { roomSchema, type RoomInput } from "@/lib/schemas/room"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { FormGroup } from "@/components/ui/form/FormGroup"
import { Input } from "@/components/ui/form/Input"
import { CurrencyInput } from "@/components/ui/form/CurrencyInput"
import { Textarea } from "@/components/ui/form/Textarea"
import { Button } from "@/components/ui/Button"
import { ConfirmDialog } from "@/components/ui/ConfirmDialog"
import { PageHeader } from "@/components/layout/PageHeader"

export default function KamarDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { data: room, isLoading } = useRoom(id)
  const updateRoom = useUpdateRoom()
  const deleteRoom = useDeleteRoom()
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<RoomInput>({
    resolver: zodResolver(roomSchema),
    defaultValues: {
      room_number: "",
      price: 0,
      facilities: "",
    },
  })

  // Isi form setelah data dari Supabase selesai di-fetch
  useEffect(() => {
    if (room) {
      reset({
        room_number: room.room_number,
        price: room.price,
        facilities: room.facilities ?? "",
      })
    }
  }, [room, reset])

  if (isLoading) {
    return (
      <div className="p-4 space-y-3">
        <div className="h-6 w-24 bg-bg-elevated rounded animate-pulse" />
        <div className="h-32 bg-bg-elevated rounded-xl animate-pulse" />
      </div>
    )
  }

  if (!room) return null

  const activeTenants = room.tenants.filter((t) => t.is_active)
  const hasAnyTenantHistory = room.tenants.length > 0

  async function onSubmit(values: RoomInput) {
    await updateRoom.mutateAsync({ id, data: values })
    setIsEditing(false)
  }

  async function handleDeleteConfirm() {
    await deleteRoom.mutateAsync(id)
    setIsDeleteOpen(false)
    router.push("/kamar")
  }

  return (
    <div className="p-4">
      {isEditing ? (
        <PageHeader
          title={`Kamar ${room.room_number}`}
          showBack
          action={{ label: "Batal", onClick: () => setIsEditing(false) }}
        />
      ) : (
        <PageHeader
          title={`Kamar ${room.room_number}`}
          showBack
          menuItems={[
            { label: "Edit", onClick: () => setIsEditing(true) },
            { label: "Hapus", onClick: () => setIsDeleteOpen(true), variant: "danger" },
          ]}
        />
      )}

      {isEditing ? (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4 bg-bg-surface rounded-xl p-4 border border-border"
        >
          <FormGroup label="Nomor Kamar" required error={errors.room_number?.message}>
            <Input {...register("room_number")} placeholder="1" />
          </FormGroup>
          <FormGroup label="Harga Sewa" required error={errors.price?.message}>
            <CurrencyInput name="price" control={control} placeholder="500.000" />
          </FormGroup>

          <FormGroup
            label="Fasilitas"
            error={errors.facilities?.message}
            hint="Pisahkan dengan koma. Contoh: Kasur, lemari, AC"
          >
            <Textarea {...register("facilities")} rows={3} />
          </FormGroup>
          <Button type="submit" isLoading={isSubmitting}>
            Simpan Perubahan
          </Button>
        </form>
      ) : (
        <div className="bg-bg-surface rounded-xl p-4 border border-border mb-4">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm text-text-secondary">Harga Sewa</span>
            <span className="text-sm font-semibold text-text-primary">
              Rp {room.price.toLocaleString("id-ID")}/bulan
            </span>
          </div>
          <div>
            <span className="text-sm text-text-secondary">Fasilitas</span>
            <p className="text-sm text-text-primary mt-0.5">{room.facilities ?? "-"}</p>
          </div>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-text-primary">
            Penghuni Aktif ({activeTenants.length})
          </h2>
          <Link href="/penghuni/tambah" className="text-xs text-primary font-medium">
            + Tambah
          </Link>
        </div>

        {activeTenants.length === 0 ? (
          <div className="bg-bg-surface rounded-xl p-6 border border-border text-center">
            <p className="text-sm text-text-muted">Belum ada penghuni di kamar ini</p>
            <Link
              href="/penghuni/tambah"
              className="mt-2 inline-block text-sm text-primary font-medium"
            >
              Tambah penghuni
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {activeTenants.map(
              (tenant: { id: string; full_name: string; check_in_date: string }) => (
                <Link
                  key={tenant.id}
                  href={`/penghuni/${tenant.id}`}
                  className="flex items-center gap-3 bg-bg-surface rounded-xl p-3 border border-border"
                >
                  <div
                    className="w-9 h-9 rounded-full bg-bg-elevated text-primary
                  flex items-center justify-center text-sm font-medium shrink-0"
                  >
                    {tenant.full_name
                      .split(" ")
                      .map((n: string) => n[0])
                      .slice(0, 2)
                      .join("")}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-primary">{tenant.full_name}</p>
                    <p className="text-xs text-text-muted">
                      Masuk{" "}
                      {new Date(tenant.check_in_date).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    className="w-4 h-4 text-text-muted ml-auto"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
                  </svg>
                </Link>
              )
            )}
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={isDeleteOpen}
        title="Hapus Kamar?"
        description={
          hasAnyTenantHistory
            ? "Kamar ini pernah memiliki penghuni dan tidak bisa dihapus."
            : "Tindakan ini tidak bisa dibatalkan."
        }
        onConfirm={handleDeleteConfirm}
        onCancel={() => setIsDeleteOpen(false)}
        confirmLabel="Hapus"
        variant="danger"
        isLoading={deleteRoom.isPending}
        confirmDisabled={hasAnyTenantHistory}
      />
    </div>
  )
}
