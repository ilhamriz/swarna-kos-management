"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useTenant, useKtpSignedUrl, useCheckOutTenant } from "@/lib/queries/tenants"
import { useTenantBalance } from "@/lib/hooks/useTenantBalance"
import { TenantForm } from "@/components/tenants/TenantForm"
import { Button } from "@/components/ui/Button"
import { IdCard, Whatsapp } from "@/components/ui/Icon"
import { Input } from "@/components/ui/form/Input"
import { PageHeader } from "@/components/layout/PageHeader"
import { PaymentSection } from "@/components/tenants/PaymentSection"
import { InvoiceSection } from "@/components/tenants/InvoiceSection"
import { ContactLogSection } from "@/components/tenants/ContactLogSection"

export default function PenghuniDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { data: tenant, isLoading } = useTenant(id)
  const getSignedUrl = useKtpSignedUrl()
  const checkOutTenant = useCheckOutTenant()
  const { saldoTunggakan } = useTenantBalance(id)

  const [isEditing, setIsEditing] = useState(false)
  const [showCheckOut, setShowCheckOut] = useState(false)
  const [checkOutDate, setCheckOutDate] = useState("")

  if (isLoading) {
    return (
      <div className="p-4 space-y-3">
        <div className="h-6 w-32 bg-bg-elevated rounded animate-pulse" />
        <div className="h-40 bg-bg-elevated rounded-xl animate-pulse" />
      </div>
    )
  }

  if (!tenant) return null

  async function handleViewKtp() {
    if (!tenant || !tenant.ktp_photo_url) return
    const url = await getSignedUrl.mutateAsync(tenant.ktp_photo_url)
    window.open(url, "_blank")
  }

  function handleOpenWa() {
    if (!tenant) return
    const message = encodeURIComponent(`Halo ${tenant.full_name},`)
    window.open(`https://wa.me/${tenant.phone_number}?text=${message}`, "_blank")
  }

  async function handleConfirmCheckOut() {
    if (!checkOutDate) return
    await checkOutTenant.mutateAsync({ id, data: { check_out_date: checkOutDate } })
    setShowCheckOut(false)
    router.push("/penghuni")
  }

  // Edit page
  if (isEditing) {
    return (
      <div className="p-4">
        <PageHeader
          title="Edit Penghuni"
          action={{ label: "Batal", onClick: () => setIsEditing(false) }}
        />
        <TenantForm
          mode="edit"
          tenantId={id}
          currentKtpUrl={tenant.ktp_photo_url}
          defaultValues={{
            full_name: tenant.full_name,
            phone_number: tenant.phone_number,
            room_id: tenant.room_id,
            emergency_contact_name: tenant.emergency_contact_name ?? "",
            emergency_contact_phone: tenant.emergency_contact_phone ?? "",
            check_in_date: tenant.check_in_date,
          }}
        />
      </div>
    )
  }

  return (
    <div className="p-4">
      <PageHeader
        title={tenant.full_name}
        showBack
        action={{ label: "Edit", onClick: () => setIsEditing(true) }}
      />

      {/* Card Info */}
      <div className="bg-bg-surface rounded-xl p-4 border border-border mb-4 space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-text-secondary">Kamar</span>
          <span className="text-sm font-medium text-text-primary">
            Kamar {tenant.rooms?.room_number}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-text-secondary">Nomor HP</span>
          <span className="text-sm font-medium text-text-primary">{tenant.phone_number}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-text-secondary">Tanggal Masuk</span>
          <span className="text-sm font-medium text-text-primary">
            {new Date(tenant.check_in_date).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
        </div>
        {tenant?.emergency_contact_name && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-text-secondary">Kontak Darurat</span>
            <div className="flex flex-col items-end">
              <span className="text-sm font-medium text-text-primary">
                {tenant?.emergency_contact_name}
              </span>
              <span className="text-sm font-medium text-text-primary">
                {tenant?.emergency_contact_phone}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Buttons */}
      <div className="flex gap-2 mb-4">
        <Button onClick={handleOpenWa}>
          <Whatsapp size={20} />
          Hubungi WA
        </Button>
        <Button variant="secondary" onClick={handleViewKtp} isLoading={getSignedUrl.isPending}>
          <IdCard size={20} />
          Lihat KTP
        </Button>
      </div>

      <div className="border-t border-border pt-4">
        <InvoiceSection tenantId={id} />
        <PaymentSection tenantId={id} />
        <ContactLogSection tenantId={id} />
      </div>

      {tenant.is_active && (
        <div className="border-t border-border pt-4">
          {!showCheckOut ? (
            <Button variant="ghost_danger" onClick={() => setShowCheckOut(true)} className="w-fit">
              Tandai Keluar
            </Button>
          ) : (
            <div className="bg-danger-bg rounded-xl p-4 space-y-3">
              <p className="text-sm text-text-primary font-medium">
                Tandai <b>{tenant.full_name}</b> sebagai keluar?
              </p>
              <p className="text-xs text-text-secondary">
                Tindakan ini tidak bisa dibatalkan. Penghuni akan dipindahkan ke daftar tidak aktif.
              </p>
              {saldoTunggakan > 0 && (
                <p className="py-1 px-2 text-xs text-warning font-medium bg-warning-bg">
                  Penghuni ini masih memiliki tunggakan Rp {saldoTunggakan.toLocaleString("id-ID")}.
                  Anda tetap bisa menandai keluar.
                </p>
              )}
              <Input
                type="date"
                value={checkOutDate}
                onChange={(e) => setCheckOutDate(e.target.value)}
              />
              <div className="flex gap-2">
                <Button
                  variant="danger"
                  onClick={handleConfirmCheckOut}
                  isLoading={checkOutTenant.isPending}
                  disabled={!checkOutDate}
                >
                  Konfirmasi Keluar
                </Button>
                <Button variant="secondary" onClick={() => setShowCheckOut(false)}>
                  Batal
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
