"use client"

import { mockFinancialSummaries } from "@/data/mock"
import { useAuth } from "@/context/AuthContext"

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(amount)
}

export default function FinancePage() {
  const { currentOrganizationId } = useAuth()
  const financial = mockFinancialSummaries.find(
    (f) => f.organizationId === currentOrganizationId
  )

  return (
    <div className="mx-auto max-w-7xl p-6">
      <h1 className="text-2xl font-semibold" style={{ color: "var(--primary)" }}>
        Finance
      </h1>
      <p className="mt-1" style={{ color: "var(--muted-foreground)" }}>
        Financial overview.
      </p>
      {financial ? (
        <div className="mt-6 space-y-2">
          <p>Dues collected YTD: {formatCurrency(financial.duesCollectedYtd)}</p>
          <p>Pending retirements: {financial.pendingRetirementsCount}</p>
        </div>
      ) : (
        <p className="mt-6" style={{ color: "var(--muted-foreground)" }}>
          No financial summary for this organization.
        </p>
      )}
    </div>
  )
}
