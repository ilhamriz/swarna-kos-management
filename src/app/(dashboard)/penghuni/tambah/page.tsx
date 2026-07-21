import { TenantForm } from "@/components/tenants/TenantForm"

export default function TambahPenghuniPage() {
  return (
    <div className="p-4">
      <h1 className="text-lg font-semibold text-text-primary mb-4">Tambah Penghuni</h1>
      <TenantForm mode="create" />
    </div>
  )
}
