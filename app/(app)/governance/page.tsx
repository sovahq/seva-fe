"use client"

import { mockGovernanceDocuments } from "@/data/mock"
import { useAuth } from "@/context/AuthContext"

export default function GovernancePage() {
  const { currentOrganizationId } = useAuth()
  const documents = mockGovernanceDocuments.filter(
    (d) => d.organizationId === currentOrganizationId
  )

  return (
    <div className="mx-auto max-w-7xl p-6">
      <h1 className="text-2xl font-semibold" style={{ color: "var(--primary)" }}>
        Governance
      </h1>
      <p className="mt-1" style={{ color: "var(--muted-foreground)" }}>
        Documents and policies.
      </p>
      <ul className="mt-6 list-none space-y-2">
        {documents.length === 0 ? (
          <li style={{ color: "var(--muted-foreground)" }}>No documents yet.</li>
        ) : (
          documents.map((doc) => (
            <li key={doc.id}>
              <a
                href="#"
                className="font-medium underline-offset-2 hover:underline"
                style={{ color: "var(--primary)" }}
              >
                {doc.title}
              </a>
            </li>
          ))
        )}
      </ul>
    </div>
  )
}
