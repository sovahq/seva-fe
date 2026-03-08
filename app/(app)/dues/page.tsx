"use client"

import { useState, useRef } from "react"
import { useAuth } from "@/context/AuthContext"
import { useDues } from "@/context/DuesContext"
import { mockMembers } from "@/data/mock"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ROUTES } from "@/routes/routenames"
import Link from "next/link"
import type { DuesSubmission, PrimaryCurrency } from "@/types"

function formatCurrency(amount: number, currency: PrimaryCurrency = "NGN"): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  }).format(amount)
}

export default function DuesPage() {
  const { currentUser, currentOrganizationId, currentOrganization } = useAuth()
  const {
    memberDues,
    duesSubmissions,
    addSubmission,
    getDuesConfig,
    getBankDetails,
  } = useDues()

  const orgId = currentOrganizationId ?? currentUser?.organizationId ?? ""
  const adminYear = currentOrganization?.fiscalYear ?? new Date().getFullYear()

  const member = currentUser
    ? mockMembers.find(
        (m) =>
          m.organizationId === orgId &&
          m.email?.toLowerCase() === currentUser.email?.toLowerCase()
      )
    : null

  const config = getDuesConfig(orgId, adminYear)
  const bank = getBankDetails(orgId)
  const myDuesEntry = member
    ? memberDues.find(
        (d) =>
          d.organizationId === orgId &&
          d.administrativeYear === adminYear &&
          d.memberId === member.id
      )
    : null
  const pendingSubmission = member
    ? duesSubmissions.find(
        (s) =>
          s.organizationId === orgId &&
          s.administrativeYear === adminYear &&
          s.memberId === member.id &&
          s.status === "pending_confirmation"
      )
    : null

  const [receiptFile, setReceiptFile] = useState<File | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isPaid = myDuesEntry?.status === "paid"

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    setReceiptFile(file ?? null)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!member || !config || pendingSubmission || isPaid) return
    const receiptUrl =
      receiptFile &&
      (() => {
        try {
          return URL.createObjectURL(receiptFile)
        } catch {
          return null
        }
      })()
    const submission: DuesSubmission = {
      id: `sub-${member.id}-${adminYear}-${Date.now()}`,
      organizationId: orgId,
      administrativeYear: adminYear,
      memberId: member.id,
      memberName: member.name,
      amount: config.amount,
      currency: config.currency,
      receiptUrl: receiptUrl ?? null,
      status: "pending_confirmation",
      submittedAt: new Date().toISOString(),
      confirmedAt: null,
      confirmedBy: null,
    }
    addSubmission(submission)
    setReceiptFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
    setSubmitted(true)
  }

  if (!currentUser) return null

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="text-2xl font-semibold" style={{ color: "var(--primary)" }}>
        Pay Dues
      </h1>
      <p className="mt-1 text-sm" style={{ color: "var(--muted-foreground)" }}>
        View your dues status and submit payment evidence for {adminYear}.
      </p>

      {!member && (
        <Card className="mt-6">
          <CardContent className="py-6 text-center text-sm" style={{ color: "var(--muted-foreground)" }}>
            You are not linked to a member record for this organisation. Contact your admin.
          </CardContent>
        </Card>
      )}

      {member && !config && (
        <Card className="mt-6">
          <CardContent className="py-6 text-center text-sm" style={{ color: "var(--muted-foreground)" }}>
            Dues for this year have not been configured yet. Check back later or contact your admin.
          </CardContent>
        </Card>
      )}

      {member && config && (
        <>
          <Card className="mt-6">
            <CardHeader>
              <CardTitle style={{ color: "var(--primary)" }}>
                Dues for {adminYear}
              </CardTitle>
              <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                {formatCurrency(config.amount, config.currency)} per member for the administrative year.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {isPaid && (
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="default" className="text-sm">
                    Dues paid for {adminYear}
                  </Badge>
                  <span className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                    Thank you. Your payment has been confirmed by Finance.
                  </span>
                </div>
              )}
              {!isPaid && pendingSubmission && (
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="text-sm">
                    Pending confirmation
                  </Badge>
                  <span className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                    Your receipt has been submitted. The Director of Finance will confirm your payment.
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {bank && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle style={{ color: "var(--primary)" }}>
                  Local Organisation bank details
                </CardTitle>
                <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                  Pay the dues amount to this account, then upload your receipt below.
                </p>
              </CardHeader>
              <CardContent className="space-y-1 font-mono text-sm">
                <p><span className="font-sans font-medium" style={{ color: "var(--muted-foreground)" }}>Account name:</span> {bank.accountName}</p>
                <p><span className="font-sans font-medium" style={{ color: "var(--muted-foreground)" }}>Bank:</span> {bank.bankName}</p>
                <p><span className="font-sans font-medium" style={{ color: "var(--muted-foreground)" }}>Account number:</span> {bank.accountNumber}</p>
                {bank.sortCode && (
                  <p><span className="font-sans font-medium" style={{ color: "var(--muted-foreground)" }}>Sort code:</span> {bank.sortCode}</p>
                )}
              </CardContent>
            </Card>
          )}

          {!isPaid && !pendingSubmission && config && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle style={{ color: "var(--primary)" }}>
                  I have paid
                </CardTitle>
                <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                  After paying via bank transfer, upload your payment receipt (image or PDF). Finance will confirm your payment.
                </p>
              </CardHeader>
              <CardContent>
                {submitted ? (
                  <p className="text-sm font-medium" style={{ color: "var(--primary)" }}>
                    Submitted. Finance will confirm your payment.
                  </p>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium" style={{ color: "var(--primary)" }}>
                        Payment receipt
                      </label>
                      <Input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleFileChange}
                        className="max-w-md cursor-pointer"
                      />
                      {receiptFile && (
                        <p className="mt-1 text-xs" style={{ color: "var(--muted-foreground)" }}>
                          {receiptFile.name}
                        </p>
                      )}
                    </div>
                    <Button type="submit" disabled={!receiptFile}>
                      Submit receipt
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}

      <p className="mt-6 text-sm">
        <Link href={ROUTES.DASHBOARD} className="underline" style={{ color: "var(--primary)" }}>
          Back to Dashboard
        </Link>
      </p>
    </div>
  )
}
