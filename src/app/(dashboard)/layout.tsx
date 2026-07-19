import { BottomNav } from "@/components/layout/BottomNav"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-md mx-auto pb-20">{children}</main>
      <BottomNav />
    </div>
  )
}
