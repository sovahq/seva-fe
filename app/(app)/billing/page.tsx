"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { getMockInvoices, getMockSubscription } from "@/data/mock"
import { ROUTES } from "@/routes/routenames"
import { BillingContent } from "@/components/billing"

export default function BillingPage() {
  const router = useRouter()
  const { currentOrganization, currentOrganizationId, currentUser } = useAuth()

  useEffect(() => {
    if (currentUser?.role === "member") {
      router.replace(ROUTES.DASHBOARD)
    }
  }, [currentUser?.role, router])

  if (currentUser?.role === "member") {
    return null
  }

  const orgId = currentOrganizationId ?? ""
  const subscription = orgId ? getMockSubscription(orgId) : null
  const invoices = orgId ? getMockInvoices(orgId) : []

  return (
    <BillingContent
      organization={currentOrganization}
      subscription={subscription}
      invoices={invoices}
    />
  )
}
