"use client"

import { useTenants } from "@/lib/queries/tenants"
import { useAllInvoices } from "@/lib/queries/invoices"
import { useAllPayments } from "@/lib/queries/payments"
import { useCreateContactLog } from "@/lib/queries/contact-logs"
import { getReminderInfo, compareReminderBuckets, reminderBucketLabels } from "@/lib/reminder"
import { formatRupiah, formatPeriod } from "@/lib/utils"
import { PageHeader } from "@/components/layout/PageHeader"
import { Button } from "@/components/ui/Button"

const bucketStyles = {
  telat: "bg-danger-bg text-danger",
  jatuh_tempo_hari_ini: "bg-warning-bg text-warning",
  belum: "bg-bg-elevated text-text-secondary",
}

export default function PengingatPage() {
  const { data: tenants, isLoading: tenantsLoading } = useTenants()
  const { data: allInvoices, isLoading: invoicesLoading } = useAllInvoices()
  const { data: allPayments, isLoading: paymentsLoading } = useAllPayments()
  const createContactLog = useCreateContactLog()

  if (tenantsLoading || invoicesLoading || paymentsLoading) {
    return (
      <div className="p-4 space-y-3">
        <div className="h-6 w-32 bg-bg-elevated rounded animate-pulse" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-24 bg-bg-elevated rounded-xl animate-pulse" />
        ))}
      </div>
    )
  }

  const remindersList = (tenants ?? [])
    .filter((tenant) => tenant.is_active)
    .map((tenant) => {
      const tenantInvoices = (allInvoices ?? []).filter((inv) => inv.tenant_id === tenant.id)
      const tenantPayments = (allPayments ?? []).filter((p) => p.tenant_id === tenant.id)
      const reminderInfo = getReminderInfo(tenantInvoices, tenantPayments)
      return reminderInfo ? { tenant, reminderInfo } : null
    })
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null)
    .sort((a, b) => compareReminderBuckets(a.reminderInfo.bucket, b.reminderInfo.bucket))

  async function handleKirimWa(
    tenant: NonNullable<typeof tenants>[number],
    reminderInfo: NonNullable<ReturnType<typeof getReminderInfo>>
  ) {
    const invoiceLines = reminderInfo.unpaidInvoices
      .map(
        (inv) =>
          `- ${formatPeriod(inv.period_start, inv.period_end)}: ${formatRupiah(inv.amount_remaining)}`
      )
      .join("\n")

    const message = encodeURIComponent(
      `Halo *${tenant.full_name}*, ini pengingat untuk tagihan yang belum dibayar:\n\n${invoiceLines}\n\nTotal: *${formatRupiah(
        reminderInfo.totalTunggakan
      )}*\n\nMohon segera melakukan pembayaran. Terima kasih`
    )
    window.open(`https://wa.me/${tenant.phone_number}?text=${message}`, "_blank")

    await createContactLog.mutateAsync({
      tenantId: tenant.id,
      data: {
        method: "whatsapp",
        notes: `Pengingat tagihan otomatis: ${formatRupiah(reminderInfo.totalTunggakan)}`,
      },
    })
  }

  return (
    <div className="p-4">
      <PageHeader title="Perlu Ditagih" />

      {remindersList.length === 0 ? (
        <div className="bg-bg-surface rounded-xl p-6 border border-border text-center">
          <p className="text-sm text-text-muted">Tidak ada penghuni yang perlu ditagih saat ini.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {remindersList.map(({ tenant, reminderInfo }) => (
            <div key={tenant.id} className="bg-bg-surface rounded-xl p-3 border border-border">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-medium text-text-primary">{tenant.full_name}</p>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${
                    bucketStyles[reminderInfo.bucket]
                  }`}
                >
                  {reminderBucketLabels[reminderInfo.bucket]}
                </span>
              </div>
              <p className="text-xs text-text-muted mb-2">
                Kamar {tenant.rooms?.room_number} · {formatRupiah(reminderInfo.totalTunggakan)}
              </p>
              <Button
                size="small"
                className="w-full"
                onClick={() => handleKirimWa(tenant, reminderInfo)}
              >
                Kirim WA
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
