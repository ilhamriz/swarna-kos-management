import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function toWhatsappFormat(phone: string): string {
  const digits = phone.replace(/\D/g, "")
  return digits.startsWith("0") ? `62${digits.slice(1)}` : digits
}

export function fromWhatsappFormat(phone: string): string {
  const digits = phone.replace(/\D/g, "")
  return digits.startsWith("62") ? `0${digits.slice(2)}` : digits
}

export function formatRupiah(amount: number) {
  return `Rp ${amount.toLocaleString("id-ID")}`
}

export function formatPeriod(start: string, end: string) {
  const options: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" }
  return `${new Date(start).toLocaleDateString("id-ID", options)} - ${new Date(
    end
  ).toLocaleDateString("id-ID", { ...options, year: "numeric" })}`
}
