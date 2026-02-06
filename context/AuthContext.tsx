"use client"

import * as React from "react"
import { mockOrganizations } from "@/data/mock/organizations"
import { mockUsers } from "@/data/mock/users"
import type { Organization, User } from "@/types"

type AuthContextValue = {
  currentUserId: string | null
  currentUser: User | null
  availableUsers: User[]
  organizations: Organization[]
  currentOrganizationId: string | null
  currentOrganization: Organization | null
  login: (userId: string) => void
  logout: () => void
  switchUser: (user: User) => void
  addOrganization: (org: Organization) => void
  setOrganization: (id: string | null) => void
}

const AuthContext = React.createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUserId, setCurrentUserId] = React.useState<string | null>(null)
  const [organizations, setOrganizations] = React.useState<Organization[]>(mockOrganizations)
  const [currentOrganizationId, setCurrentOrganizationId] = React.useState<string | null>(null)

  const currentUser = React.useMemo(
    () => mockUsers.find((u) => u.id === currentUserId) ?? null,
    [currentUserId]
  )
  const currentOrganization = React.useMemo(
    () => organizations.find((o) => o.id === currentOrganizationId) ?? null,
    [organizations, currentOrganizationId]
  )

  const login = React.useCallback((userId: string) => {
    setCurrentUserId(userId)
  }, [])

  const logout = React.useCallback(() => {
    setCurrentUserId(null)
    setCurrentOrganizationId(null)
  }, [])

  const switchUser = React.useCallback((user: User) => {
    setCurrentUserId(user.id)
  }, [])

  const addOrganization = React.useCallback((org: Organization) => {
    setOrganizations((prev) => (prev.some((o) => o.id === org.id) ? prev : [...prev, org]))
  }, [])

  const setOrganization = React.useCallback((id: string | null) => {
    setCurrentOrganizationId(id)
  }, [])

  const value: AuthContextValue = {
    currentUserId,
    currentUser,
    availableUsers: mockUsers,
    organizations,
    currentOrganizationId,
    currentOrganization,
    login,
    logout,
    switchUser,
    addOrganization,
    setOrganization,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = React.useContext(AuthContext)
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return ctx
}
