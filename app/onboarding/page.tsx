"use client"

import { AnimatePresence, motion } from "framer-motion"
import { zodResolver } from "@hookform/resolvers/zod"
import { Building2, ArrowRight, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SevaLogo } from "@/components/branding"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAuth } from "@/context/AuthContext"
import { ROUTES } from "@/routes/routenames"
import type { Organization, PrimaryCurrency } from "@/types"

const CURRENCIES: { value: PrimaryCurrency; label: string }[] = [
  { value: "NGN", label: "NGN (Naira)" },
  { value: "USD", label: "USD (US Dollar)" },
  { value: "EUR", label: "EUR (Euro)" },
]

const onboardingSchema = z.object({
  name: z
    .string()
    .min(2, "Organization name must be at least 2 characters.")
    .max(80, "Organization name must be at most 80 characters."),
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters.")
    .max(40, "Slug must be at most 40 characters.")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Lowercase letters, numbers, and hyphens only (e.g. my-org)."
    ),
  fiscalYear: z
    .number({ message: "Enter a valid year." })
    .int()
    .min(2000, "Year must be 2000 or later.")
    .max(2100, "Year must be 2100 or earlier."),
  presidentialTheme: z.string().max(120, "Theme must be at most 120 characters.").optional(),
  presidentName: z
    .string()
    .min(2, "President's name must be at least 2 characters.")
    .max(80, "President's name must be at most 80 characters."),
  presidentEmail: z.string().email("Enter a valid email address."),
  primaryCurrency: z.enum(["NGN", "USD", "EUR"], { message: "Select a currency." }),
})

type OnboardingFormValues = z.infer<typeof onboardingSchema>

const STEPS = [
  { title: "Organisation", fields: ["name", "slug"] as const },
  { title: "Governance", fields: ["fiscalYear", "presidentialTheme"] as const },
  { title: "Administrative", fields: ["presidentName", "presidentEmail"] as const },
  { title: "Financial", fields: ["primaryCurrency"] as const },
] as const

const TOTAL_STEPS = STEPS.length

function slugFromName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
}

