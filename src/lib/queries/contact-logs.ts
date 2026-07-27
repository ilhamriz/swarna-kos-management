import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
import type { ContactLogInput } from "@/lib/schemas/contact-log"

export const contactLogKeys = {
  byTenant: (tenantId: string) => ["contact-logs", "tenant", tenantId] as const,
}

export function useTenantContactLogs(tenantId: string) {
  const supabase = createClient()

  return useQuery({
    queryKey: contactLogKeys.byTenant(tenantId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contact_logs")
        .select("*")
        .eq("tenant_id", tenantId)
        .order("contacted_at", { ascending: false })

      if (error) throw error
      return data
    },
  })
}

export function useCreateContactLog() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ tenantId, data }: { tenantId: string; data: ContactLogInput }) => {
      const { error } = await supabase.from("contact_logs").insert({
        tenant_id: tenantId,
        ...data,
        contacted_at: new Date().toISOString(),
      })

      if (error) throw error
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: contactLogKeys.byTenant(variables.tenantId) })
    },
  })
}
