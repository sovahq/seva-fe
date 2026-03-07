"use client"

import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { AppShell } from "@/components/layout"
import { EventsProvider } from "@/context/EventsContext"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <EventsProvider>
        <AppShell>{children}</AppShell>
      </EventsProvider>
    </ProtectedRoute>
  )
}
