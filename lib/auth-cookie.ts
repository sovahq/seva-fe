import type { UserRole } from "@/types"

export const AUTH_COOKIE_NAME = "seva-auth"

export type AuthCookie = {
  userId: string
  role: UserRole
  organizationId?: string | null
}

const MAX_AGE_DAYS = 7

/**
 * Parse auth cookie from a Cookie header value (e.g. in middleware).
 * Returns null if missing or invalid.
 */
export function parseAuthCookie(cookieValue: string | undefined): AuthCookie | null {
  if (!cookieValue?.trim()) return null
  try {
    const decoded = decodeURIComponent(cookieValue.trim())
    const parsed = JSON.parse(decoded) as unknown
    if (
      parsed &&
      typeof parsed === "object" &&
      "userId" in parsed &&
      "role" in parsed &&
      typeof (parsed as AuthCookie).userId === "string" &&
      typeof (parsed as AuthCookie).role === "string"
    ) {
      const { userId, role, organizationId } = parsed as AuthCookie
      return { userId, role, organizationId: organizationId ?? null }
    }
  } catch {
    // ignore
  }
  return null
}

/**
 * Read auth cookie from document.cookie (client-only).
 * Use for rehydration in AuthProvider.
 */
export function getAuthCookieFromDocument(): AuthCookie | null {
  if (typeof document === "undefined") return null
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${AUTH_COOKIE_NAME}=([^;]*)`))
  const value = match?.[1]
  return value ? parseAuthCookie(value) : null
}

/**
 * Set auth cookie (client-only). Call after login or when organization changes.
 */
export function setAuthCookie(data: AuthCookie): void {
  if (typeof document === "undefined") return
  const value = encodeURIComponent(JSON.stringify(data))
  const maxAge = MAX_AGE_DAYS * 24 * 60 * 60
  document.cookie = `${AUTH_COOKIE_NAME}=${value}; path=/; max-age=${maxAge}; SameSite=Lax`
}

/**
 * Clear auth cookie (client-only). Call on logout.
 */
export function clearAuthCookie(): void {
  if (typeof document === "undefined") return
  document.cookie = `${AUTH_COOKIE_NAME}=; path=/; max-age=0`
}
