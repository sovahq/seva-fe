"use client"

import {
  mockGovernanceDocuments,
  mockFinancialSummaries,
  mockMembers,
  mockEvents,
} from "@/data/mock"
import { useAuth } from "@/context/AuthContext"
import { PillarCard } from "@/components/cards"
import { ROUTES } from "@/routes/routenames"

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(amount)
}

export function DashboardContent() {
  const { currentOrganizationId } = useAuth()

  const documents = mockGovernanceDocuments
    .filter((d) => d.organizationId === currentOrganizationId)
    .slice(0, 3)

  const financial = mockFinancialSummaries.find(
    (f) => f.organizationId === currentOrganizationId
  )

  const members = mockMembers
    .filter((m) => m.organizationId === currentOrganizationId)
    .slice(0, 3)
  const memberCount = mockMembers.filter(
    (m) => m.organizationId === currentOrganizationId
  ).length

  const events = mockEvents
    .filter((e) => e.organizationId === currentOrganizationId)
    .slice(0, 3)

  return (
    <div className="mx-auto max-w-7xl p-6">
      <h1
        className="text-2xl font-semibold"
        style={{ color: "var(--primary)" }}
      >
        Dashboard
      </h1>
      <p
        className="mt-1"
        style={{ color: "var(--muted-foreground)" }}
      >
        Read-only overview of Executive Governance, Financial Integrity,
        Membership Lifecycle, and Project Operations.
      </p>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
        <PillarCard title="Executive Governance" to={ROUTES.GOVERNANCE}>
          {documents.length === 0 ? (
            <p style={{ color: "var(--muted-foreground)" }}>No documents yet.</p>
          ) : (
            <ul className="list-none space-y-1">
              {documents.map((doc) => (
                <li key={doc.id}>{doc.title}</li>
              ))}
            </ul>
          )}
        </PillarCard>

        <PillarCard title="Financial Integrity" to={ROUTES.FINANCE}>
          {financial ? (
            <>
              <p>Dues collected YTD: {formatCurrency(financial.duesCollectedYtd)}</p>
              <p>Pending retirements: {financial.pendingRetirementsCount}</p>
            </>
          ) : (
            <p style={{ color: "var(--muted-foreground)" }}>
              No financial summary for this organization.
            </p>
          )}
        </PillarCard>

        <PillarCard
          title="Membership Lifecycle"
          viewAllLabel="View directory"
          to={ROUTES.MEMBERS}
        >
          <p className="font-medium">Total members: {memberCount}</p>
          {members.length === 0 ? (
            <p style={{ color: "var(--muted-foreground)" }}>No members listed.</p>
          ) : (
            <ul className="list-none space-y-1">
              {members.map((m) => (
                <li key={m.id}>
                  {m.name}
                  {m.role ? ` (${m.role})` : ""}
                </li>
              ))}
            </ul>
          )}
        </PillarCard>

        <PillarCard title="Project Operations" viewAllLabel="View events" to={ROUTES.EVENTS}>
          {events.length === 0 ? (
            <p style={{ color: "var(--muted-foreground)" }}>No upcoming events.</p>
          ) : (
            <ul className="list-none space-y-1">
              {events.map((evt) => (
                <li key={evt.id}>
                  {evt.name}, {evt.date}
                </li>
              ))}
            </ul>
          )}
        </PillarCard>
      </div>
    </div>
  )
}
