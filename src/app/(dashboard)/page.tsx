"use client"

import Link from "next/link"
import { useRooms } from "@/lib/queries/rooms"
import { useTenants } from "@/lib/queries/tenants"
import { useAllInvoices } from "@/lib/queries/invoices"
import { useAllPayments } from "@/lib/queries/payments"
import { getReminderInfo, compareReminderBuckets, getUpcomingDueInvoices } from "@/lib/reminder"
import { Button } from "@/components/ui/Button"
import { useState } from "react"
import { TenantPickerDialog } from "@/components/dashboard/TenantPickerDialog"

export default function BerandaPage() {
  const { data: rooms, isLoading: roomsLoading } = useRooms()
  const { data: tenants, isLoading: tenantsLoading } = useTenants()
  const { data: allInvoices, isLoading: invoicesLoading } = useAllInvoices()
  const { data: allPayments, isLoading: paymentsLoading } = useAllPayments()
  const [pickerMode, setPickerMode] = useState<"invoice" | "pembayaran" | null>(null)

  const isLoading = roomsLoading || tenantsLoading || invoicesLoading || paymentsLoading

  const totalKamar = rooms?.length ?? 0
  const terisi =
    rooms?.filter((r) => r.tenants.some((t: { is_active: boolean | null }) => t.is_active))
      .length ?? 0
  const kosong = totalKamar - terisi

  const activeTenants = (tenants ?? []).filter((t) => t.is_active)

  const perluDitagih = activeTenants
    .map((tenant) => {
      const tenantInvoices = (allInvoices ?? []).filter((inv) => inv.tenant_id === tenant.id)
      const tenantPayments = (allPayments ?? []).filter((p) => p.tenant_id === tenant.id)
      const reminderInfo = getReminderInfo(tenantInvoices, tenantPayments)
      return reminderInfo ? { tenant, reminderInfo } : null
    })
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null)
    .sort((a, b) => compareReminderBuckets(a.reminderInfo.bucket, b.reminderInfo.bucket))
    .slice(0, 5)

  const jatuhTempoMingguIni = getUpcomingDueInvoices(
    activeTenants,
    allInvoices ?? [],
    allPayments ?? []
  )

  if (isLoading) {
    return (
      <div className="p-4 space-y-3">
        <div className="h-6 w-32 bg-bg-elevated rounded animate-pulse" />
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 bg-bg-elevated rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-4">
      <div>
        <h1 className="text-lg font-semibold text-text-primary">Ringkasan</h1>
        <p className="text-sm text-text-muted">Kondisi kos hari ini</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="card p-3 text-center">
          <p className="text-2xl font-bold text-text-primary">{rooms?.length ?? 0}</p>
          <p className="text-xs text-text-muted mt-0.5">Total Kamar</p>
        </div>
        <div className="card p-3 text-center bg-success-bg border-border">
          <p className="text-2xl font-bold text-success">{terisi}</p>
          <p className="text-xs text-success mt-0.5">Terisi</p>
        </div>
        <div className="card p-3 text-center bg-warning-bg border-border">
          <p className="text-2xl font-bold text-warning">{kosong}</p>
          <p className="text-xs text-warning mt-0.5">Kosong</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button variant="secondary" className="w-full" onClick={() => setPickerMode("invoice")}>
          + Invoice
        </Button>
        <Button variant="secondary" className="w-full" onClick={() => setPickerMode("pembayaran")}>
          + Pembayaran
        </Button>
      </div>

      <Link
        href="/kamar"
        className="flex items-center justify-between bg-bg-surface rounded-xl border border-border p-3"
      >
        <span className="text-sm font-medium text-text-primary">Kelola Kamar</span>
        <span className="text-xs text-primary font-medium">Lihat →</span>
      </Link>

      {/* Perlu Ditagih - shrunk to a single glance line */}
      <Link
        href="/pengingat"
        className="flex items-center justify-between bg-bg-surface rounded-xl border border-border p-3"
      >
        <span className="text-sm text-text-primary">
          {perluDitagih.length > 0
            ? `${perluDitagih.length} penghuni perlu ditagih`
            : "Tidak ada tunggakan saat ini"}
        </span>
        {perluDitagih.length > 0 && (
          <span className="text-xs text-primary font-medium">Lihat →</span>
        )}
      </Link>

      {/* Jatuh Tempo - shrunk to a single glance line */}
      <Link
        href="/pengingat"
        className="flex items-center justify-between bg-bg-surface rounded-xl border border-border p-3"
      >
        <span className="text-sm text-text-primary">
          {jatuhTempoMingguIni.length > 0
            ? `${jatuhTempoMingguIni.length} tagihan jatuh tempo minggu ini`
            : "Tidak ada tagihan jatuh tempo minggu ini"}
        </span>
        {jatuhTempoMingguIni.length > 0 && (
          <span className="text-xs text-primary font-medium">Lihat →</span>
        )}
      </Link>

      <TenantPickerDialog
        isOpen={pickerMode !== null}
        title={
          pickerMode === "invoice"
            ? "Pilih Penghuni - Buat Invoice"
            : "Pilih Penghuni - Catat Pembayaran"
        }
        tenants={activeTenants}
        onSelect={(tenantId) => {
          setPickerMode(null)
          return pickerMode === "invoice"
            ? `/penghuni/${tenantId}/invoice/tambah`
            : `/penghuni/${tenantId}/pembayaran/tambah`
        }}
        onCancel={() => setPickerMode(null)}
      />
    </div>
  )
}
