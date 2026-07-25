// src/lib/invoice-status.ts

export type InvoiceStatus = "lunas" | "belum" | "telat"

interface Invoice {
  id: string
  amount_due: number
  due_date: string
  period_start: string
  period_end: string
}

interface InvoiceWithStatus extends Invoice {
  status: InvoiceStatus
  amount_paid: number
  amount_remaining: number
}

/**
 * Allocates a tenant's total payments across their invoices, oldest first (FIFO),
 * then derives each invoice's status from how much of it has been covered.
 *
 * This is a convention, not something the DB schema enforces - payment_transactions
 * has no invoice_id, so there's no ground truth for "which payment paid which invoice."
 * FIFO (oldest debt first) is the assumption baked in here.
 */
export function deriveInvoiceStatuses(invoices: Invoice[], totalPaid: number): InvoiceWithStatus[] {
  const sorted = [...invoices].sort(
    (a, b) => new Date(a.period_start).getTime() - new Date(b.period_start).getTime()
  )

  let remainingPayment = totalPaid
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return sorted.map((invoice) => {
    const amountPaid = Math.min(remainingPayment, invoice.amount_due)
    remainingPayment -= amountPaid

    const amountRemaining = invoice.amount_due - amountPaid
    const dueDate = new Date(invoice.due_date)
    dueDate.setHours(0, 0, 0, 0)

    let status: InvoiceStatus
    if (amountRemaining <= 0) {
      status = "lunas"
    } else if (dueDate < today) {
      status = "telat"
    } else {
      status = "belum"
    }

    return { ...invoice, status, amount_paid: amountPaid, amount_remaining: amountRemaining }
  })
}

export function calculateSaldoTunggakan(invoices: { amount_due: number }[], totalPaid: number) {
  const totalDue = invoices.reduce((sum, inv) => sum + inv.amount_due, 0)
  return Math.max(0, totalDue - totalPaid)
}

export function calculateOverpayment(
  invoices: { amount_due: number }[],
  totalPaid: number
): number {
  const totalDue = invoices.reduce((sum, inv) => sum + inv.amount_due, 0)
  return Math.max(0, totalPaid - totalDue)
}

export function getTenantSaldoTunggakan(
  tenantId: string,
  allInvoices: { tenant_id: string; amount_due: number }[],
  allPayments: { tenant_id: string; amount: number }[]
): number {
  const tenantInvoices = allInvoices.filter((inv) => inv.tenant_id === tenantId)
  const tenantPayments = allPayments.filter((p) => p.tenant_id === tenantId)
  const totalPaid = tenantPayments.reduce((sum, p) => sum + p.amount, 0)
  return calculateSaldoTunggakan(tenantInvoices, totalPaid)
}
