"use client"

import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { AppShell } from "@/components/layout"
import { DuesProvider } from "@/context/DuesContext"
import { GovernanceProvider } from "@/context/GovernanceContext"
import { MeetingsProvider } from "@/context/MeetingsContext"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <MeetingsProvider>
        <DuesProvider>
          <GovernanceProvider>
            <AppShell>{children}</AppShell>
          </GovernanceProvider>
        </DuesProvider>
      </MeetingsProvider>
    </ProtectedRoute>
  )
}
