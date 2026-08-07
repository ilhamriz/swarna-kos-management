"use client"

import Link from "next/link"
import { useState } from "react"
import { toast } from "sonner"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  contactLogSchema,
  contactMethods,
  contactMethodLabels,
  type ContactLogInput,
} from "@/lib/schemas/contact-log"
import { useTenantContactLogs, useCreateContactLog } from "@/lib/queries/contact-logs"
import { FormGroup } from "@/components/ui/form/FormGroup"
import { Textarea } from "@/components/ui/form/Textarea"
import { Select } from "@/components/ui/form/Select"
import { Button, buttonVariants } from "@/components/ui/Button"

interface ContactLogSectionProps {
  readonly tenantId: string
}

export function ContactLogSection({ tenantId }: ContactLogSectionProps) {
  const { data: logs, isLoading } = useTenantContactLogs(tenantId)
  const createContactLog = useCreateContactLog()
  const [showForm, setShowForm] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactLogInput>({
    resolver: zodResolver(contactLogSchema),
  })

  async function onSubmit(values: ContactLogInput) {
    try {
      await createContactLog.mutateAsync({ tenantId, data: values })
      toast.success("Kontak berhasil dicatat")
      reset()
      setShowForm(false)
    } catch {
      toast.error("Gagal menyimpan data, coba lagi.")
    }
  }

  if (isLoading) {
    return <div className="h-24 bg-bg-elevated rounded-xl animate-pulse mb-4" />
  }

  const displayLogs = logs?.slice(0, 5) ?? []

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-semibold text-text-primary">Riwayat Kontak</h2>
        {!showForm && (
          <Button variant="ghost" size="small" onClick={() => setShowForm(true)} className="w-fit">
            + Catat Kontak
          </Button>
        )}
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-bg-surface rounded-xl border border-border p-4 mb-3 space-y-3"
        >
          <FormGroup label="Metode" required error={errors.method?.message}>
            <Select {...register("method")} defaultValue="">
              <option value="" disabled>
                Pilih metode
              </option>
              {contactMethods.map((method) => (
                <option key={method} value={method}>
                  {contactMethodLabels[method]}
                </option>
              ))}
            </Select>
          </FormGroup>

          <FormGroup label="Catatan Hasil" error={errors.notes?.message}>
            <Textarea {...register("notes")} placeholder="Opsional" rows={2} />
          </FormGroup>

          <div className="flex gap-2">
            <Button type="submit" isLoading={isSubmitting} className="flex-1">
              Simpan
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                reset()
                setShowForm(false)
              }}
              className="flex-1"
            >
              Batal
            </Button>
          </div>
        </form>
      )}

      {displayLogs.length === 0 ? (
        <div className="bg-bg-surface rounded-xl p-4 border border-border text-center">
          <p className="text-sm text-text-muted">Belum ada riwayat kontak</p>
        </div>
      ) : (
        <div className="space-y-2">
          {displayLogs.map((log) => (
            <div key={log.id} className="bg-bg-surface rounded-xl p-3 border border-border">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-text-primary">
                  {contactMethodLabels[log.method]}
                </p>
                <p className="text-xs text-text-muted">
                  {new Date(log.contacted_at).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
              {log.notes && <p className="text-xs text-text-secondary mt-1">{log.notes}</p>}
            </div>
          ))}

          {(logs?.length ?? 0) > 5 && (
            <div className="pt-1 text-center">
              <Link
                href={`/penghuni/${tenantId}/kontak`}
                className={buttonVariants({ variant: "ghost", size: "small" })}
              >
                Lihat Semua
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
