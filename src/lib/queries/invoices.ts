import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
import type { InvoiceInput } from "@/lib/schemas/invoice"

export const invoiceKeys = {
  all: ["invoices"] as const,
  byTenant: (tenantId: string) => ["invoices", "tenant", tenantId] as const,
}

export function useTenantInvoices(tenantId: string) {
  const supabase = createClient()

  return useQuery({
    queryKey: invoiceKeys.byTenant(tenantId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invoices")
        .select("*")
        .eq("tenant_id", tenantId)
        .order("period_start", { ascending: true })

      if (error) throw error
      return data
    },
  })
}

export function useCreateInvoice() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ tenantId, data }: { tenantId: string; data: InvoiceInput }) => {
      const { error } = await supabase.from("invoices").insert({
        tenant_id: tenantId,
        ...data,
      })

      if (error) throw error
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.byTenant(variables.tenantId) })
    },
  })
}
