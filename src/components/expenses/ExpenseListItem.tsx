import { expenseCategoryLabels, type expenseCategories } from "@/lib/schemas/expense"
import { formatRupiah } from "@/lib/utils"

interface ExpenseListItemProps {
  category: (typeof expenseCategories)[number]
  amount: number
  expense_date: string
  description?: string | null
}

export function ExpenseListItem({
  category,
  amount,
  expense_date,
  description,
}: ExpenseListItemProps) {
  return (
    <div className="bg-bg-surface rounded-xl p-3 border border-border flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-text-primary">{expenseCategoryLabels[category]}</p>
        <p className="text-xs text-text-muted">
          {formatRupiah(amount)} ·{" "}
          {new Date(expense_date).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </p>
        {description && <p className="text-xs text-text-secondary mt-0.5">{description}</p>}
      </div>
    </div>
  )
}
