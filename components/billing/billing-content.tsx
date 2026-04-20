"use client"

import { format } from "date-fns"
import toast from "react-hot-toast"
import type {
  BillingInvoice,
  Organization,
  OrganizationSubscription,
  PrimaryCurrency,
  SubscriptionPlanId,
} from "@/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

const PLAN_ORDER: SubscriptionPlanId[] = ["small_chapter", "mid_chapter", "large_chapter"]

/** Published list prices per tier (demo NGN / year) */
const TIER_LIST_PRICE_MINOR: Record<SubscriptionPlanId, number> = {
  small_chapter: 250_000_00,
  mid_chapter: 450_000_00,
  large_chapter: 1_200_000_00,
}

const PLAN_DETAILS: Record<
  SubscriptionPlanId,
  { title: string; capacityLine: string; headline: string; bullets: string[] }
> = {
  small_chapter: {
    title: "Small chapter",
    capacityLine: "Up to 30 members",
    headline: "Flat yearly fee — simple for treasurers to budget.",
    bullets: [
      "Full Seva workspace (governance, meetings, members, finance)",
      "One predictable line item — not a per-member tax",
      "Best fit when your roster stays compact",
    ],
  },
  mid_chapter: {
    title: "Mid-size chapter",
    capacityLine: "Up to 100 members",
    headline: "Room to grow without jumping to unlimited pricing.",
    bullets: [
      "Same product features as every tier — capacity is the only difference",
      "Fair middle ground for growing LOs",
      "Annual invoice friendly for handovers year to year",
    ],
  },
  large_chapter: {
    title: "Large chapter",
    capacityLine: "Unlimited members",
    headline: "No ceiling on roster size — one flat patron-style fee.",
    bullets: [
      "Supports very large chapters and complex boards",
      "Treasury still gets a single annual number to plan around",
      "Priority support (when billing goes live)",
    ],
  },
}

function formatMoneyMinor(amountMinor: number, currency: PrimaryCurrency): string {
  const major = amountMinor / 100
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(major)
}

function capacityLineFromSubscription(sub: OrganizationSubscription): string {
  if (sub.seatsIncluded == null) {
    return "Unlimited members on this plan"
  }
  return `Up to ${sub.seatsIncluded} members on this plan`
}

function subscriptionStatusBadge(
  status: OrganizationSubscription["status"]
): { label: string; variant: "default" | "secondary" | "destructive" | "outline" } {
  switch (status) {
    case "active":
      return { label: "Active", variant: "default" }
    case "trialing":
      return { label: "Trial", variant: "secondary" }
    case "past_due":
      return { label: "Past due", variant: "destructive" }
    case "canceled":
      return { label: "Canceled", variant: "outline" }
    default:
      return { label: status, variant: "outline" }
  }
}

function invoiceStatusBadge(
  status: BillingInvoice["status"]
): { label: string; variant: "default" | "secondary" | "destructive" | "outline" } {
  switch (status) {
    case "paid":
      return { label: "Paid", variant: "default" }
    case "open":
      return { label: "Open", variant: "destructive" }
    case "void":
      return { label: "Void", variant: "outline" }
    default:
      return { label: status, variant: "outline" }
  }
}

export interface BillingContentProps {
  organization: Organization | null
  subscription: OrganizationSubscription | null
  invoices: BillingInvoice[]
}

