// app/(dashboard)/layout.tsx
"use client"

import { usePathname } from "next/navigation"
import { BottomNav } from "@/components/layout/BottomNav"
import { NotificationBanner } from "@/components/layout/NotificationBanner"

const visibleNavPaths = ["/", "/penghuni", "/keuangan", "/pengingat", "/kamar"]

export default function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname()
  const showBottomNav = visibleNavPaths.includes(pathname)

  return (
    <div className="min-h-screen bg-bg">
      <main className="max-w-md mx-auto pb-20">{children}</main>
      {showBottomNav && <NotificationBanner />}
      {showBottomNav && <BottomNav />}
    </div>
  )
}
