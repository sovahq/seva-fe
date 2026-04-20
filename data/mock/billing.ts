import type { BillingInvoice, OrganizationSubscription } from "@/types"

const mockSubscriptions: OrganizationSubscription[] = [
  {
    organizationId: "org-jci-eko",
    planId: "standard",
    planLabel: "Standard",
    status: "active",
    currency: "NGN",
    amountMinor: 450_000_00,
    interval: "year",
    currentPeriodEnd: "2027-01-15T00:00:00.000Z",
    seatsIncluded: 50,
    paymentMethodSummary: "Visa •••• 4242",
    cancelAtPeriodEnd: false,
  },
  {
    organizationId: "org-demo",
    planId: "starter",
    planLabel: "Starter",
    status: "trialing",
    currency: "NGN",
    amountMinor: 120_000_00,
    interval: "year",
    currentPeriodEnd: "2026-06-01T00:00:00.000Z",
    trialEndsAt: "2026-04-01T00:00:00.000Z",
    seatsIncluded: 15,
    paymentMethodSummary: undefined,
    cancelAtPeriodEnd: false,
  },
]

const mockInvoices: BillingInvoice[] = [
  {
    id: "inv-jci-1",
    organizationId: "org-jci-eko",
    issuedAt: "2026-01-15T10:00:00.000Z",
    amountMinor: 450_000_00,
    currency: "NGN",
    status: "paid",
    pdfUrl: "#",
  },
  {
    id: "inv-jci-2",
    organizationId: "org-jci-eko",
    issuedAt: "2025-01-15T10:00:00.000Z",
    amountMinor: 380_000_00,
    currency: "NGN",
    status: "paid",
    pdfUrl: "#",
  },
  {
    id: "inv-jci-3",
    organizationId: "org-jci-eko",
    issuedAt: "2025-07-01T09:00:00.000Z",
    amountMinor: 190_000_00,
    currency: "NGN",
    status: "void",
  },
  {
    id: "inv-demo-1",
    organizationId: "org-demo",
    issuedAt: "2026-02-01T12:00:00.000Z",
    amountMinor: 120_000_00,
    currency: "NGN",
    status: "open",
  },
]

export function getMockSubscription(organizationId: string): OrganizationSubscription | null {
  return mockSubscriptions.find((s) => s.organizationId === organizationId) ?? null
}

export function getMockInvoices(organizationId: string): BillingInvoice[] {
  return mockInvoices
    .filter((i) => i.organizationId === organizationId)
    .sort((a, b) => (a.issuedAt < b.issuedAt ? 1 : -1))
}
