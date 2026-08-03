"use client"

import { usePathname } from "next/navigation"
import { BottomNav } from "@/components/layout/BottomNav"

const visibleNavPaths = ["/", "/penghuni", "/keuangan", "/pengingat", "/kamar"]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const showBottomNav = visibleNavPaths.includes(pathname)

  return (
    <div className="min-h-screen bg-bg">
      <main className="max-w-md mx-auto pb-20">{children}</main>
      {showBottomNav && <BottomNav />}
    </div>
  )
}
