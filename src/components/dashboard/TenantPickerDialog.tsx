"use client"

import { useRouter } from "next/navigation"

interface TenantPickerDialogProps {
  isOpen: boolean
  title: string
  tenants: { id: string; full_name: string; rooms?: { room_number: string } | null }[]
  onSelect: (tenantId: string) => string // returns the route to navigate to
  onCancel: () => void
}

export function TenantPickerDialog({
  isOpen,
  title,
  tenants,
  onSelect,
  onCancel,
}: Readonly<TenantPickerDialogProps>) {
  const router = useRouter()

  if (!isOpen) return null

  function handlePick(tenantId: string) {
    const route = onSelect(tenantId)
    router.push(route)
  }

  return (
    <div
      className="fixed inset-0 z-20 flex items-center justify-center bg-black/50 p-4"
      onClick={(event) => {
        if (event.target === event.currentTarget) onCancel()
      }}
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-sm max-h-[70vh] rounded-xl bg-bg-surface p-4 shadow-lg flex flex-col">
        <h2 className="text-base font-semibold text-text-primary mb-3 shrink-0">{title}</h2>

        {tenants.length === 0 ? (
          <p className="text-sm text-text-muted text-center py-4">Tidak ada penghuni aktif</p>
        ) : (
          <div className="overflow-y-auto space-y-1 -mx-1 px-1">
            {tenants.map((tenant) => (
              <button
                key={tenant.id}
                onClick={() => handlePick(tenant.id)}
                className="w-full text-left px-3 py-2.5 rounded-lg text-sm hover:bg-bg-elevated transition-colors"
              >
                <span className="font-medium text-text-primary">{tenant.full_name}</span>
                {tenant.rooms?.room_number && (
                  <span className="text-text-muted"> · Kamar {tenant.rooms.room_number}</span>
                )}
              </button>
            ))}
          </div>
        )}

        <button
          onClick={onCancel}
          className="mt-3 text-sm text-text-secondary font-medium shrink-0"
        >
          Batal
        </button>
      </div>
    </div>
  )
}
