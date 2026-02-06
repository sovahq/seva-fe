"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { ROUTES } from "@/routes/routenames"

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { currentUserId } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (currentUserId === null) {
      router.replace(ROUTES.LOGIN)
    }
  }, [currentUserId, router])

  if (currentUserId === null) {
    return null
  }

  return <>{children}</>
}
