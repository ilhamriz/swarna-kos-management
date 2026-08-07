import { useMutation } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"

export function useSaveSubscription() {
  const supabase = createClient()

  return useMutation({
    mutationFn: async (subscription: { endpoint: string; p256dh: string; auth: string }) => {
      const { error } = await supabase
        .from("push_subscriptions")
        .upsert(subscription, { onConflict: "endpoint" })

      if (error) throw error
    },
  })
}
