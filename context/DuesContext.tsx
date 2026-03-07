"use client"

import * as React from "react"
import {
  mockMemberDues,
  mockDuesSubmissions,
  mockDuesConfigs,
  mockBankDetails,
} from "@/data/mock"
import type {
  MemberDuesEntry,
  DuesSubmission,
  DuesConfig,
  OrganizationBankDetails,
  PrimaryCurrency,
} from "@/types"

type DuesContextValue = {
  memberDues: MemberDuesEntry[]
  duesSubmissions: DuesSubmission[]
  addSubmission: (submission: DuesSubmission) => void
  confirmSubmission: (submissionId: string, userId: string) => void
  getDuesConfig: (organizationId: string, year: number) => DuesConfig | null
  setDuesConfig: (organizationId: string, year: number, amount: number, currency: PrimaryCurrency) => void
  getBankDetails: (organizationId: string) => OrganizationBankDetails | null
  setBankDetails: (organizationId: string, details: Omit<OrganizationBankDetails, "organizationId">) => void
}

const DuesContext = React.createContext<DuesContextValue | null>(null)

export function DuesProvider({ children }: { children: React.ReactNode }) {
  const [memberDues, setMemberDues] = React.useState<MemberDuesEntry[]>(() => [...mockMemberDues])
  const [duesSubmissions, setDuesSubmissions] = React.useState<DuesSubmission[]>(() => [...mockDuesSubmissions])
  const [duesConfigs, setDuesConfigs] = React.useState<DuesConfig[]>(() => [...mockDuesConfigs])
  const [bankDetailsList, setBankDetailsList] = React.useState<OrganizationBankDetails[]>(() => [...mockBankDetails])

  const addSubmission = React.useCallback((submission: DuesSubmission) => {
    setDuesSubmissions((prev) => [...prev, submission])
  }, [])

  const confirmSubmission = React.useCallback((submissionId: string, userId: string) => {
    const now = new Date().toISOString()
    setDuesSubmissions((prev) => {
      const sub = prev.find((s) => s.id === submissionId)
      if (!sub || sub.status !== "pending_confirmation") return prev
      setMemberDues((duesPrev) => {
        const existing = duesPrev.find(
          (d) =>
            d.organizationId === sub.organizationId &&
            d.administrativeYear === sub.administrativeYear &&
            d.memberId === sub.memberId
        )
        const entry: MemberDuesEntry = existing
          ? {
              ...existing,
              status: "paid",
              amountPaid: existing.amountOwed,
              paymentHistory: [
                ...existing.paymentHistory,
                { at: now, amount: sub.amount, note: "Confirmed by finance" },
              ],
            }
          : {
              id: `dues-${sub.memberId}-${sub.administrativeYear}`,
              organizationId: sub.organizationId,
              administrativeYear: sub.administrativeYear,
              memberId: sub.memberId,
              memberName: sub.memberName,
              status: "paid",
              amountOwed: sub.amount,
              amountPaid: sub.amount,
              currency: sub.currency,
              paymentHistory: [{ at: now, amount: sub.amount, note: "Confirmed by finance" }],
            }
        if (existing) {
          return duesPrev.map((d) => (d.id === existing.id ? entry : d))
        }
        return [...duesPrev, entry]
      })
      return prev.map((s) =>
        s.id === submissionId
          ? { ...s, status: "confirmed" as const, confirmedAt: now, confirmedBy: userId }
          : s
      )
    })
  }, [])

  const getDuesConfig = React.useCallback(
    (organizationId: string, year: number) => {
      return duesConfigs.find((c) => c.organizationId === organizationId && c.administrativeYear === year) ?? null
    },
    [duesConfigs]
  )

  const setDuesConfig = React.useCallback(
    (organizationId: string, year: number, amount: number, currency: PrimaryCurrency) => {
      setDuesConfigs((prev) => {
        const rest = prev.filter(
          (c) => !(c.organizationId === organizationId && c.administrativeYear === year)
        )
        return [...rest, { organizationId, administrativeYear: year, amount, currency }]
      })
    },
    []
  )

  const getBankDetails = React.useCallback(
    (organizationId: string) => {
      return bankDetailsList.find((b) => b.organizationId === organizationId) ?? null
    },
    [bankDetailsList]
  )

  const setBankDetails = React.useCallback(
    (organizationId: string, details: Omit<OrganizationBankDetails, "organizationId">) => {
      setBankDetailsList((prev) => {
        const rest = prev.filter((b) => b.organizationId !== organizationId)
        return [...rest, { ...details, organizationId }]
      })
    },
    []
  )

  const value: DuesContextValue = {
    memberDues,
    duesSubmissions,
    addSubmission,
    confirmSubmission,
    getDuesConfig,
    setDuesConfig,
    getBankDetails,
    setBankDetails,
  }

  return <DuesContext.Provider value={value}>{children}</DuesContext.Provider>
}

export function useDues() {
  const ctx = React.useContext(DuesContext)
  if (!ctx) throw new Error("useDues must be used within DuesProvider")
  return ctx
}
