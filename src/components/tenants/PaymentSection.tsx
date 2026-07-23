"use client"

import Link from "next/link"
import { useTenantPayments, useProofSignedUrl } from "@/lib/queries/payments"
import { cn } from "@/lib/utils"
import { buttonVariants } from "../ui/Button"
import { PaymentListItem } from "./PaymentListItem"

interface PaymentSectionProps {
  tenantId: string
}

export function PaymentSection({ tenantId }: PaymentSectionProps) {
  const { data: payments, isLoading } = useTenantPayments(tenantId)
  const getProofUrl = useProofSignedUrl()

  async function handleViewProof(path: string) {
    const url = await getProofUrl.mutateAsync(path)
    window.open(url, "_blank")
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
    </div>
  )
}
