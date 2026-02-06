"use client"

import { useState } from "react"
import type { BoardPosition, BoardPositionAssignment, User } from "@/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldGroup, FieldSet, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type MemberAssignmentProps = {
  positions: BoardPosition[]
  assignments: BoardPositionAssignment[]
  onAssignmentsChange: (assignments: BoardPositionAssignment[]) => void
  users: User[]
  organizationId: string
  disabled?: boolean
}

export function MemberAssignment({
  positions,
  assignments,
  onAssignmentsChange,
  users,
  organizationId,
  disabled,
}: MemberAssignmentProps) {
  const [selectedPositionId, setSelectedPositionId] = useState<string | null>(null)
  const [assignUserId, setAssignUserId] = useState<string | null>(null)
  const [assignEmail, setAssignEmail] = useState("")

  const orgUsers = users.filter((u) => u.organizationId === organizationId)

  function assignUser(positionId: string, userId: string | null, email: string | null) {
    const existing = assignments.find(
      (a) => a.positionId === positionId && (a.userId === userId || a.email === email)
    )
    if (existing) return
    const id = `assign-${Date.now()}`
    onAssignmentsChange([
      ...assignments,
      { id, organizationId, positionId, userId, email },
    ])
    setAssignUserId(null)
    setAssignEmail("")
    setSelectedPositionId(null)
  }

  function removeAssignment(assignmentId: string) {
    onAssignmentsChange(assignments.filter((a) => a.id !== assignmentId))
  }

  function getUserName(a: BoardPositionAssignment): string {
    if (a.userId) {
      const u = users.find((x) => x.id === a.userId)
      return u ? `${u.name} (${u.email})` : "Unknown user"
    }
    if (a.email) return a.email
    return "Unassigned"
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle style={{ color: "var(--primary)" }}>
          Assign people to positions
        </CardTitle>
        <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
          Link members or invite by email to each board position. They will get
          the access you set in the Permissions tab.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <FieldSet>
          <FieldGroup>
            <Field>
              <FieldLabel>Add assignment</FieldLabel>
              <div className="flex flex-wrap items-end gap-2">
                <Select
                  value={selectedPositionId ?? ""}
                  onValueChange={setSelectedPositionId}
                  disabled={disabled}
                >
                  <SelectTrigger className="w-[180px]" size="default">
                    <SelectValue placeholder="Choose position" />
                  </SelectTrigger>
                  <SelectContent>
                    {positions.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={assignUserId ?? "email"}
                  onValueChange={(v) => {
                    setAssignUserId(v === "email" ? null : v)
                    setAssignEmail("")
                  }}
                  disabled={disabled}
                >
                  <SelectTrigger className="w-[200px]" size="default">
                    <SelectValue placeholder="User or email" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Enter email instead</SelectItem>
                    {orgUsers.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {assignUserId === null || assignUserId === "email" ? (
                  <Input
                    placeholder="Email address"
                    type="email"
                    value={assignEmail}
                    onChange={(e) => setAssignEmail(e.target.value)}
                    disabled={disabled}
                    className="max-w-[220px]"
                  />
                ) : null}
                <Button
                  type="button"
                  onClick={() => {
                    if (!selectedPositionId) return
                    if (assignUserId && assignUserId !== "email") {
                      assignUser(selectedPositionId, assignUserId, null)
                    } else if (assignEmail.trim()) {
                      assignUser(selectedPositionId, null, assignEmail.trim())
                    }
                  }}
                  disabled={
                    disabled ||
                    !selectedPositionId ||
                    (assignUserId && assignUserId !== "email"
                      ? false
                      : !assignEmail.trim())
                  }
                >
                  Assign
                </Button>
              </div>
            </Field>
          </FieldGroup>
        </FieldSet>

        <div>
          <p className="mb-2 text-sm font-medium" style={{ color: "var(--muted-foreground)" }}>
            Current assignments
          </p>
          <ul className="space-y-2">
            {positions.map((pos) => {
              const posAssignments = assignments.filter(
                (a) => a.positionId === pos.id
              )
              return (
                <li
                  key={pos.id}
                  className="rounded-xl border border-border/60 bg-card px-3 py-2"
                >
                  <span className="font-medium" style={{ color: "var(--primary)" }}>
                    {pos.name}
                  </span>
                  <ul className="mt-1.5 list-none space-y-1 pl-2 text-sm" style={{ color: "var(--muted-foreground)" }}>
                    {posAssignments.length === 0 ? (
                      <li>No one assigned</li>
                    ) : (
                      posAssignments.map((a) => (
                        <li key={a.id} className="flex items-center gap-2">
                          {getUserName(a)}
                          {!disabled && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="xs"
                              onClick={() => removeAssignment(a.id)}
                              style={{ color: "var(--destructive)" }}
                            >
                              Remove
                            </Button>
                          )}
                        </li>
                      ))
                    )}
                  </ul>
                </li>
              )
            })}
          </ul>
          {positions.length === 0 && (
            <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
              Add positions in the Hierarchy tab first, then assign people here.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
