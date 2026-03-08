"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useAuth } from "@/context/AuthContext"
import { useGovernance } from "@/context/GovernanceContext"
import { ROUTES } from "@/routes/routenames"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"

export default function GovernancePage() {
  const { currentOrganizationId } = useAuth()
  const { documents: allDocuments } = useGovernance()
  const [search, setSearch] = useState("")

  const documents = useMemo(() => {
    const list = allDocuments.filter(
      (d) => d.organizationId === currentOrganizationId
    )
    const q = search.trim().toLowerCase()
    if (!q) return list
    return list.filter(
      (d) =>
        d.title.toLowerCase().includes(q) ||
        (d.searchableText?.toLowerCase().includes(q) ?? false)
    )
  }, [allDocuments, currentOrganizationId, search])

  return (
    <div className="mx-auto max-w-7xl p-6">
      <h1 className="text-2xl font-semibold" style={{ color: "var(--primary)" }}>
        Governance
      </h1>
      <p className="mt-1" style={{ color: "var(--muted-foreground)" }}>
        Documents and policies.
      </p>

      <div className="relative mt-6 max-w-md">
        <Search
          className="absolute left-3 top-1/2 size-4 -translate-y-1/2"
          style={{ color: "var(--muted-foreground)" }}
        />
        <Input
          placeholder="Search by title or content..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <ul className="mt-4 list-none space-y-2">
        {documents.length === 0 ? (
          <li style={{ color: "var(--muted-foreground)" }}>
            {search.trim() ? "No documents match your search." : "No documents yet."}
          </li>
        ) : (
          documents.map((doc) => (
            <li key={doc.id}>
              <Link
                href={`${ROUTES.GOVERNANCE}/${doc.id}`}
                className="font-medium underline-offset-2 hover:underline"
                style={{ color: "var(--primary)" }}
              >
                {doc.title}
              </Link>
            </li>
          ))
        )}
      </ul>
    </div>
  )
}
