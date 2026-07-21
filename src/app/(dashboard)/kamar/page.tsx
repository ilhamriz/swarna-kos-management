"use client"

import Link from "next/link"
import { useRooms } from "@/lib/queries/rooms"

function getRoomStatus(tenants: { is_active: boolean }[]) {
  const hasActiveTenant = tenants.some((t) => t.is_active)
  return hasActiveTenant ? "terisi" : "kosong"
}

export default function KamarPage() {
  const { data: rooms, isLoading, error } = useRooms()

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="h-8 w-32 bg-bg-elevated rounded animate-pulse mb-4" />
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-28 bg-bg-elevated rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 text-center text-sm text-danger">
        Gagal memuat data kamar. Coba refresh halaman.
      </div>
    )
  }

  const terisi = rooms?.filter((r) => getRoomStatus(r.tenants) === "terisi").length ?? 0
  const kosong = (rooms?.length ?? 0) - terisi

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-semibold text-text-primary">Kamar</h1>
        <div className="flex gap-2 text-xs">
          <span className="px-2 py-1 bg-success-bg text-success rounded-full">{terisi} terisi</span>
          <span className="px-2 py-1 bg-warning-bg text-warning rounded-full">{kosong} kosong</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {rooms?.map((room) => {
          const status = getRoomStatus(room.tenants)
          const activeTenants = room.tenants.filter((t: { is_active: boolean }) => t.is_active)

          return (
            <Link
              key={room.id}
              href={`/kamar/${room.id}`}
              className="bg-bg-surface rounded-xl p-4 border border-border shadow-sm active:scale-95 transition-transform"
            >
              <div className="flex items-start justify-between mb-3">
                <span className="text-2xl font-bold text-text-primary">{room.room_number}</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium
                  ${
                    status === "terisi"
                      ? "bg-success-bg text-success"
                      : "bg-warning-bg text-warning"
                  }`}
                >
                  {status === "terisi" ? "Terisi" : "Kosong"}
                </span>
              </div>
              <p className="text-sm font-medium text-text-primary">
                Rp {room.price.toLocaleString("id-ID")}
              </p>
              <p className="text-xs text-text-muted mt-0.5">
                {activeTenants.length > 0
                  ? `${activeTenants.length} penghuni`
                  : "Belum ada penghuni"}
              </p>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
