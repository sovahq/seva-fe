"use client"

import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { AppShell } from "@/components/layout"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <AppShell>{children}</AppShell>
    </ProtectedRoute>
  )
}
