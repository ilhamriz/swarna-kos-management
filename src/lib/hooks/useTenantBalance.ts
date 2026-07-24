"use client"

import { useTenantInvoices } from "@/lib/queries/invoices"
import { useTenantPayments } from "@/lib/queries/payments"
import { calculateSaldoTunggakan, calculateOverpayment } from "@/lib/invoice-status"

export function useTenantBalance(tenantId: string) {
  const { data: invoices, isLoading: invoicesLoading } = useTenantInvoices(tenantId)
  const { data: payments, isLoading: paymentsLoading } = useTenantPayments(tenantId)

  const totalPaid = payments?.reduce((sum, p) => sum + p.amount, 0) ?? 0
  const saldoTunggakan = calculateSaldoTunggakan(invoices ?? [], totalPaid)
  const overpayment = calculateOverpayment(invoices ?? [], totalPaid)

  return {
    saldoTunggakan,
    overpayment,
    isLoading: invoicesLoading || paymentsLoading,
  }
}
