"use client"

import { motion } from "framer-motion"
import { useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { mockUsers } from "@/data/mock/users"
import { ROUTES } from "@/routes/routenames"
import { SevaLogo } from "@/components/branding"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function LoginPage() {
  const { login, organizations, setOrganization } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const fromOnboarding = searchParams.get("fromOnboarding") === "true"
  const organizationId = searchParams.get("organizationId")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const trimmedEmail = email.trim().toLowerCase()
    if (!trimmedEmail || !password) {
      setError("Enter your email and password.")
      return
    }
    const user = mockUsers.find((u) => u.email.toLowerCase() === trimmedEmail)
    if (!user) {
      setError("Invalid email or password.")
      return
    }
    const passwordMatch = user.password === undefined || user.password === password
    if (!passwordMatch) {
      setError("Invalid email or password.")
      return
    }
    login(user.id)
    if (organizationId) {
      setOrganization(organizationId)
    } else {
      const org =
        organizations.find((o) => o.id === user.organizationId) ?? organizations[0]
      if (org) setOrganization(org.id)
    }
    router.replace(ROUTES.DASHBOARD)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface p-4 sm:p-6">
      {/* Subtle background */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle at 20% 30%, var(--primary) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, var(--primary) 0%, transparent 50%)`,
        }}
      />
      <motion.div
        className="relative w-full max-w-md"
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <div
          className="rounded-2xl border p-8 shadow-xl sm:p-10"
          style={{
            borderColor: "rgba(0, 45, 91, 0.12)",
            backgroundColor: "var(--card)",
            boxShadow: "0 25px 50px -12px rgba(0, 45, 91, 0.08)",
          }}
        >
          <div className="mb-8 flex flex-col items-center text-center">
            <SevaLogo
              asLink
              to="/"
              size="lg"
              style={{ color: "var(--primary)" }}
              className="transition-opacity hover:opacity-90"
            />
            <p
              className="mt-2 text-sm"
              style={{ color: "var(--muted-foreground)" }}
            >
              Sign in to access your dashboard
            </p>
            {fromOnboarding && (
              <motion.div
                className="mt-4 w-full rounded-xl px-4 py-3 text-sm font-medium"
                style={{
                  backgroundColor: "rgba(0, 45, 91, 0.08)",
                  color: "var(--primary)",
                }}
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: "auto", marginTop: 16 }}
                transition={{ delay: 0.2, duration: 0.3 }}
              >
                Organisation created. Log in to continue.
              </motion.div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-2">
              <Label htmlFor="login-email" style={{ color: "var(--foreground)" }}>
                Email
              </Label>
              <Input
                id="login-email"
                type="email"
                autoComplete="email"
                placeholder="you@example.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 w-full px-3"
                style={{ borderColor: "rgba(0, 45, 91, 0.2)" }}
                aria-invalid={!!error}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="login-password" style={{ color: "var(--foreground)" }}>
                Password
              </Label>
              <Input
                id="login-password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 w-full px-3"
                style={{ borderColor: "rgba(0, 45, 91, 0.2)" }}
                aria-invalid={!!error}
              />
            </div>
            {error && (
              <p
                className="text-sm font-medium"
                style={{ color: "var(--destructive)" }}
                role="alert"
              >
                {error}
              </p>
            )}
            <Button
              type="submit"
              className="h-11 w-full font-medium"
              style={{
                backgroundColor: "var(--primary)",
                color: "var(--primary-foreground)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "var(--primary-hover)"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "var(--primary)"
              }}
            >
              Sign in
            </Button>
          </form>

          <p
            className="mt-6 text-center text-xs"
            style={{ color: "var(--muted-foreground)" }}
          >
            Demo: use an account email and password <strong>password</strong>.
          </p>

          <p
            className="mt-6 text-center text-sm"
            style={{ color: "var(--muted-foreground)" }}
          >
            Don&apos;t have an organisation?{" "}
            <Link
              href={ROUTES.ONBOARDING}
              className="font-medium underline underline-offset-2 hover:opacity-90"
              style={{ color: "var(--primary)" }}
            >
              Get started
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
