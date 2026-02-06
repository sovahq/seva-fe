"use client"

import { AuthProvider } from "@/context/AuthContext"
import { ViewAsProvider } from "@/context/ViewAsContext"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ViewAsProvider>{children}</ViewAsProvider>
    </AuthProvider>
  )
}
