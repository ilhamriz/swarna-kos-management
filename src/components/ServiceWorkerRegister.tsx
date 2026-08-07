"use client"

import { useEffect } from "react"

export function ServiceWorkerRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("[sw] registered:", registration)
        })
        .catch((error) => {
          console.log("[sw] registration failed:", error)
        })
    }
  }, [])

  return null
}
