"use client"

import { useState } from "react"
import Link from "next/link"
import { useTenants } from "@/lib/queries/tenants"
import { PageHeader } from "@/components/layout/PageHeader"
import { FilterTabs } from "@/components/ui/FilterTabs"

type FilterStatus = "semua" | "aktif" | "tidak_aktif"

export default function PenghuniPage() {
  const { data: tenants, isLoading, error } = useTenants()
  const [filter, setFilter] = useState<FilterStatus>("aktif")

  const filteredTenants = tenants?.filter((tenant) => {
    if (filter === "aktif") return tenant.is_active
    if (filter === "tidak_aktif") return !tenant.is_active
    return true
  })

  if (isLoading) {
    return (
      <div className="p-4 space-y-3">
        <div className="h-8 w-32 bg-bg-elevated rounded animate-pulse" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 bg-bg-elevated rounded-xl animate-pulse" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 text-center text-sm text-danger">
        Gagal memuat data penghuni. Coba refresh halaman.
      </div>
    )
  }

  const filterTabs: { value: FilterStatus; label: string }[] = [
    { value: "aktif", label: "Aktif" },
    { value: "tidak_aktif", label: "Tidak Aktif" },
    { value: "semua", label: "Semua" },
  ]

  return (
    <div className="p-4">
      <PageHeader title="Penghuni" link={{ label: "+ Tambah", href: "/penghuni/tambah" }} />
      <FilterTabs tabs={filterTabs} value={filter} onChange={setFilter} />

      {filteredTenants && filteredTenants.length === 0 ? (
        <div className="bg-bg-surface rounded-xl p-6 border border-border text-center">
          <p className="text-sm text-text-muted">
            {filter === "aktif"
              ? "Belum ada penghuni aktif"
              : filter === "tidak_aktif"
                ? "Belum ada penghuni yang keluar"
                : "Belum ada penghuni"}
          </p>
          <Link
            href="/penghuni/tambah"
            className="mt-2 inline-block text-sm text-primary font-medium"
          >
            Tambah penghuni
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredTenants?.map((tenant) => (
            <Link
              key={tenant.id}
              href={`/penghuni/${tenant.id}`}
              className="flex items-center gap-3 bg-bg-surface rounded-xl p-3 border border-border transition-colors duration-300 hover:bg-bg-elevated"
            >
              <div className="w-9 h-9 rounded-full bg-primary-bg text-primary flex items-center justify-center text-sm font-medium shrink-0">
                {tenant.full_name
                  .split(" ")
                  .map((n: string) => n[0])
                  .slice(0, 2)
                  .join("")}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">{tenant.full_name}</p>
                <p className="text-xs text-text-muted">
                  Kamar {tenant.rooms?.room_number} · {tenant.phone_number}
                </p>
              </div>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${
                  tenant.is_active ? "bg-success-bg text-success" : "bg-bg-elevated text-text-muted"
                }`}
              >
                {tenant.is_active ? "Aktif" : "Keluar"}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
