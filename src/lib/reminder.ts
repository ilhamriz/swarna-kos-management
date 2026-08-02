import { deriveInvoiceStatuses, type Invoice } from "@/lib/invoice-status"

export type ReminderBucket = "telat" | "jatuh_tempo_hari_ini" | "belum"

interface Payment {
  amount: number
}

interface ReminderInfo {
  bucket: ReminderBucket
  totalTunggakan: number
  unpaidInvoices: {
    id: string
    period_start: string
    period_end: string
    due_date: string
    amount_remaining: number
  }[]
}

export interface UpcomingDueInvoice {
  tenantId: string
  tenantName: string
  invoiceId: string
  due_date: string
  amount_remaining: number
}

function isSameDay(dateString: string, reference: Date) {
  const date = new Date(dateString)
  return (
    date.getFullYear() === reference.getFullYear() &&
    date.getMonth() === reference.getMonth() &&
    date.getDate() === reference.getDate()
  )
}

/**
 * Determines a tenant's billing reminder priority and the invoice most
 * relevant to reference in a WA reminder message (the oldest unpaid one,
 * consistent with the FIFO allocation model used everywhere else).
 *
 * Returns null if the tenant has no outstanding balance (fully lunas).
 */
export function getReminderInfo(
  tenantInvoices: Invoice[],
  tenantPayments: Payment[]
): ReminderInfo | null {
  const totalPaid = tenantPayments.reduce((sum, p) => sum + p.amount, 0)
  const statuses = deriveInvoiceStatuses(tenantInvoices, totalPaid)
  const unpaid = statuses.filter((s) => s.status !== "lunas")

  if (unpaid.length === 0) return null

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const hasTelat = unpaid.some((u) => u.status === "telat")
  const hasDueToday = unpaid.some((u) => u.status === "belum" && isSameDay(u.due_date, today))

  let bucket: ReminderBucket
  if (hasTelat) {
    bucket = "telat"
  } else if (hasDueToday) {
    bucket = "jatuh_tempo_hari_ini"
  } else {
    bucket = "belum"
  }

  const totalTunggakan = unpaid.reduce((sum, u) => sum + u.amount_remaining, 0)

  return {
    bucket,
    totalTunggakan,
    unpaidInvoices: unpaid.map((u) => ({
      id: u.id,
      period_start: u.period_start,
      period_end: u.period_end,
      due_date: u.due_date,
      amount_remaining: u.amount_remaining,
    })),
  }
}

const bucketPriority: Record<ReminderBucket, number> = {
  telat: 0,
  jatuh_tempo_hari_ini: 1,
  belum: 2,
}

export function compareReminderBuckets(a: ReminderBucket, b: ReminderBucket) {
  return bucketPriority[a] - bucketPriority[b]
}

export const reminderBucketLabels: Record<ReminderBucket, string> = {
  telat: "Telat",
  jatuh_tempo_hari_ini: "Jatuh Tempo Hari Ini",
  belum: "Belum Bayar",
}

/**
 * Returns all unpaid invoices (any tenant) with due_date within the next 7 days
 * (inclusive of today), sorted soonest-due first.
 */
export function getUpcomingDueInvoices(
  tenants: { id: string; full_name: string }[],
  allInvoices: (Invoice & { tenant_id: string })[],
  allPayments: (Payment & { tenant_id: string })[]
): UpcomingDueInvoice[] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const sevenDaysOut = new Date(today)
  sevenDaysOut.setDate(sevenDaysOut.getDate() + 7)

  const result: UpcomingDueInvoice[] = []

  for (const tenant of tenants) {
    const tenantInvoices = allInvoices.filter((inv) => inv.tenant_id === tenant.id)
    const tenantPayments = allPayments.filter((p) => p.tenant_id === tenant.id)
    const totalPaid = tenantPayments.reduce((sum, p) => sum + p.amount, 0)
    const statuses = deriveInvoiceStatuses(tenantInvoices, totalPaid)

    for (const invoice of statuses) {
      if (invoice.status === "lunas") continue
      const dueDate = new Date(invoice.due_date)
      dueDate.setHours(0, 0, 0, 0)
      if (dueDate >= today && dueDate <= sevenDaysOut) {
        result.push({
          tenantId: tenant.id,
          tenantName: tenant.full_name,
          invoiceId: invoice.id,
          due_date: invoice.due_date,
          amount_remaining: invoice.amount_remaining,
        })
      }
    }
  }

  return result.sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
}
