"use client"

import Link from "next/link"
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
import { useDues } from "@/context/DuesContext"
import { useMeetings } from "@/context/MeetingsContext"
import { PillarCard } from "@/components/cards"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ROUTES } from "@/routes/routenames"

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(amount)
}

export function DashboardContent() {
  const { currentOrganizationId, currentUser, currentOrganization } = useAuth()
  const { memberDues } = useDues()
  const { meetings: allMeetings } = useMeetings()

  const orgId = currentOrganizationId ?? ""
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

  const meetings = allMeetings
    .filter((m) => m.organizationId === currentOrganizationId)
    .slice(0, 3)
  const meetingCount = allMeetings.filter(
    (m) => m.organizationId === currentOrganizationId
  ).length
  const overviewChartData = [
    { name: "Members", value: memberCount, fullLabel: `${memberCount} members` },
    { name: "Meetings", value: meetingCount, fullLabel: `${meetingCount} meetings` },
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
      {currentUser?.role === "member" && member && (
        <Card className="mt-6 border-primary/20 bg-primary/5">
          <CardContent className="p-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-medium text-sm" style={{ color: "var(--primary)" }}>
                Dues for {adminYear}
              </p>
              {duesPaid ? (
                <p className="text-sm mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                  You&apos;ve paid dues for this year.
                </p>
              ) : (
                <p className="text-sm mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                  Pay your dues and upload your receipt.
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {duesPaid ? (
                <Badge variant="default">Dues paid</Badge>
              ) : (
                <Button asChild size="sm">
                  <Link href={ROUTES.DUES}>Pay Dues</Link>
                </Button>
              )}
              <Button asChild variant="ghost" size="sm">
                <Link href={ROUTES.DUES}>{duesPaid ? "View dues" : "Go to dues"}</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

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

        <PillarCard title="Project Operations" viewAllLabel="View meetings" to={ROUTES.MEETINGS}>
          {meetings.length === 0 ? (
            <p style={{ color: "var(--muted-foreground)" }}>No upcoming meetings.</p>
          ) : (
            <ul className="list-none space-y-1">
              {meetings.map((m) => (
                <li key={m.id}>
                  {m.name}, {m.date}
                </li>
              ))}
            </ul>
          )}
        </PillarCard>
      </div>
    </div>
  )
}
