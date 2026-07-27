"use client"

import { useState } from "react"
import Link from "next/link"
import { useExpenses } from "@/lib/queries/expenses"
import { PageHeader } from "@/components/layout/PageHeader"
import { ExpenseListItem } from "@/components/expenses/ExpenseListItem"
import { Input } from "@/components/ui/form/Input"
import { formatRupiah } from "@/lib/utils"

function getCurrentMonth() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
}

function formatMonthLabel(monthString: string) {
  const [year, month] = monthString.split("-")
  const date = new Date(Number(year), Number(month) - 1)
  return date.toLocaleDateString("id-ID", { month: "long", year: "numeric" })
}

export default function KeuanganPage() {
  const { data: expenses, isLoading } = useExpenses()
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth())

  const filteredExpenses = expenses?.filter((expense) =>
    expense.expense_date.startsWith(selectedMonth)
  )

  const totalBulanIni = filteredExpenses?.reduce((sum, expense) => sum + expense.amount, 0) ?? 0

  if (isLoading) {
    return (
      <div className="p-4 space-y-3">
        <div className="h-8 w-32 bg-bg-elevated rounded animate-pulse" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-16 bg-bg-elevated rounded-xl animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="p-4">
      <PageHeader title="Keuangan" link={{ label: "+ Tambah", href: "/keuangan/tambah" }} />

      <div className="mb-4">
        <Input
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
        />
      </div>

      <div className="bg-bg-elevated rounded-xl p-3 mb-4">
        <p className="text-xs text-text-secondary">
          Total Pengeluaran {formatMonthLabel(selectedMonth)}
        </p>
        <p className="text-lg font-semibold text-text-primary">{formatRupiah(totalBulanIni)}</p>
      </div>

      {!filteredExpenses || filteredExpenses.length === 0 ? (
        <div className="bg-bg-surface rounded-xl p-6 border border-border text-center">
          <p className="text-sm text-text-muted">
            Belum ada pengeluaran di {formatMonthLabel(selectedMonth)}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredExpenses.map((expense) => (
            <Link key={expense.id} href={`/keuangan/${expense.id}`} className="block">
              <ExpenseListItem
                category={expense.category}
                amount={expense.amount}
                expense_date={expense.expense_date}
                description={expense.description}
              />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
