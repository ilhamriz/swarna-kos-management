import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
import type { ExpenseInput } from "@/lib/schemas/expense"

export const expenseKeys = {
  all: ["expenses"] as const,
  detail: (id: string) => ["expenses", id] as const,
}

export function useExpenses() {
  const supabase = createClient()

  return useQuery({
    queryKey: expenseKeys.all,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("expenses")
        .select("*")
        .order("expense_date", { ascending: false })

      if (error) throw error
      return data
    },
  })
}

export function useExpense(id: string) {
  const supabase = createClient()

  return useQuery({
    queryKey: expenseKeys.detail(id),
    queryFn: async () => {
      const { data, error } = await supabase.from("expenses").select("*").eq("id", id).single()

      if (error) throw error
      return data
    },
  })
}

export function useCreateExpense() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: ExpenseInput) => {
      const { error } = await supabase.from("expenses").insert(data)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: expenseKeys.all })
    },
  })
}

export function useUpdateExpense() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ExpenseInput }) => {
      const { error } = await supabase.from("expenses").update(data).eq("id", id)

      if (error) throw error
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: expenseKeys.all })
      queryClient.invalidateQueries({ queryKey: expenseKeys.detail(variables.id) })
    },
  })
}

export function useDeleteExpense() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("expenses").delete().eq("id", id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: expenseKeys.all })
    },
  })
}
