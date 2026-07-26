import { OverflowMenu, type OverflowMenuItem } from "../ui/OverflowMenu"
import { formatRupiah } from "@/lib/utils"
const methodLabels = {
  cash: "Tunai",
  transfer: "Transfer",
}

interface PaymentListItemProps {
  readonly amount: number
  readonly payment_method: "cash" | "transfer"
  readonly paid_at: string
  readonly proof_url?: string | null
  readonly onViewProof?: (path: string) => void
  readonly onDelete?: () => void
}

export function PaymentListItem({
  amount,
  payment_method,
  paid_at,
  proof_url,
  onViewProof,
  onDelete,
}: Readonly<PaymentListItemProps>) {
  const menuItems: OverflowMenuItem[] = []

  if (proof_url && onViewProof) {
    menuItems.push({
      label: "Lihat Bukti",
      onClick: () => onViewProof(proof_url),
    })
  }

  if (onDelete) {
    menuItems.push({
      label: "Hapus",
      onClick: onDelete,
      variant: "danger",
    })
  }

  return (
    <div className="bg-bg-surface rounded-xl p-3 border border-border flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-text-primary">{formatRupiah(amount)}</p>
        <p className="text-xs text-text-muted">
          {methodLabels[payment_method]} ·{" "}
          {new Date(paid_at).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </p>
      </div>
      {menuItems.length > 0 ? <OverflowMenu items={menuItems} /> : null}
    </div>
  )
}