export default function OnboardingPage() {
  const router = useRouter()
  const { addOrganization, setOrganization } = useAuth()
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(0)

  const form = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      name: "",
      slug: "",
      fiscalYear: 2026,
      presidentialTheme: "",
      presidentName: "",
      presidentEmail: "",
      primaryCurrency: "NGN",
    },
  })

  const watchedName = form.watch("name")
  const slugTouched = form.formState.dirtyFields.slug

  useEffect(() => {
    if (!slugTouched) {
      form.setValue("slug", slugFromName(watchedName), {
        shouldValidate: false,
        shouldDirty: false,
      })
    }
  }, [watchedName, slugTouched, form])

  async function handleNext() {
    const fields = STEPS[step].fields
    const valid = await form.trigger(fields as unknown as (keyof OnboardingFormValues)[])
    if (valid) {
      setDirection(1)
      setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1))
    }
  }

  function handleBack() {
    setDirection(-1)
    setStep((s) => Math.max(s - 1, 0))
  }

  function onSubmit(data: OnboardingFormValues) {
    const id = `org-${data.slug}`
    const newOrg: Organization = {
      id,
      name: data.name.trim(),
      slug: data.slug.trim(),
      fiscalYear: data.fiscalYear,
      presidentialTheme: data.presidentialTheme?.trim() || undefined,
      presidentName: data.presidentName.trim(),
      presidentEmail: data.presidentEmail.trim(),
      primaryCurrency: data.primaryCurrency,
    }
    addOrganization(newOrg)
    setOrganization(id)
    router.replace(
      `${ROUTES.LOGIN}?fromOnboarding=true&organizationId=${encodeURIComponent(id)}&from=/${encodeURIComponent(data.slug)}`
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-surface md:flex-row">
      {/* Left: brand panel */}
      <aside className="relative flex shrink-0 flex-col justify-between bg-primary px-8 py-10 text-white md:w-[44%] md:px-12 md:py-14 lg:w-[42%] lg:px-16">
        <div className="absolute inset-0 overflow-hidden opacity-[0.07]">
          <div className="absolute -left-20 -top-20 h-80 w-80 rounded-full bg-white" />
          <div className="absolute bottom-10 right-0 h-60 w-60 rounded-full bg-white" />
        </div>
        <div className="relative">
          <SevaLogo
            asLink
            to={ROUTES.LOGIN}
            size="sm"
            className="text-white/95 hover:text-white"
          />
          <p className="mt-1 text-xs text-white/60">Set up your LO in one place</p>
        </div>
        <div className="relative mt-12 md:mt-0">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
            <Building2 className="h-6 w-6 text-white" strokeWidth={1.75} />
          </div>
          <h1 className="mt-6 text-2xl font-semibold leading-tight tracking-tight text-white md:text-3xl lg:text-[1.75rem]">
            Create your Local Organisation
          </h1>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/75">
            Set up your LO to manage governance, members, meetings, and finances in one place.
          </p>
        </div>
        <div className="relative mt-8 hidden md:block">
          <p className="text-xs text-white/50">
            Step {step + 1} of {TOTAL_STEPS}
          </p>
          <ul className="mt-2 space-y-1 text-xs text-white/70">
            {STEPS.map((s, i) => (
              <li
                key={s.title}
                className={
                  i === step ? "font-medium text-white" : i < step ? "text-white/60" : "text-white/40"
                }
              >
                {i + 1}. {s.title}
              </li>
            ))}
          </ul>
        </div>
      </aside>

      <main className="flex flex-1 flex-col justify-center px-6 py-12 md:px-12 lg:px-20">
        <div className="mx-auto w-full max-w-[400px]">
          <p
            className="text-xs font-medium uppercase tracking-wider md:hidden"
            style={{ color: "var(--muted-foreground)" }}
          >
            Organisation setup
          </p>
          <form
            id="onboarding-form"
            onSubmit={form.handleSubmit(onSubmit)}
            noValidate
            className="mt-8 md:mt-0"
          >
            <div className="min-h-[280px] overflow-hidden">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: direction >= 0 ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: direction >= 0 ? -20 : 20 }}
                  transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="flex flex-col gap-6"
                >
              {step === 0 && (
                <>
                  <Controller
                    name="name"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <div className="grid gap-1.5">
                        <Label
                          htmlFor="onboarding-name"
                          style={{ color: "var(--foreground)" }}
                        >
                          Organisation name
                        </Label>
                        <Input
                          {...field}
                          id="onboarding-name"
                          placeholder="e.g. JCI Eko"
                          autoComplete="organization"
                          aria-invalid={fieldState.invalid}
                          className="h-11 w-full px-3"
                        />
                        {fieldState.invalid && fieldState.error?.message ? (
                          <p
                            className="text-sm font-medium"
                            style={{ color: "var(--destructive)" }}
                            role="alert"
                          >
                            {fieldState.error.message}
                          </p>
                        ) : null}
                      </div>
                    )}
                  />
                  <Controller
                    name="slug"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <div className="grid gap-1.5">
                        <Label
                          htmlFor="onboarding-slug"
                          style={{ color: "var(--foreground)" }}
                        >
                          URL slug
                        </Label>
                        <Input
                          {...field}
                          id="onboarding-slug"
                          placeholder="e.g. jci-eko"
                          autoComplete="off"
                          aria-invalid={fieldState.invalid}
                          className="h-11 w-full px-3"
                        />
                        {fieldState.invalid && fieldState.error?.message ? (
                          <p
                            className="text-sm font-medium"
                            style={{ color: "var(--destructive)" }}
                            role="alert"
                          >
                            {fieldState.error.message}
                          </p>
                        ) : (
                          <p
                            className="text-xs"
                            style={{ color: "var(--muted-foreground)" }}
                          >
                            Lowercase letters, numbers, hyphens. Used in links.
                          </p>
                        )}
                      </div>
                    )}
                  />
                </>
              )}

              {step === 1 && (
                <>
                  <Controller
                    name="fiscalYear"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <div className="grid gap-1.5">
                        <Label
                          htmlFor="onboarding-fiscalYear"
                          style={{ color: "var(--foreground)" }}
                        >
                          Current fiscal year
                        </Label>
                        <Input
                          id="onboarding-fiscalYear"
                          type="number"
                          min={2000}
                          max={2100}
                          value={field.value}
                          onChange={(e) => {
                            const n = e.target.valueAsNumber
                            field.onChange(Number.isFinite(n) ? n : 2026)
                          }}
                          onBlur={field.onBlur}
                          aria-invalid={fieldState.invalid}
                          className="h-11 w-full px-3"
                        />
                        {fieldState.invalid && fieldState.error?.message ? (
                          <p
                            className="text-sm font-medium"
                            style={{ color: "var(--destructive)" }}
                            role="alert"
                          >
                            {fieldState.error.message}
                          </p>
                        ) : null}
                      </div>
                    )}
                  />
                  <Controller
                    name="presidentialTheme"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <div className="grid gap-1.5">
                        <Label
                          htmlFor="onboarding-presidentialTheme"
                          style={{ color: "var(--foreground)" }}
                        >
                          Presidential theme
                        </Label>
                        <Input
                          {...field}
                          id="onboarding-presidentialTheme"
                          placeholder="e.g. The Year of Impact"
                          autoComplete="off"
                          aria-invalid={fieldState.invalid}
                          className="h-11 w-full px-3"
                        />
                        {fieldState.invalid && fieldState.error?.message ? (
                          <p
                            className="text-sm font-medium"
                            style={{ color: "var(--destructive)" }}
                            role="alert"
                          >
                            {fieldState.error.message}
                          </p>
                        ) : null}
                      </div>
                    )}
                  />
                </>
              )}

              {step === 2 && (
                <>
                  <p
                    className="text-xs"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    Current president will be designated as the primary owner of the workspace.
                  </p>
                  <Controller
                    name="presidentName"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <div className="grid gap-1.5">
                        <Label
                          htmlFor="onboarding-presidentName"
                          style={{ color: "var(--foreground)" }}
                        >
                          Current president&apos;s name
                        </Label>
                        <Input
                          {...field}
                          id="onboarding-presidentName"
                          placeholder="e.g. Jane Doe"
                          autoComplete="name"
                          aria-invalid={fieldState.invalid}
                          className="h-11 w-full px-3"
                        />
                        {fieldState.invalid && fieldState.error?.message ? (
                          <p
                            className="text-sm font-medium"
                            style={{ color: "var(--destructive)" }}
                            role="alert"
                          >
                            {fieldState.error.message}
                          </p>
                        ) : null}
                      </div>
                    )}
                  />
                  <Controller
                    name="presidentEmail"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <div className="grid gap-1.5">
                        <Label
                          htmlFor="onboarding-presidentEmail"
                          style={{ color: "var(--foreground)" }}
                        >
                          President&apos;s email
                        </Label>
                        <Input
                          {...field}
                          id="onboarding-presidentEmail"
                          type="email"
                          placeholder="e.g. president@jcieko.org"
                          autoComplete="email"
                          aria-invalid={fieldState.invalid}
                          className="h-11 w-full px-3"
                        />
                        {fieldState.invalid && fieldState.error?.message ? (
                          <p
                            className="text-sm font-medium"
                            style={{ color: "var(--destructive)" }}
                            role="alert"
                          >
                            {fieldState.error.message}
                          </p>
                        ) : null}
                      </div>
                    )}
                  />
                </>
              )}

              {step === 3 && (
                <>
                  <Controller
                    name="primaryCurrency"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <div className="grid gap-1.5">
                        <Label
                          htmlFor="onboarding-primaryCurrency"
                          style={{ color: "var(--foreground)" }}
                        >
                          Primary currency
                        </Label>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger
                            id="onboarding-primaryCurrency"
                            aria-invalid={fieldState.invalid}
                            className="h-11 w-full border-[var(--primary)]/25 bg-card px-3"
                            style={{ color: "var(--primary)" }}
                          >
                            <SelectValue placeholder="Select currency" />
                          </SelectTrigger>
                          <SelectContent className="border-[var(--primary)]/15 bg-card">
                            {CURRENCIES.map((c) => (
                              <SelectItem
                                key={c.value}
                                value={c.value}
                                style={{ color: "var(--primary)" }}
                              >
                                {c.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {fieldState.invalid && fieldState.error?.message ? (
                          <p
                            className="text-sm font-medium"
                            style={{ color: "var(--destructive)" }}
                            role="alert"
                          >
                            {fieldState.error.message}
                          </p>
                        ) : null}
                      </div>
                    )}
                  />
                </>
              )}
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="mt-8 flex gap-3">
              {step > 0 ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  className="h-11 border-[var(--border)] hover:bg-[var(--accent)]"
                  style={{ color: "var(--foreground)", borderColor: "var(--border)" }}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" strokeWidth={2} />
                  Back
                </Button>
              ) : null}
              {step < TOTAL_STEPS - 1 ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  className="h-11 flex-1 font-medium"
                  style={{
                    backgroundColor: "var(--primary)",
                    color: "var(--primary-foreground)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "var(--primary-hover)"
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "var(--primary)"
                  }}
                >
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" strokeWidth={2} />
                </Button>
              ) : (
                <Button
                  type="submit"
                  form="onboarding-form"
                  className="h-11 flex-1 font-medium"
                  style={{
                    backgroundColor: "var(--primary)",
                    color: "var(--primary-foreground)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "var(--primary-hover)"
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "var(--primary)"
                  }}
                >
                  Create organisation
                  <ArrowRight className="ml-2 h-4 w-4" strokeWidth={2} />
                </Button>
              )}
            </div>
          </form>

          <p
            className="mt-10 text-center text-sm"
            style={{ color: "var(--muted-foreground)" }}
          >
            Already have an account?{" "}
            <Link
              href={ROUTES.LOGIN}
              className="font-medium underline underline-offset-2 hover:opacity-90"
              style={{ color: "var(--primary)" }}
            >
              Log in
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}
