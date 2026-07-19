"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { useRoom, useUpdateRoom } from "@/lib/queries/rooms"
import { roomSchema, type RoomInput } from "@/lib/schemas/room"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

export default function KamarDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { data: room, isLoading } = useRoom(id)
  const updateRoom = useUpdateRoom()
  const [isEditing, setIsEditing] = useState(false)

  const {
    register,
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
        <div className="h-6 w-24 bg-gray-200 rounded animate-pulse" />
        <div className="h-32 bg-gray-200 rounded-xl animate-pulse" />
      </div>
    )
  }

  if (!room) return null

  const activeTenants = room.tenants.filter((t: { is_active: boolean }) => t.is_active)

  async function onSubmit(values: RoomInput) {
    await updateRoom.mutateAsync({ id, data: values })
    setIsEditing(false)
  }

  return (
    <div className="p-4">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => router.back()} className="text-gray-400 cursor-pointer">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            className="w-5 h-5"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <h1 className="text-lg font-semibold text-gray-900">Kamar {room.room_number}</h1>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="ml-auto text-sm text-blue-600 font-medium"
        >
          {isEditing ? "Batal" : "Edit"}
        </button>
      </div>

      {isEditing ? (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4 bg-white rounded-xl p-4 border border-gray-100"
        >
          <div>
            <label className="block text-xs text-gray-500 mb-1">Nomor Kamar</label>
            <input
              {...register("room_number")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
            {errors.room_number && (
              <p className="text-xs text-red-600 mt-1">{errors.room_number.message}</p>
            )}
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Harga Sewa (Rp)</label>
            <input
              {...register("price", { valueAsNumber: true })}
              type="number"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
            {errors.price && <p className="text-xs text-red-600 mt-1">{errors.price.message}</p>}
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Fasilitas</label>
            <textarea
              {...register("facilities")}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none"
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg disabled:opacity-60"
          >
            {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </form>
      ) : (
        <div className="bg-white rounded-xl p-4 border border-gray-100 mb-4">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm text-gray-500">Harga Sewa</span>
            <span className="text-sm font-semibold text-gray-900">
              Rp {room.price.toLocaleString("id-ID")}/bulan
            </span>
          </div>
          <div>
            <span className="text-sm text-gray-500">Fasilitas</span>
            <p className="text-sm text-gray-900 mt-0.5">{room.facilities ?? "-"}</p>
          </div>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-gray-900">
            Penghuni Aktif ({activeTenants.length})
          </h2>
          <Link href="/penghuni/tambah" className="text-xs text-blue-600 font-medium">
            + Tambah
          </Link>
        </div>

        {activeTenants.length === 0 ? (
          <div className="bg-white rounded-xl p-6 border border-gray-100 text-center">
            <p className="text-sm text-gray-400">Belum ada penghuni di kamar ini</p>
            <Link
              href="/penghuni/tambah"
              className="mt-2 inline-block text-sm text-blue-600 font-medium"
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
                  className="flex items-center gap-3 bg-white rounded-xl p-3 border border-gray-100"
                >
                  <div
                    className="w-9 h-9 rounded-full bg-blue-100 text-blue-600
                  flex items-center justify-center text-sm font-medium shrink-0"
                  >
                    {tenant.full_name
                      .split(" ")
                      .map((n: string) => n[0])
                      .slice(0, 2)
                      .join("")}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{tenant.full_name}</p>
                    <p className="text-xs text-gray-400">
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
                    className="w-4 h-4 text-gray-300 ml-auto"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
                  </svg>
                </Link>
              )
            )}
          </div>
        )}
      </div>
    </div>
  )
}
