import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
import type { PaymentInput } from "@/lib/schemas/payment"
import { invoiceKeys } from "@/lib/queries/invoices"

export const paymentKeys = {
  byTenant: (tenantId: string) => ["payments", "tenant", tenantId] as const,
}

export function useTenantPayments(tenantId: string) {
  const supabase = createClient()

  return useQuery({
    queryKey: paymentKeys.byTenant(tenantId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payment_transactions")
        .select("*")
        .eq("tenant_id", tenantId)
        .order("paid_at", { ascending: false })

      if (error) throw error
      return data
    },
  })
}

async function uploadProofPhoto(supabase: ReturnType<typeof createClient>, file: File) {
  const fileExt = file.name.split(".").pop()
  const fileName = `${crypto.randomUUID()}.${fileExt}`

  const { data, error } = await supabase.storage.from("payment-proofs").upload(fileName, file)

  if (error) throw error
  return data.path
}

export function useCreatePayment() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ tenantId, data }: { tenantId: string; data: PaymentInput }) => {
      const { proof, ...paymentData } = data
      const proof_url = proof ? await uploadProofPhoto(supabase, proof) : null

      const { error } = await supabase.from("payment_transactions").insert({
        tenant_id: tenantId,
        ...paymentData,
        proof_url,
      })

      if (error) throw error
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.byTenant(variables.tenantId) })
      // Payments affect derived invoice status, so invoice queries must also refresh
      queryClient.invalidateQueries({ queryKey: invoiceKeys.byTenant(variables.tenantId) })
    },
  })
}

export function useProofSignedUrl() {
  const supabase = createClient()

  return useMutation({
    mutationFn: async (path: string) => {
      const { data, error } = await supabase.storage
        .from("payment-proofs")
        .createSignedUrl(path, 60 * 60) // 1 hour

      if (error) throw error
      return data.signedUrl
    },
  })
}
