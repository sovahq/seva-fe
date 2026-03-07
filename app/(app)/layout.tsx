"use client"

import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { AppShell } from "@/components/layout"
import { DuesProvider } from "@/context/DuesContext"
import { MeetingsProvider } from "@/context/MeetingsContext"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <MeetingsProvider>
        <DuesProvider>
          <AppShell>{children}</AppShell>
        </DuesProvider>
      </MeetingsProvider>
    </ProtectedRoute>
  )
}
