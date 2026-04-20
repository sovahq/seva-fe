"use client"

import NextTopLoader from "nextjs-toploader"
import { AuthProvider } from "@/context/AuthContext"
import { ViewAsProvider } from "@/context/ViewAsContext"
import { Toaster } from "react-hot-toast"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ViewAsProvider>
        <NextTopLoader
          color="var(--primary)"
          height={3}
          showSpinner={false}
          shadow={false}
          zIndex={9999}
        />
        {children}
        <Toaster />
      </ViewAsProvider>
    </AuthProvider>
  )
}
