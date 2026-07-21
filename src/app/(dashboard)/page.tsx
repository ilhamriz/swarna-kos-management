"use client"

import Link from "next/link"
import { useRooms } from "@/lib/queries/rooms"

export default function HomePage() {
  const { data: rooms, isLoading } = useRooms()

  const terisi =
    rooms?.filter((r) => r.tenants.some((t: { is_active: boolean }) => t.is_active)).length ?? 0
  const kosong = (rooms?.length ?? 0) - terisi

  return (
    <div className="p-4 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <p className="text-xs text-text-muted">Selamat datang</p>
          <h1 className="text-lg font-semibold text-text-primary">Kos Saya</h1>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-3 gap-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 bg-bg-elevated rounded-xl animate-pulse" />
          ))
        ) : (
          <>
            <div className="card p-3 text-center">
              <p className="text-2xl font-bold text-text-primary">{rooms?.length ?? 0}</p>
              <p className="text-xs text-text-muted mt-0.5">Total Kamar</p>
            </div>
            <div className="card p-3 text-center bg-success-bg border-border">
              <p className="text-2xl font-bold text-success">{terisi}</p>
              <p className="text-xs text-success mt-0.5">Terisi</p>
            </div>
            <div className="card p-3 text-center bg-warning-bg border-border">
              <p className="text-2xl font-bold text-warning">{kosong}</p>
              <p className="text-xs text-warning mt-0.5">Kosong</p>
            </div>
          </>
        )}
      </div>

      {/* Quick Access */}
      <div>
        <h2 className="text-sm font-semibold text-text-secondary mb-2">Akses Cepat</h2>
        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/kamar"
            className="card p-4 flex items-center gap-3 active:scale-95 transition-transform"
          >
            <div className="w-9 h-9 rounded-lg bg-bg-elevated flex items-center justify-center flex-shrink-0">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                className="w-5 h-5 text-primary"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 12l8.954-8.955a1.126 1.126 0 0 1 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-text-primary">Kamar</p>
              <p className="text-xs text-text-muted">Lihat semua kamar</p>
            </div>
          </Link>

          {/* TODO: HAPUS */}
          {/* <Link
            href="/penghuni"
            className="card p-4 flex items-center gap-3 active:scale-95 transition-transform"
          >
            <div className="w-9 h-9 rounded-lg bg-success-bg flex items-center justify-center flex-shrink-0">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                className="w-5 h-5 text-success"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-text-primary">Penghuni</p>
              <p className="text-xs text-text-muted">Kelola penghuni</p>
            </div>
          </Link>

          <Link
            href="/keuangan"
            className="card p-4 flex items-center gap-3 active:scale-95 transition-transform"
          >
            <div className="w-9 h-9 rounded-lg bg-warning-bg flex items-center justify-center flex-shrink-0">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                className="w-5 h-5 text-warning"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-text-primary">Keuangan</p>
              <p className="text-xs text-text-muted">Invoice & pembayaran</p>
            </div>
          </Link>

          <Link
            href="/pengingat"
            className="card p-4 flex items-center gap-3 active:scale-95 transition-transform"
          >
            <div className="w-9 h-9 rounded-lg bg-danger-bg flex items-center justify-center flex-shrink-0">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                className="w-5 h-5 text-danger"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-text-primary">Pengingat</p>
              <p className="text-xs text-text-muted">Tagihan jatuh tempo</p>
            </div>
          </Link> */}
        </div>
      </div>
    </div>
  )
}
