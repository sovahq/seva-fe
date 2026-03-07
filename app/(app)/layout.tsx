"use client"

import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { RouteGuard } from "@/components/auth/RouteGuard"
import { AppShell } from "@/components/layout"
import { MeetingsProvider } from "@/context/MeetingsContext"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <MeetingsProvider>
        <AppShell>
          <RouteGuard>{children}</RouteGuard>
        </AppShell>
      </MeetingsProvider>
    </ProtectedRoute>
  )
}
