"use client"

import Link from "next/link"
import { useTenantInvoices } from "@/lib/queries/invoices"
import { useTenantPayments } from "@/lib/queries/payments"
import {
  deriveInvoiceStatuses,
  calculateOverpayment,
  calculateSaldoTunggakan,
} from "@/lib/invoice-status"
import { cn } from "@/lib/utils"
import { buttonVariants } from "../ui/Button"
import { InvoiceListItem } from "./InvoiceListItem"

function formatRupiah(amount: number) {
  return `Rp ${amount.toLocaleString("id-ID")}`
}

interface InvoiceSectionProps {
  readonly tenantId: string
}

export function InvoiceSection({ tenantId }: InvoiceSectionProps) {
  const { data: invoices, isLoading: invoicesLoading } = useTenantInvoices(tenantId)
  const { data: payments, isLoading: paymentsLoading } = useTenantPayments(tenantId)

  if (invoicesLoading || paymentsLoading) {
    return <div className="h-32 bg-bg-elevated rounded-xl animate-pulse mb-4" />
  }

  const totalPaid = payments?.reduce((sum, p) => sum + p.amount, 0) ?? 0
  const invoicesWithStatus = deriveInvoiceStatuses(invoices ?? [], totalPaid)
  const saldoTunggakan = calculateSaldoTunggakan(invoices ?? [], totalPaid)
  const overpayment = calculateOverpayment(invoices ?? [], totalPaid)
  const displayInvoices = [...invoicesWithStatus].reverse().slice(0, 5)

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-semibold text-text-primary">Tagihan</h2>
        <Link
          href={`/penghuni/${tenantId}/invoice/tambah`}
          className={cn(buttonVariants({ variant: "ghost", size: "small" }), "w-fit")}
        >
          + Buat Invoice
        </Link>
      </div>

      {saldoTunggakan > 0 && (
        <div className="bg-danger-bg rounded-xl p-3 mb-3">
          <p className="text-xs text-text-secondary">Saldo Tunggakan</p>
          <p className="text-lg font-semibold text-danger">{formatRupiah(saldoTunggakan)}</p>
        </div>
      )}

      {overpayment > 0 && (
        <div className="bg-success-bg rounded-xl p-3 mb-3">
          <p className="text-xs text-text-secondary">Kelebihan Bayar</p>
          <p className="text-lg font-semibold text-success">{formatRupiah(overpayment)}</p>
        </div>
      )}

      {invoicesWithStatus.length === 0 ? (
        <div className="bg-bg-surface rounded-xl p-4 border border-border text-center">
          <p className="text-sm text-text-muted">Belum ada tagihan</p>
        </div>
      ) : (
        <div className="space-y-2">
          {displayInvoices.map((invoice) => (
            <Link
              key={invoice.id}
              href={`/penghuni/${tenantId}/invoice/${invoice.id}`}
              className="block"
            >
              <InvoiceListItem {...invoice} />
            </Link>
          ))}

          {invoicesWithStatus.length > 5 && (
            <div className="pt-1 text-center">
              <Link
                href={`/penghuni/${tenantId}/invoice`}
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
