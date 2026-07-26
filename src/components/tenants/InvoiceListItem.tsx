import type { InvoiceStatus } from "@/lib/invoice-status"
import { formatRupiah } from "@/lib/utils"

const statusStyles = {
  lunas: "bg-success-bg text-success",
  belum: "bg-warning-bg text-warning",
  telat: "bg-danger-bg text-danger",
}

const statusLabels = {
  lunas: "Lunas",
  belum: "Belum",
  telat: "Telat",
}

function formatPeriod(start: string, end: string) {
  const options: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" }
  return `${new Date(start).toLocaleDateString("id-ID", options)} - ${new Date(end).toLocaleDateString("id-ID", { ...options, year: "numeric" })}`
}

interface InvoiceListItemProps {
  period_start: string
  period_end: string
  amount_due: number
  status: InvoiceStatus
}

export function InvoiceListItem({
  period_start,
  period_end,
  amount_due,
  status,
}: InvoiceListItemProps) {
  return (
    <div className="bg-bg-surface rounded-xl p-3 border border-border flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-text-primary">
          {formatPeriod(period_start, period_end)}
        </p>
        <p className="text-xs text-text-muted">{formatRupiah(amount_due)}</p>
      </div>
      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusStyles[status]}`}>
        {statusLabels[status]}
      </span>
    </div>
  )
}