export function BillingContent({ organization, subscription, invoices }: BillingContentProps) {
  const orgName = organization?.name ?? "Your organisation"
  const displayCurrency = organization?.primaryCurrency ?? subscription?.currency ?? "NGN"
  const hasOpenInvoice = invoices.some((i) => i.status === "open")
  const primaryCtaLabel =
    subscription?.status === "past_due" || hasOpenInvoice
      ? "Pay to continue"
      : subscription
        ? "Renew or change plan"
        : "Choose a plan"

  function handlePrimaryPayAction() {
    toast.success("Billing checkout is not connected yet — this is a preview.")
  }

  function handleAddPaymentMethod() {
    toast.success("Payment methods will be added when checkout is live.")
  }

  function handleDownloadInvoice(invoiceId: string) {
    toast(`Invoice ${invoiceId} — download will be available when billing is live.`)
  }

  return (
    <div className="mx-auto max-w-6xl space-y-12 px-0 py-2 sm:py-4">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-primary">Plan & billing</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Subscription and invoices for <span className="font-semibold text-foreground">{orgName}</span>.
          Seva uses <span className="font-medium text-foreground">tiered flat fees by chapter size</span> — one
          annual price per bucket (member capacity), not per-seat metering.
        </p>
      </header>

      <section aria-labelledby="treasurer-tip-heading">
        <Card className="border-border bg-muted/40">
          <CardHeader className="pb-2">
            <CardTitle id="treasurer-tip-heading" className="text-base">
              A note for treasurers (and incoming boards)
            </CardTitle>
            <CardDescription className="text-sm leading-relaxed text-muted-foreground">
              JCI treasurers change every year. Many chapters find it easiest to{" "}
              <span className="font-medium text-foreground">include Seva in annual dues</span> — for example, if
              dues are ₦25,000, communicate ₦26,000 with a clear line that the difference covers the chapter&apos;s
              Seva subscription for project tracking and reporting. Members effectively crowdfund the tool; the board
              keeps a single predictable platform fee.
            </CardDescription>
          </CardHeader>
        </Card>
      </section>

      <section className="space-y-4">
        <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Current plan
        </h2>
        {subscription ? (
          <Card className="border-border">
            <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <CardTitle className="text-xl">{subscription.planLabel}</CardTitle>
                <CardDescription className="mt-1 text-base">
                  {formatMoneyMinor(subscription.amountMinor, subscription.currency)} per{" "}
                  {subscription.interval === "year" ? "year" : "month"}
                  <span className="mt-1 block text-muted-foreground">{capacityLineFromSubscription(subscription)}</span>
                </CardDescription>
              </div>
              <Badge variant={subscriptionStatusBadge(subscription.status).variant} className="w-fit shrink-0">
                {subscriptionStatusBadge(subscription.status).label}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                <span className="font-medium text-foreground">Renews: </span>
                {format(new Date(subscription.currentPeriodEnd), "PPP")}
              </p>
              {subscription.trialEndsAt ? (
                <p>
                  <span className="font-medium text-foreground">Trial ends: </span>
                  {format(new Date(subscription.trialEndsAt), "PPP")}
                </p>
              ) : null}
              {subscription.cancelAtPeriodEnd ? (
                <p className="text-destructive">Access ends at the end of this billing period.</p>
              ) : null}
              <p>
                <span className="font-medium text-foreground">Payment method: </span>
                {subscription.paymentMethodSummary ?? "None on file — add a card to avoid interruption."}
              </p>
            </CardContent>
            <CardFooter className="flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:flex-wrap">
              <Button type="button" className="w-full sm:w-auto" onClick={handlePrimaryPayAction}>
                {primaryCtaLabel}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full border-border sm:w-auto"
                onClick={handleAddPaymentMethod}
              >
                Add payment method
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <Card className="border-border">
            <CardHeader>
              <CardTitle>No subscription on file</CardTitle>
              <CardDescription>
                Pick the capacity tier that matches your chapter size — pricing is a flat annual fee per bucket, not
                per member.
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button type="button" onClick={handlePrimaryPayAction}>
                Choose a plan
              </Button>
            </CardFooter>
          </Card>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Capacity tiers (flat yearly fee)
        </h2>
        <p className="max-w-3xl text-sm text-muted-foreground">
          Same product across tiers — you only choose how many members your chapter needs on the platform. That
          keeps pitching simple: compare three numbers to the board, not a spreadsheet of per-head charges.
        </p>
        <div className="grid gap-4 md:grid-cols-3">
          {PLAN_ORDER.map((planId) => {
            const details = PLAN_DETAILS[planId]
            const isCurrent = subscription?.planId === planId
            const listMinor = TIER_LIST_PRICE_MINOR[planId]
            return (
              <Card
                key={planId}
                className={cn(
                  "relative flex flex-col border-border",
                  isCurrent && "border-primary ring-1 ring-primary/25"
                )}
              >
                {isCurrent ? (
                  <span className="absolute right-4 top-4">
                    <Badge variant="default">Current</Badge>
                  </span>
                ) : null}
                <CardHeader>
                  <CardTitle className="text-lg">{details.title}</CardTitle>
                  <p className="text-sm font-semibold text-primary">{details.capacityLine}</p>
                  <CardDescription>{details.headline}</CardDescription>
                  <p className="pt-2 text-lg font-bold tabular-nums text-foreground">
                    {formatMoneyMinor(listMinor, displayCurrency)}
                    <span className="text-sm font-normal text-muted-foreground"> / year</span>
                  </p>
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {details.bullets.map((line) => (
                      <li key={line} className="flex gap-2">
                        <Check className="mt-0.5 size-4 shrink-0 stroke-[1.5] text-primary" aria-hidden />
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    type="button"
                    variant={isCurrent ? "outline" : "default"}
                    className="w-full"
                    disabled={isCurrent}
                    onClick={handlePrimaryPayAction}
                  >
                    {isCurrent ? "Your plan" : `Select ${details.title}`}
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Invoices
        </h2>
        {invoices.length === 0 ? (
          <Card className="border-border">
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              No invoices yet for this organisation.
            </CardContent>
          </Card>
        ) : (
          <Card className="overflow-hidden border-border">
            <div className="divide-y divide-border">
              {invoices.map((inv) => {
                const invBadge = invoiceStatusBadge(inv.status)
                return (
                  <div
                    key={inv.id}
                    className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-medium text-foreground">{format(new Date(inv.issuedAt), "PPP")}</p>
                      <p className="text-sm text-muted-foreground">{inv.id}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-base font-semibold tabular-nums text-foreground">
                        {formatMoneyMinor(inv.amountMinor, inv.currency)}
                      </span>
                      <Badge variant={invBadge.variant}>{invBadge.label}</Badge>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-brand-link"
                        disabled={inv.status === "void"}
                        onClick={() => handleDownloadInvoice(inv.id)}
                      >
                        Download
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        )}
      </section>
    </div>
  )
}
