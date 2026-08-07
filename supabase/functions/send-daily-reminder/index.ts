import webpush from "npm:web-push@3.6.7"
import { createClient } from "npm:@supabase/supabase-js@2.110.7"

interface Tenant {
  id: string
  full_name: string
  is_active: boolean
}

interface Invoice {
  id: string
  tenant_id: string
  amount_due: number
  due_date: string
  period_start: string
}

interface Payment {
  tenant_id: string
  amount: number
}

interface PushSubscriptionRow {
  endpoint: string
  p256dh: string
  auth: string
}

const supabaseUrl = Deno.env.get("SUPABASE_URL")!
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY")!
const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY")!
const vapidSubject = Deno.env.get("VAPID_SUBJECT")!

webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey)

Deno.serve(async () => {
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  // 1. Fetch all active tenants, all invoices, all payments
  const { data: tenants, error: tenantsError } = await supabase
    .from("tenants")
    .select("id, full_name, is_active")
    .eq("is_active", true)

  if (tenantsError) {
    return new Response(JSON.stringify({ error: tenantsError.message }), { status: 500 })
  }

  const { data: invoices, error: invoicesError } = await supabase
    .from("invoices")
    .select("id, tenant_id, amount_due, due_date, period_start")

  if (invoicesError) {
    return new Response(JSON.stringify({ error: invoicesError.message }), { status: 500 })
  }

  const { data: payments, error: paymentsError } = await supabase
    .from("payment_transactions")
    .select("tenant_id, amount")

  if (paymentsError) {
    return new Response(JSON.stringify({ error: paymentsError.message }), { status: 500 })
  }

  // 2. Compute, per tenant, whether they have any outstanding balance
  //    (simplified FIFO: total due - total paid, per tenant - mirrors calculateSaldoTunggakan)
  let tenantsOwingCount = 0

  for (const tenant of (tenants ?? []) as Tenant[]) {
    const tenantInvoices = ((invoices ?? []) as Invoice[]).filter(
      (inv) => inv.tenant_id === tenant.id
    )
    const tenantPayments = ((payments ?? []) as Payment[]).filter((p) => p.tenant_id === tenant.id)
    const totalDue = tenantInvoices.reduce((sum, inv) => sum + inv.amount_due, 0)
    const totalPaid = tenantPayments.reduce((sum, p) => sum + p.amount, 0)
    if (totalDue - totalPaid > 0) {
      tenantsOwingCount++
    }
  }

  if (tenantsOwingCount === 0) {
    return new Response(JSON.stringify({ message: "No tenants owing, no notification sent" }), {
      status: 200,
    })
  }

  // 3. Fetch all push subscriptions and send to each
  const { data: subscriptions, error: subsError } = await supabase
    .from("push_subscriptions")
    .select("*")

  if (subsError) {
    return new Response(JSON.stringify({ error: subsError.message }), { status: 500 })
  }

  const payload = JSON.stringify({
    title: "Kos Saya",
    body: `Ada ${tenantsOwingCount} penghuni yang belum bayar`,
    url: "/pengingat",
  })

  const results = await Promise.allSettled(
    ((subscriptions ?? []) as PushSubscriptionRow[]).map(async (sub) => {
      const pushSubscription = {
        endpoint: sub.endpoint,
        keys: { p256dh: sub.p256dh, auth: sub.auth },
      }
      try {
        await webpush.sendNotification(pushSubscription, payload)
      } catch (err: unknown) {
        // 410 Gone means the subscription is no longer valid - clean it up
        const statusCode = (err as { statusCode?: number }).statusCode
        if (statusCode === 410 || statusCode === 404) {
          await supabase.from("push_subscriptions").delete().eq("endpoint", sub.endpoint)
        }
        throw err
      }
    })
  )

  return new Response(
    JSON.stringify({
      tenantsOwingCount,
      subscriptionsNotified: results.filter((r) => r.status === "fulfilled").length,
      subscriptionsFailed: results.filter((r) => r.status === "rejected").length,
    }),
    { status: 200 }
  )
})
