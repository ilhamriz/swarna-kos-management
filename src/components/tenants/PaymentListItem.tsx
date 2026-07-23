import { Button } from "../ui/Button"

const methodLabels = {
  cash: "Tunai",
  transfer: "Transfer",
}

function formatRupiah(amount: number) {
  return `Rp ${amount.toLocaleString("id-ID")}`
}

interface PaymentListItemProps {
  amount: number
  payment_method: string
  paid_at: string
  proof_url?: string | null
  onViewProof?: (path: string) => void
}

export function PaymentListItem({
  amount,
  payment_method,
  paid_at,
  proof_url,
  onViewProof,
}: PaymentListItemProps) {
  return (
    <div className="bg-bg-surface rounded-xl p-3 border border-border flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-text-primary">{formatRupiah(amount)}</p>
        <p className="text-xs text-text-muted">
          {methodLabels[payment_method as keyof typeof methodLabels]} ·{" "}
          {new Date(paid_at).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </p>
      </div>
      {proof_url && onViewProof && (
        <Button
          variant="ghost"
          size="small"
          onClick={() => onViewProof(proof_url)}
          className="w-fit shrink-0"
        >
          Lihat Bukti
        </Button>
      )}
    </div>
  )
}
