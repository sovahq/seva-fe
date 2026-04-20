"use client"

import { motion } from "motion/react"
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
import { Eye, EyeOff } from "lucide-react"
import toast from "react-hot-toast"

export default function LoginPage() {
  const { login, organizations, setOrganization } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const fromOnboarding = searchParams.get("fromOnboarding") === "true"
  const organizationId = searchParams.get("organizationId")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedEmail = email.trim().toLowerCase()
    if (!trimmedEmail || !password) {
      toast.error("Enter your email and password.")
      return
    }
    const user = mockUsers.find((u) => u.email.toLowerCase() === trimmedEmail)
    if (!user) {
      toast.error("Invalid email or password.")
      return
    }
    const passwordMatch = user.password === undefined || user.password === password
    if (!passwordMatch) {
      toast.error("Invalid email or password.")
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
    toast.success("Successfully logged in!")
    router.replace(ROUTES.DASHBOARD)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6 sm:p-10">
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.06]"
        style={{
          backgroundImage: `radial-gradient(circle at 20% 30%, var(--surface-soft) 0%, transparent 45%),
            radial-gradient(circle at 80% 70%, var(--icon-muted) 0%, transparent 45%)`,
        }}
      />
      <motion.div
        className="relative w-full max-w-md"
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <div className="rounded-[1.25rem] border border-border bg-card p-8 shadow-none sm:p-10">
          <div className="mb-8 flex flex-col items-center text-center">
            <SevaLogo
              asLink
              to="/"
              size="lg"
              style={{ color: "var(--primary)" }}
              className="transition-opacity hover:opacity-90"
            />
            <p className="mt-2 text-sm text-muted-foreground">
              Sign in to access your dashboard
            </p>
            {fromOnboarding && (
              <motion.div
                className="mt-4 w-full rounded-xl bg-surface-soft px-4 py-3 text-sm font-medium text-primary"
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
              <Label htmlFor="login-email" className="text-foreground">
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
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="login-password" className="text-foreground">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 w-full pl-3 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
            <Button type="submit" className="h-12 w-full rounded-full text-base font-semibold">
              Sign in
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Demo: use an account email and password <strong className="text-foreground">password</strong>.
          </p>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don&apos;t have an organisation?{" "}
            <Link
              href={ROUTES.ONBOARDING}
              className="font-semibold text-brand-link underline-offset-4 transition-colors hover:text-primary"
            >
              Get started
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
