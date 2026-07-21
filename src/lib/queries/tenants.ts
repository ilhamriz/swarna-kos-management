import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
import type { TenantCreateInput, TenantEditInput, TenantCheckOutInput } from "@/lib/schemas/tenant"

export const tenantKeys = {
  all: ["tenants"] as const,
  detail: (id: string) => ["tenants", id] as const,
}

export function useTenants() {
  const supabase = createClient()

  return useQuery({
    queryKey: tenantKeys.all,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tenants")
        .select(
          `
          *,
          rooms (
            room_number
          )
        `
        )
        .order("full_name")

      if (error) throw error
      return data
    },
  })
}

export function useTenant(id: string) {
  const supabase = createClient()

  return useQuery({
    queryKey: tenantKeys.detail(id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tenants")
        .select(
          `
          *,
          rooms (
            room_number
          )
        `
        )
        .eq("id", id)
        .single()

      if (error) throw error
      return data
    },
  })
}

async function uploadKtpPhoto(supabase: ReturnType<typeof createClient>, file: File) {
  const fileExt = file.name.split(".").pop()
  const fileName = `${crypto.randomUUID()}.${fileExt}`

  const { data, error } = await supabase.storage.from("ktp-photos").upload(fileName, file)

  if (error) throw error
  return data.path
}

export function useCreateTenant() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: TenantCreateInput) => {
      const { ktp_photo, ...tenantData } = input
      const ktp_photo_url = await uploadKtpPhoto(supabase, ktp_photo)

      const { error } = await supabase.from("tenants").insert({
        ...tenantData,
        ktp_photo_url,
        is_active: true,
      })

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tenantKeys.all })
    },
  })
}

export function useUpdateTenant() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: TenantEditInput }) => {
      const { ktp_photo, ...tenantData } = data

      const updatePayload: Record<string, unknown> = { ...tenantData }

      if (ktp_photo) {
        updatePayload.ktp_photo_url = await uploadKtpPhoto(supabase, ktp_photo)
      }

      const { error } = await supabase.from("tenants").update(updatePayload).eq("id", id)

      if (error) throw error
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: tenantKeys.all })
      queryClient.invalidateQueries({ queryKey: tenantKeys.detail(variables.id) })
    },
  })
}

export function useCheckOutTenant() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: TenantCheckOutInput }) => {
      const { error } = await supabase
        .from("tenants")
        .update({ ...data, is_active: false })
        .eq("id", id)

      if (error) throw error
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: tenantKeys.all })
      queryClient.invalidateQueries({ queryKey: tenantKeys.detail(variables.id) })
    },
  })
}

export function useKtpSignedUrl() {
  const supabase = createClient()

  return useMutation({
    mutationFn: async (path: string) => {
      const { data, error } = await supabase.storage
        .from("ktp-photos")
        .createSignedUrl(path, 60 * 60) // 1 hour

      if (error) throw error
      return data.signedUrl
    },
  })
}
