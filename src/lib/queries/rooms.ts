import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
import type { RoomInput } from "@/lib/schemas/room"

export const roomKeys = {
  all: ["rooms"] as const,
  detail: (id: string) => ["rooms", id] as const,
}

export function useRooms() {
  const supabase = createClient()

  return useQuery({
    queryKey: roomKeys.all,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rooms")
        .select(
          `
          *,
          tenants (
            id,
            is_active
          )
        `
        )
        .order("room_number")

      if (error) throw error
      return data
    },
  })
}

export function useRoom(id: string) {
  const supabase = createClient()

  return useQuery({
    queryKey: roomKeys.detail(id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rooms")
        .select(
          `
          *,
          tenants (
            id,
            full_name,
            phone_number,
            check_in_date,
            is_active
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

export function useCreateRoom() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: RoomInput) => {
      const { error } = await supabase.from("rooms").insert(data)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roomKeys.all })
    },
  })
}

export function useDeleteRoom() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("rooms").delete().eq("id", id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roomKeys.all })
    },
  })
}

export function useUpdateRoom() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: RoomInput }) => {
      const { error } = await supabase.from("rooms").update(data).eq("id", id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roomKeys.all })
    },
  })
}
