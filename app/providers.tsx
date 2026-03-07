"use client"

import { AuthProvider } from "@/context/AuthContext"
import { ViewAsProvider } from "@/context/ViewAsContext"
import { Toaster } from "react-hot-toast"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ViewAsProvider>
        {children}
        <Toaster />
      </ViewAsProvider>
    </AuthProvider>
  )
}
