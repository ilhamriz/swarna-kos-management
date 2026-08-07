"use client"

import Link from "next/link"
import { useState } from "react"
import { toast } from "sonner"
import { useTenantPayments, useProofSignedUrl, useDeletePayment } from "@/lib/queries/payments"
import { cn } from "@/lib/utils"
import { buttonVariants } from "../ui/Button"
import { ConfirmDialog } from "../ui/ConfirmDialog"
import { PaymentListItem } from "./PaymentListItem"

interface PaymentSectionProps {
  readonly tenantId: string
}

export function PaymentSection({ tenantId }: PaymentSectionProps) {
  const { data: payments, isLoading } = useTenantPayments(tenantId)
  const getProofUrl = useProofSignedUrl()
  const deletePayment = useDeletePayment()
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)

  async function handleViewProof(path: string) {
    const url = await getProofUrl.mutateAsync(path)
    window.open(url, "_blank")
  }

  async function handleConfirmDelete() {
    if (!deleteTargetId) return
    try {
      await deletePayment.mutateAsync({ id: deleteTargetId, tenantId })
      toast.success("Pembayaran berhasil dihapus")
      setDeleteTargetId(null)
    } catch {
      toast.error("Gagal menghapus data")
    }
  }

  if (isLoading) {
    return <div className="h-24 bg-bg-elevated rounded-xl animate-pulse mb-4" />
  }

  const displayPayments = payments?.slice(0, 5) ?? []

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-semibold text-text-primary">Riwayat Pembayaran</h2>
        <Link
          href={`/penghuni/${tenantId}/pembayaran/tambah`}
          className={cn(buttonVariants({ variant: "ghost", size: "small" }), "w-fit")}
        >
          + Catat Pembayaran
        </Link>
      </div>

      {!payments || payments.length === 0 ? (
        <div className="bg-bg-surface rounded-xl p-4 border border-border text-center">
          <p className="text-sm text-text-muted">Belum ada pembayaran</p>
        </div>
      ) : (
        <div className="space-y-2">
          {displayPayments.map((payment) => (
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

          {payments.length > 5 && (
            <div className="pt-1 text-center">
              <Link
                href={`/penghuni/${tenantId}/pembayaran`}
                className={buttonVariants({ variant: "ghost", size: "small" })}
              >
                Lihat Semua
              </Link>
            </div>
          )}
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
