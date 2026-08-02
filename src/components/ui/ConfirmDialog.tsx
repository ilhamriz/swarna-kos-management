"use client"

import { Button } from "./Button"

export type ConfirmDialogProps = {
  isOpen: boolean
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void | Promise<void>
  onCancel: () => void
  isLoading?: boolean
  confirmDisabled?: boolean
  variant?: "default" | "danger"
}

export function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmLabel = "Konfirmasi",
  cancelLabel = "Batal",
  onConfirm,
  onCancel,
  isLoading,
  confirmDisabled,
  variant = "danger",
}: Readonly<ConfirmDialogProps>) {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onCancel()
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-description"
    >
      <div className="w-full max-w-sm rounded-xl bg-bg-surface p-4 shadow-lg">
        <h2 id="confirm-dialog-title" className="text-base font-semibold text-text-primary">
          {title}
        </h2>
        <p id="confirm-dialog-description" className="mt-2 text-sm text-text-secondary">
          {description}
        </p>

        <div className="mt-6 flex items-center justify-end gap-2">
          <Button variant="secondary" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button
            variant={variant === "danger" ? "danger" : "primary"}
            onClick={onConfirm}
            isLoading={isLoading}
            disabled={confirmDisabled || isLoading}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
