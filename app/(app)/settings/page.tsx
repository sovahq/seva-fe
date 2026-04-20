"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "motion/react"
import { useAuth } from "@/context/AuthContext"
import { ROUTES } from "@/routes/routenames"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Field,
  FieldGroup,
  FieldSet,
  FieldLabel,
  FieldDescription,
} from "@/components/ui/field"
import { Switch } from "@/components/ui/switch"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useDues } from "@/context/DuesContext"
import { APP_MODULES } from "@/lib/app-modules"
import type { PrimaryCurrency } from "@/types"
import { cn } from "@/lib/utils"

type SettingsTab = "general" | "modules" | "dues" | "branding" | "data"

const TABS: { id: SettingsTab; label: string }[] = [
  { id: "general", label: "General" },
  { id: "modules", label: "Modules" },
  { id: "dues", label: "Dues & payments" },
  { id: "branding", label: "Branding" },
  { id: "data", label: "Data Management" },
]

export default function SettingsPage() {
  const router = useRouter()
  const { currentOrganization, currentUser } = useAuth()
  const [activeTab, setActiveTab] = useState<SettingsTab>("general")
  const [handoverDialogOpen, setHandoverDialogOpen] = useState(false)

  useEffect(() => {
    if (currentUser?.role === "member") {
      router.replace(ROUTES.DASHBOARD)
    }
  }, [currentUser?.role, router])

  if (currentUser?.role === "member") {
    return null
  }

  return (
    <div className="mx-auto max-w-6xl p-6">
      <h1 className="text-2xl font-semibold" style={{ color: "var(--primary)" }}>
        Settings
      </h1>
      <p className="mt-1 text-sm" style={{ color: "var(--muted-foreground)" }}>
        Manage your organisation settings, branding, and data.{" "}
        <Link
          href={ROUTES.BILLING}
          className="font-medium text-brand-link underline-offset-2 hover:underline"
        >
          Subscription and invoices
        </Link>{" "}
        are on the billing page.
      </p>

      <div className="mt-6 flex flex-col gap-6 sm:flex-row">
        <nav
          className="w-full shrink-0 sm:w-48"
          aria-label="Settings sections"
        >
          <ul className="flex flex-row gap-1 overflow-x-auto pb-2 sm:flex-col sm:overflow-visible sm:pb-0">
            {TABS.map((tab) => (
              <li key={tab.id}>
                <button
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "w-full rounded-xl px-4 py-2.5 text-left text-sm font-medium transition-colors",
                    activeTab === tab.id
                      ? "bg-primary/15"
                      : "hover:bg-primary/10"
                  )}
                  style={{
                    color:
                      activeTab === tab.id
                        ? "var(--primary)"
                        : "var(--muted-foreground)",
                  }}
                >
                  {tab.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="min-w-0 flex-1">
          <AnimatePresence mode="wait" initial={false}>
            {activeTab === "general" && (
              <motion.div
                key="general"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <GeneralTab organization={currentOrganization} />
              </motion.div>
            )}
            {activeTab === "modules" && (
              <motion.div
                key="modules"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <ModulesTab />
              </motion.div>
            )}
            {activeTab === "dues" && (
              <motion.div
                key="dues"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <DuesPaymentsTab organization={currentOrganization} />
              </motion.div>
            )}
            {activeTab === "branding" && (
              <motion.div
                key="branding"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <BrandingTab />
              </motion.div>
            )}
            {activeTab === "data" && (
              <motion.div
                key="data"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <DataManagementTab
                  onHandoverClick={() => setHandoverDialogOpen(true)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AlertDialog open={handoverDialogOpen} onOpenChange={setHandoverDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Initialize Handover Mode</AlertDialogTitle>
            <AlertDialogDescription>
              This will prepare the organisation for a leadership handover. Some
              actions may be restricted until the handover is complete. Are you
              sure you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => setHandoverDialogOpen(false)}
              variant="destructive"
            >
              Initialize Handover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function GeneralTab({
  organization,
}: {
  organization: { fiscalYear?: number; presidentialTheme?: string } | null
}) {
  const [adminYear, setAdminYear] = useState(
    String(organization?.fiscalYear ?? new Date().getFullYear())
  )
  const [theme, setTheme] = useState(organization?.presidentialTheme ?? "")
  const [fiscalStart, setFiscalStart] = useState("")
  const [fiscalEnd, setFiscalEnd] = useState("")

  return (
    <Card>
      <CardHeader>
        <CardTitle style={{ color: "var(--primary)" }}>
          General settings
        </CardTitle>
        <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
          Set the administrative year, president theme, and fiscal period.
        </p>
      </CardHeader>
      <CardContent>
        <FieldSet>
          <FieldGroup>
            <Field>
              <FieldLabel>Administrative year</FieldLabel>
              <FieldDescription>
                The year this term or administration applies to.
              </FieldDescription>
              <Input
                type="number"
                min={2000}
                max={2100}
                value={adminYear}
                onChange={(e) => setAdminYear(e.target.value)}
                placeholder="e.g. 2026"
                className="max-w-[140px]"
              />
            </Field>
            <Field>
              <FieldLabel>President&apos;s theme</FieldLabel>
              <FieldDescription>
                Optional theme or focus for the current president&apos;s term.
              </FieldDescription>
              <Input
                type="text"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                placeholder="e.g. Building bridges"
                maxLength={120}
                className="max-w-md"
              />
            </Field>
            <Field>
              <FieldLabel>Fiscal year start</FieldLabel>
              <FieldDescription>
                First day of your organisation&apos;s fiscal year.
              </FieldDescription>
              <Input
                type="date"
                value={fiscalStart}
                onChange={(e) => setFiscalStart(e.target.value)}
                className="max-w-[180px]"
              />
            </Field>
            <Field>
              <FieldLabel>Fiscal year end</FieldLabel>
              <FieldDescription>
                Last day of your organisation&apos;s fiscal year.
              </FieldDescription>
              <Input
                type="date"
                value={fiscalEnd}
                onChange={(e) => setFiscalEnd(e.target.value)}
                className="max-w-[180px]"
              />
            </Field>
          </FieldGroup>
        </FieldSet>
        <div className="mt-4">
          <Button type="button">Save changes</Button>
        </div>
      </CardContent>
    </Card>
  )
}

function ModulesTab() {
  const [enabled, setEnabled] = useState<Record<string, boolean>>(() => {
    const o: Record<string, boolean> = {}
    APP_MODULES.forEach((m) => (o[m.id] = true))
    return o
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle style={{ color: "var(--primary)" }}>
          Modules
        </CardTitle>
        <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
          Turn modules on or off for your organisation. Disabled modules are
          hidden from the app for everyone.
        </p>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {APP_MODULES.map((mod) => (
            <li
              key={mod.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border/60 bg-card px-4 py-3"
            >
              <div>
                <p className="font-medium" style={{ color: "var(--primary)" }}>
                  {mod.label}
                </p>
                <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                  {mod.id === "governance" && "Policies, bylaws, and governance documents."}
                  {mod.id === "membership" && "Member directory and membership management."}
                  {mod.id === "financial" && "Treasury, dues, and financial reports."}
                  {mod.id === "projects" && "Meetings and project tracking."}
                </p>
              </div>
              <Switch
                checked={enabled[mod.id] ?? true}
                onCheckedChange={(checked) =>
                  setEnabled((prev) => ({ ...prev, [mod.id]: checked }))
                }
              />
            </li>
          ))}
        </ul>
        <div className="mt-4">
          <Button type="button">Save changes</Button>
        </div>
      </CardContent>
    </Card>
  )
}

function DuesPaymentsTab({
  organization,
}: {
  organization: { id: string; fiscalYear: number; primaryCurrency?: PrimaryCurrency } | null
}) {
  const { getDuesConfig, setDuesConfig, getBankDetails, setBankDetails } = useDues()
  const orgId = organization?.id ?? ""
  const year = organization?.fiscalYear ?? new Date().getFullYear()
  const config = getDuesConfig(orgId, year)
  const bank = getBankDetails(orgId)

  const [amount, setAmount] = useState(String(config?.amount ?? 0))
  const [currency, setCurrency] = useState<PrimaryCurrency>(config?.currency ?? "NGN")
  const [accountName, setAccountName] = useState(bank?.accountName ?? "")
  const [bankName, setBankName] = useState(bank?.bankName ?? "")
  const [accountNumber, setAccountNumber] = useState(bank?.accountNumber ?? "")
  const [sortCode, setSortCode] = useState(bank?.sortCode ?? "")
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (config) {
      setAmount(String(config.amount))
      setCurrency(config.currency)
    }
  }, [config?.amount, config?.currency])
  useEffect(() => {
    if (bank) {
      setAccountName(bank.accountName)
      setBankName(bank.bankName)
      setAccountNumber(bank.accountNumber)
      setSortCode(bank.sortCode ?? "")
    }
  }, [bank?.organizationId])

  function handleSave() {
    const num = Number.parseInt(amount, 10)
    if (!Number.isNaN(num) && num >= 0 && orgId) {
      setDuesConfig(orgId, year, num, currency)
    }
    if (orgId && accountName.trim() && bankName.trim() && accountNumber.trim()) {
      setBankDetails(orgId, {
        accountName: accountName.trim(),
        bankName: bankName.trim(),
        accountNumber: accountNumber.trim(),
        sortCode: sortCode.trim() || undefined,
      })
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle style={{ color: "var(--primary)" }}>
          Dues &amp; payments
        </CardTitle>
        <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
          Set the dues amount for the year and the Local Organisation bank details so members know where to pay.
        </p>
      </CardHeader>
      <CardContent>
        <FieldSet>
          <FieldGroup>
            <Field>
              <FieldLabel>Dues for the year ({year})</FieldLabel>
              <FieldDescription>
                Amount and currency members will pay for this administrative year.
              </FieldDescription>
              <div className="flex flex-wrap items-center gap-3">
                <Input
                  type="number"
                  min={0}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="max-w-[140px]"
                />
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as PrimaryCurrency)}
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="NGN">NGN</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
            </Field>
            <Field>
              <FieldLabel>Local Organisation bank details</FieldLabel>
              <FieldDescription>
                Members will pay dues into this account. Show account name, bank name, and account number.
              </FieldDescription>
              <div className="space-y-3">
                <Input
                  type="text"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  placeholder="Account name"
                  className="max-w-md"
                />
                <Input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="Bank name"
                  className="max-w-md"
                />
                <Input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="Account number"
                  className="max-w-md"
                />
                <Input
                  type="text"
                  value={sortCode}
                  onChange={(e) => setSortCode(e.target.value)}
                  placeholder="Sort code / bank code (optional)"
                  className="max-w-md"
                />
              </div>
            </Field>
          </FieldGroup>
        </FieldSet>
        <div className="mt-4">
          <Button type="button" onClick={handleSave}>
            {saved ? "Saved" : "Save changes"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function BrandingTab() {
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [letterheadPreview, setLetterheadPreview] = useState<string | null>(null)

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setLogoPreview(url)
    }
  }

  function handleLetterheadChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setLetterheadPreview(url)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle style={{ color: "var(--primary)" }}>
          Branding
        </CardTitle>
        <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
          Upload your chapter logo and letterhead. These appear on exports and
          printed materials.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <FieldSet>
          <FieldGroup>
            <Field>
              <FieldLabel>Chapter logo</FieldLabel>
              <FieldDescription>
                Used on dashboards and exported documents. Prefer a square or
                transparent image.
              </FieldDescription>
              <div className="flex flex-wrap items-start gap-4">
                {logoPreview && (
                  <div
                    className="h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-border/60 bg-muted/30"
                    style={{ aspectRatio: "1" }}
                  >
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className="h-full w-full object-contain"
                    />
                  </div>
                )}
                <div className="flex flex-col gap-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="max-w-xs cursor-pointer"
                  />
                  {logoPreview && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setLogoPreview(null)}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              </div>
            </Field>
            <Field>
              <FieldLabel>Letterhead</FieldLabel>
              <FieldDescription>
                Image or PDF used at the top of official letters and reports.
              </FieldDescription>
              <div className="flex flex-wrap items-start gap-4">
                {letterheadPreview && (
                  <div
                    className="h-24 min-w-[120px] shrink-0 overflow-hidden rounded-xl border border-border/60 bg-muted/30"
                  >
                    <img
                      src={letterheadPreview}
                      alt="Letterhead preview"
                      className="h-full w-full object-contain"
                    />
                  </div>
                )}
                <div className="flex flex-col gap-2">
                  <Input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleLetterheadChange}
                    className="max-w-xs cursor-pointer"
                  />
                  {letterheadPreview && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setLetterheadPreview(null)}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              </div>
            </Field>
          </FieldGroup>
        </FieldSet>
        <div className="mt-4">
          <Button type="button">Save changes</Button>
        </div>
      </CardContent>
    </Card>
  )
}

function DataManagementTab({
  onHandoverClick,
}: {
  onHandoverClick: () => void
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle style={{ color: "var(--primary)" }}>
          Data Management
        </CardTitle>
        <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
          Export archives and prepare for leadership handover.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-2 rounded-xl border border-border/60 bg-card px-4 py-3">
          <p className="font-medium" style={{ color: "var(--primary)" }}>
            Export year archive
          </p>
          <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
            Download a full archive of data for the current year. Use this for
            backups or records.
          </p>
          <Button type="button" variant="outline" size="default">
            Export Year Archive
          </Button>
        </div>
        <div className="flex flex-col gap-2 rounded-xl border border-border/60 bg-card px-4 py-3">
          <p className="font-medium" style={{ color: "var(--primary)" }}>
            Initialize Handover Mode
          </p>
          <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
            Start the process for handing over to new leadership. You will be
            asked to confirm before any changes take effect.
          </p>
          <Button
            type="button"
            variant="outline"
            size="default"
            onClick={onHandoverClick}
          >
            Initialize Handover Mode
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
