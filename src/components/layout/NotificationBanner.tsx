/* eslint-disable react-hooks/set-state-in-effect */
"use client"

import { useEffect, useState } from "react"
import { subscribeToPush } from "@/lib/push"
import { useSaveSubscription } from "@/lib/queries/push-subscriptions"
import { Button } from "@/components/ui/Button"

const DISMISS_KEY = "notification-banner-dismissed"

export function NotificationBanner() {
  const [mounted, setMounted] = useState(false)
  const [permission, setPermission] = useState<NotificationPermission | null>(null)
  const [dismissed, setDismissed] = useState(false)
  const saveSubscription = useSaveSubscription()

  useEffect(() => {
    setMounted(true)
    if (typeof Notification !== "undefined") {
      setPermission(Notification.permission)
    }
    setDismissed(sessionStorage.getItem(DISMISS_KEY) === "true")
  }, [])

  async function handleEnable() {
    try {
      const subscription = await subscribeToPush()
      await saveSubscription.mutateAsync(subscription)
      setPermission("granted")
    } catch (err) {
      console.log("error in handleEnable", err)
      setPermission(Notification.permission)
    }
  }

  function handleDismiss() {
    sessionStorage.setItem(DISMISS_KEY, "true")
    setDismissed(true)
  }

  if (!mounted) return null

  const shouldShow = permission === "default" && !dismissed

  if (!shouldShow) return null

  return (
    <div className="fixed bottom-16 left-0 right-0 z-40 bg-primary text-white px-4 py-2.5 flex items-center justify-between gap-3">
      <p className="text-xs flex-1">Aktifkan notifikasi untuk pengingat tagihan harian</p>
      <div className="flex gap-2 shrink-0">
        <button onClick={handleDismiss} className="text-xs text-white/80 font-medium">
          Nanti
        </button>
        <Button
          size="small"
          variant="secondary"
          className="bg-white! text-primary! border-white!"
          onClick={() => handleEnable()}
          isLoading={saveSubscription.isPending}
        >
          Aktifkan
        </Button>
      </div>
    </div>
  )
}
