"use client"

import { mockMembers } from "@/data/mock"
import { useAuth } from "@/context/AuthContext"

export default function MembersPage() {
  const { currentOrganizationId } = useAuth()
  const members = mockMembers.filter((m) => m.organizationId === currentOrganizationId)

  return (
    <div className="mx-auto max-w-7xl p-6">
      <h1 className="text-2xl font-semibold" style={{ color: "var(--primary)" }}>
        Members
      </h1>
      <p className="mt-1" style={{ color: "var(--muted-foreground)" }}>
        Member directory.
      </p>
      <ul className="mt-6 list-none space-y-2">
        {members.length === 0 ? (
          <li style={{ color: "var(--muted-foreground)" }}>No members listed.</li>
        ) : (
          members.map((m) => (
            <li key={m.id}>
              {m.name}
              {m.role ? ` · ${m.role}` : ""}
            </li>
          ))
        )}
      </ul>
    </div>
  )
}
