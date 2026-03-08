"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useAuth } from "@/context/AuthContext"
import { useDues } from "@/context/DuesContext"
import { mockMembers } from "@/data/mock"
import { ROUTES } from "@/routes/routenames"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Field,
  FieldGroup,
  FieldSet,
  FieldLabel,
  FieldDescription,
} from "@/components/ui/field"
import { Save, User } from "lucide-react"

function roleLabel(role: string): string {
  const labels: Record<string, string> = {
    admin: "Admin",
    board: "Board",
    member: "Member",
    finance: "Finance",
  }
  return labels[role] ?? role
}

export default function ProfilePage() {
  const { currentUser, currentOrganization, updateCurrentUser } = useAuth()
  const { memberDues } = useDues()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [saved, setSaved] = useState(false)

  const orgId = currentOrganization?.id ?? currentUser?.organizationId ?? ""
  const adminYear = currentOrganization?.fiscalYear ?? new Date().getFullYear()
  const member = currentUser
    ? mockMembers.find(
        (m) =>
          m.organizationId === orgId &&
          m.email?.toLowerCase() === currentUser.email?.toLowerCase()
      )
    : null
  const myDuesEntry = member
    ? memberDues.find(
        (d) =>
          d.organizationId === orgId &&
          d.administrativeYear === adminYear &&
          d.memberId === member.id
      )
    : null
  const duesPaid = myDuesEntry?.status === "paid"

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name)
      setEmail(currentUser.email)
    }
  }, [currentUser?.id]) // Refill when switching user

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmedName = name.trim()
    const trimmedEmail = email.trim().toLowerCase()
    if (!trimmedName || !trimmedEmail) return
    updateCurrentUser({ name: trimmedName, email: trimmedEmail })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (!currentUser) {
    return null
  }

  return (
    <div className="mx-auto max-w-xl p-6">
      <h1 className="flex items-center gap-2 text-2xl font-semibold" style={{ color: "var(--primary)" }}>
        <User className="size-7 shrink-0" />
        Profile
      </h1>
      <p className="mt-1 text-sm" style={{ color: "var(--muted-foreground)" }}>
        Your account details. Changes to name and email are saved for this session.
      </p>

      <form onSubmit={handleSubmit} className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle style={{ color: "var(--primary)" }}>Account</CardTitle>
            <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
              Update your display name and email.
            </p>
          </CardHeader>
          <CardContent>
            <FieldSet>
              <FieldGroup>
                <Field>
                  <FieldLabel>Name</FieldLabel>
                  <Input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="max-w-md"
                    maxLength={80}
                  />
                </Field>
                <Field>
                  <FieldLabel>Email</FieldLabel>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.org"
                    className="max-w-md"
                  />
                </Field>
                <Field>
                  <FieldLabel>Role</FieldLabel>
                  <FieldDescription>Your role in the organisation.</FieldDescription>
                  <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
                    {roleLabel(currentUser.role)}
                  </p>
                </Field>
                {currentOrganization && (
                  <Field>
                    <FieldLabel>Organisation</FieldLabel>
                    <FieldDescription>Current organisation context.</FieldDescription>
                    <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
                      {currentOrganization.name}
                    </p>
                  </Field>
                )}
                {member && (
                  <Field>
                    <FieldLabel>Dues</FieldLabel>
                    <FieldDescription>Your dues status for {adminYear}.</FieldDescription>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      {duesPaid ? (
                        <Badge variant="default">Dues paid for {adminYear}</Badge>
                      ) : (
                        <Badge variant="secondary">Dues outstanding</Badge>
                      )}
                      <Link
                        href={ROUTES.DUES}
                        className="text-sm underline"
                        style={{ color: "var(--primary)" }}
                      >
                        {duesPaid ? "View dues" : "Pay Dues"}
                      </Link>
                    </div>
                  </Field>
                )}
              </FieldGroup>
            </FieldSet>
            <div className="mt-4 flex items-center gap-3">
              <Button type="submit" disabled={!name.trim() || !email.trim()} className="gap-2">
                <Save className="size-4" />
                Save changes
              </Button>
              {saved && (
                <span className="text-sm" style={{ color: "var(--primary)" }}>
                  Saved.
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      </form>

      <p className="mt-6 text-xs" style={{ color: "var(--muted-foreground)" }}>
        Profile is available from the menu in the top right. Organisation-wide settings are in{" "}
        <Link href={ROUTES.SETTINGS} className="underline hover:no-underline">
          Settings
        </Link>{" "}
        (admin only).
      </p>
    </div>
  )
}
