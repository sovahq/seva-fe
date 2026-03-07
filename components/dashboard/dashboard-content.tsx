"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import {
  mockGovernanceDocuments,
  mockFinancialSummaries,
  mockMembers,
} from "@/data/mock"
import { useAuth } from "@/context/AuthContext"
import { useEvents } from "@/context/EventsContext"
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
  const { events: allEvents } = useEvents()

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

  const events = allEvents
    .filter((e) => e.organizationId === currentOrganizationId)
    .slice(0, 3)
  const eventCount = allEvents.filter(
    (e) => e.organizationId === currentOrganizationId
  ).length
  const overviewChartData = [
    { name: "Members", value: memberCount, fullLabel: `${memberCount} members` },
    { name: "Events", value: eventCount, fullLabel: `${eventCount} events` },
    {
      name: "Dues YTD (₦k)",
      value: financial ? Math.round(financial.duesCollectedYtd / 1000) : 0,
      fullLabel: financial ? formatCurrency(financial.duesCollectedYtd) : "—",
    },
  ]

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
      <div className="mt-6 h-52 w-full max-w-2xl rounded-lg border p-4" style={{ borderColor: "var(--border)" }}>
        <p className="text-sm font-medium mb-3" style={{ color: "var(--primary)" }}>
          Key metrics
        </p>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={overviewChartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border/60" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
            <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} allowDecimals={false} />
            <Tooltip
              formatter={(value, name, props) => [props?.payload?.fullLabel ?? String(value), name ?? ""]}
              contentStyle={{ borderRadius: 8, border: "1px solid var(--border)" }}
              labelStyle={{ color: "var(--primary)" }}
            />
            <Bar dataKey="value" name="Value" fill="var(--primary)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
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
