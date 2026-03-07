"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { ROUTES } from "@/routes/routenames"

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { currentUserId, hasHydrated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!hasHydrated) return
    if (currentUserId === null) {
      router.replace(ROUTES.LOGIN)
    }
  }, [hasHydrated, currentUserId, router])

  if (!hasHydrated || currentUserId === null) {
    return null
  }

  return <>{children}</>
}
