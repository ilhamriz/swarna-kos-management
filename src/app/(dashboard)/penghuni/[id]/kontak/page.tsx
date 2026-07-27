"use client"

import { useParams } from "next/navigation"
import { useTenantContactLogs } from "@/lib/queries/contact-logs"
import { useTenant } from "@/lib/queries/tenants"
import { contactMethodLabels } from "@/lib/schemas/contact-log"
import { PageHeader } from "@/components/layout/PageHeader"

export default function SemuaKontakPage() {
  const { id } = useParams<{ id: string }>()
  const { data: tenant, isLoading: tenantLoading } = useTenant(id)
  const { data: logs, isLoading: logsLoading } = useTenantContactLogs(id)

  if (tenantLoading || logsLoading) {
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
      <PageHeader title="Semua Riwayat Kontak" showBack />

      {!logs || logs.length === 0 ? (
        <div className="bg-bg-surface rounded-xl p-4 border border-border text-center">
          <p className="text-sm text-text-muted">Belum ada riwayat kontak</p>
        </div>
      ) : (
        <div className="space-y-2">
          {logs.map((log) => (
            <div key={log.id} className="bg-bg-surface rounded-xl p-3 border border-border">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-text-primary">
                  {contactMethodLabels[log.method]}
                </p>
                <p className="text-xs text-text-muted">
                  {new Date(log.contacted_at).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
              {log.notes && <p className="text-xs text-text-secondary mt-1">{log.notes}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
