// penghuni/[id]/pembayaran
"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { useTenantPayments, useProofSignedUrl, useDeletePayment } from "@/lib/queries/payments"
import { useTenant } from "@/lib/queries/tenants"
import { PageHeader } from "@/components/layout/PageHeader"
import { ConfirmDialog } from "@/components/ui/ConfirmDialog"
import { PaymentListItem } from "@/components/tenants/PaymentListItem"

export default function SemuaPembayaranPage() {
  const { id } = useParams<{ id: string }>()
  const { data: tenant, isLoading: tenantLoading } = useTenant(id)
  const { data: payments, isLoading: paymentsLoading } = useTenantPayments(id)
  const getProofUrl = useProofSignedUrl()
  const deletePayment = useDeletePayment()
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)

  async function handleViewProof(path: string) {
    const url = await getProofUrl.mutateAsync(path)
    window.open(url, "_blank")
  }

  async function handleConfirmDelete() {
    if (!deleteTargetId) return
    await deletePayment.mutateAsync({ id: deleteTargetId, tenantId: id })
    setDeleteTargetId(null)
  }

  if (tenantLoading || paymentsLoading) {
    return (
      <div className="p-4 space-y-3">
        <div className="h-6 w-32 bg-bg-elevated rounded animate-pulse" />
        <div className="h-24 bg-bg-elevated rounded-xl animate-pulse" />
      </div>
    )
  }

  if (!tenant) return null

  return (
    <div className="p-4">
      <PageHeader title="Semua Pembayaran" showBack />

      {!payments || payments.length === 0 ? (
        <div className="bg-bg-surface rounded-xl p-4 border border-border text-center">
          <p className="text-sm text-text-muted">Belum ada pembayaran</p>
        </div>
      ) : (
        <div className="space-y-2">
          {payments.map((payment) => (
            <PaymentListItem
              key={payment.id}
              amount={payment.amount}
              payment_method={payment.payment_method}
              paid_at={payment.paid_at}
              proof_url={payment.proof_url}
              onViewProof={handleViewProof}
              onDelete={() => setDeleteTargetId(payment.id)}
            />
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={deleteTargetId !== null}
        title="Hapus Pembayaran?"
        description="Menghapus pembayaran ini akan mengubah status tagihan lain secara otomatis, karena status dihitung ulang dari total pembayaran yang tersisa. Tindakan ini tidak bisa dibatalkan."
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTargetId(null)}
        confirmLabel="Hapus"
        cancelLabel="Batal"
        variant="danger"
        isLoading={deletePayment?.isPending}
      />
    </div>
  )
}
