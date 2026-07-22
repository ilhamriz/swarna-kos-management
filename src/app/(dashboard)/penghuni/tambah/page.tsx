"use client"
import { PageHeader } from "@/components/layout/PageHeader"
import { TenantForm } from "@/components/tenants/TenantForm"

export default function TambahPenghuniPage() {
  return (
    <div className="p-4">
      <PageHeader title="Tambah Penghuni" showBack />
      <TenantForm mode="create" />
    </div>
  )
}
