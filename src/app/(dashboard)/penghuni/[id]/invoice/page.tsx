"use client"

import { useParams } from "next/navigation"
import { useTenantInvoices } from "@/lib/queries/invoices"
import { useTenantPayments } from "@/lib/queries/payments"
import { useTenant } from "@/lib/queries/tenants"
import { deriveInvoiceStatuses } from "@/lib/invoice-status"
import { PageHeader } from "@/components/layout/PageHeader"
import { InvoiceListItem } from "@/components/tenants/InvoiceListItem"

export default function SemuaInvoicePage() {
  const { id } = useParams<{ id: string }>()
  const { data: tenant, isLoading: tenantLoading } = useTenant(id)
  const { data: invoices, isLoading: invoicesLoading } = useTenantInvoices(id)
  const { data: payments, isLoading: paymentsLoading } = useTenantPayments(id)

  if (tenantLoading || invoicesLoading || paymentsLoading) {
    return (
      <div className="p-4 space-y-3">
        <div className="h-6 w-32 bg-bg-elevated rounded animate-pulse" />
        <div className="h-24 bg-bg-elevated rounded-xl animate-pulse" />
      </div>
    )
  }

  if (!tenant) return null

  const totalPaid = payments?.reduce((sum, p) => sum + p.amount, 0) ?? 0
  const invoicesWithStatus = deriveInvoiceStatuses(invoices ?? [], totalPaid)
  const displayInvoices = [...invoicesWithStatus].reverse()

  return (
    <div className="p-4">
      <PageHeader title="Semua Invoice" showBack />

      {displayInvoices.length === 0 ? (
        <div className="bg-bg-surface rounded-xl p-4 border border-border text-center">
          <p className="text-sm text-text-muted">Belum ada tagihan</p>
        </div>
      ) : (
        <div className="space-y-2">
          {displayInvoices.map((invoice) => (
            <InvoiceListItem key={invoice.id} {...invoice} />
          ))}
        </div>
      )}
    </div>
  )
}
