"use client"

import { useState, useMemo, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useAuth } from "@/context/AuthContext"
import { useEvents } from "@/context/EventsContext"
import { generateCheckInCode } from "@/lib/check-in-code"
import { ROUTES } from "@/routes/routenames"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Field,
  FieldGroup,
  FieldSet,
  FieldLabel,
  FieldDescription,
} from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { ArrowLeft, CalendarPlus, ChevronDown, Clock, Save } from "lucide-react"

const meetingFormSchema = z
  .object({
    name: z.string().min(1, "Enter the meeting name.").max(120, "Name must be at most 120 characters."),
    date: z.string().min(1, "Select the date."),
    time: z.string().min(1, "Enter the time."),
    locationType: z.enum(["virtual", "physical"], { message: "Select location type." }),
    meetingLink: z.string().url("Enter a valid URL.").optional().or(z.literal("")),
    address: z.string().max(300).optional(),
    codeExpiresDate: z.string().min(1, "Select expiration date."),
    codeExpiresTime: z.string().min(1, "Enter expiration time."),
  })
  .refine(
    (data) => {
      if (data.locationType === "virtual") return !!data.meetingLink?.trim()
      return true
    },
    { message: "Enter the meeting link for virtual meetings.", path: ["meetingLink"] }
  )
  .refine(
    (data) => {
      if (data.locationType === "physical") return !!data.address?.trim()
      return true
    },
    { message: "Enter the address for physical meetings.", path: ["address"] }
  )

type MeetingFormValues = z.infer<typeof meetingFormSchema>

function parseEventToForm(evt: {
  name: string
  date: string
  startTime?: string
  locationType?: "virtual" | "physical"
  meetingLink?: string
  address?: string
  checkInCodeExpiresAt?: string
}): MeetingFormValues {
  const date = evt.date
  let time = "10:00"
  if (evt.startTime) {
    const d = new Date(evt.startTime)
    time = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`
  }
  let codeExpiresDate = date
  let codeExpiresTime = "23:59"
  if (evt.checkInCodeExpiresAt) {
    const d = new Date(evt.checkInCodeExpiresAt)
    codeExpiresDate = d.toISOString().slice(0, 10)
    codeExpiresTime = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`
  }
  return {
    name: evt.name,
    date,
    time,
    locationType: evt.locationType ?? "physical",
    meetingLink: evt.meetingLink ?? "",
    address: evt.address ?? "",
    codeExpiresDate,
    codeExpiresTime,
  }
}

export default function EditMeetingPage() {
  const params = useParams()
  const router = useRouter()
  const id = typeof params.id === "string" ? params.id : ""
  const { currentOrganizationId } = useAuth()
  const { events, updateEvent } = useEvents()

  const evt = useMemo(() => events.find((e) => e.id === id), [events, id])
  const [checkInCode, setCheckInCode] = useState(() => evt?.checkInCode ?? generateCheckInCode())
  const [flierUrl, setFlierUrl] = useState<string | null>(evt?.flierUrl ?? null)

  useEffect(() => {
    if (evt?.checkInCode) setCheckInCode(evt.checkInCode)
    if (evt?.flierUrl) setFlierUrl(evt.flierUrl)
  }, [evt?.id])

  const form = useForm<MeetingFormValues>({
    resolver: zodResolver(meetingFormSchema),
    values: evt ? parseEventToForm(evt) : undefined,
    defaultValues: {
      name: "",
      date: "",
      time: "10:00",
      locationType: "physical",
      meetingLink: "",
      address: "",
      codeExpiresDate: "",
      codeExpiresTime: "23:59",
    },
  })

  const locationType = form.watch("locationType")

  function handleFlierChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) setFlierUrl(URL.createObjectURL(file))
    else setFlierUrl(evt?.flierUrl ?? null)
  }

  function handleRegenerateCode() {
    const newCode = generateCheckInCode()
    setCheckInCode(newCode)
  }

  function onSubmit(data: MeetingFormValues) {
    if (!evt) return
    const startTime = `${data.date}T${data.time}:00`
    const codeExpiresAt = `${data.codeExpiresDate}T${data.codeExpiresTime}:00`

    updateEvent(evt.id, {
      name: data.name.trim(),
      date: data.date,
      startTime,
      locationType: data.locationType,
      meetingLink: data.locationType === "virtual" ? data.meetingLink?.trim() : undefined,
      address: data.locationType === "physical" ? data.address?.trim() : undefined,
      flierUrl: flierUrl ?? undefined,
      checkInCode,
      checkInCodeExpiresAt: codeExpiresAt,
    })
    router.push(`${ROUTES.EVENTS}/${evt.id}`)
  }

  if (!evt) {
    return (
      <div className="mx-auto max-w-2xl p-6">
        <p style={{ color: "var(--muted-foreground)" }}>Event not found.</p>
        <Button variant="link" asChild className="mt-2 gap-1.5 p-0">
          <Link href={ROUTES.EVENTS}>
            <ArrowLeft className="size-4 shrink-0" />
            Back to events
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl p-6">
      <div className="mb-6">
        <Link
          href={`${ROUTES.EVENTS}/${evt.id}`}
          className="inline-flex items-center gap-1.5 text-sm font-medium hover:underline"
          style={{ color: "var(--muted-foreground)" }}
        >
          <ArrowLeft className="size-4 shrink-0" />
          Back to meeting
        </Link>
      </div>
      <h1 className="text-2xl font-semibold" style={{ color: "var(--primary)" }}>
        Edit meeting
      </h1>
      <p className="mt-1 text-sm" style={{ color: "var(--muted-foreground)" }}>
        Update details, location, flier, or check-in code expiration.
      </p>

      <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle style={{ color: "var(--primary)" }}>Details</CardTitle>
          </CardHeader>
          <CardContent>
            <FieldSet>
              <FieldGroup>
                <Field>
                  <FieldLabel>Meeting name</FieldLabel>
                  <Input
                    {...form.register("name")}
                    placeholder="e.g. March Chapter Meeting"
                    className="max-w-md"
                  />
                  {form.formState.errors.name && (
                    <p className="text-sm text-destructive mt-1">{form.formState.errors.name.message}</p>
                  )}
                </Field>
                <Field>
                  <FieldLabel>Date</FieldLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "max-w-[240px] justify-start text-left font-normal",
                          !form.watch("date") && "text-muted-foreground"
                        )}
                      >
                        <CalendarPlus className="mr-2 size-4 shrink-0" />
                        {form.watch("date")
                          ? format(new Date(form.watch("date") + "T12:00:00"), "PPP")
                          : "Pick a date"}
                        <ChevronDown className="ml-auto size-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={
                          form.watch("date")
                            ? new Date(form.watch("date") + "T12:00:00")
                            : undefined
                        }
                        onSelect={(date) =>
                          date && form.setValue("date", format(date, "yyyy-MM-dd"), { shouldValidate: true })
                        }
                      />
                    </PopoverContent>
                  </Popover>
                  {form.formState.errors.date && (
                    <p className="text-sm text-destructive mt-1">{form.formState.errors.date.message}</p>
                  )}
                </Field>
                <Field>
                  <FieldLabel>Time</FieldLabel>
                  <div className="relative max-w-[140px]">
                    <Clock className="absolute left-3 top-1/2 size-4 shrink-0 -translate-y-1/2 opacity-50" />
                    <Input
                      type="time"
                      {...form.register("time")}
                      className="pl-9 [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                    />
                  </div>
                  {form.formState.errors.time && (
                    <p className="text-sm text-destructive mt-1">{form.formState.errors.time.message}</p>
                  )}
                </Field>
              </FieldGroup>
            </FieldSet>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle style={{ color: "var(--primary)" }}>Location</CardTitle>
          </CardHeader>
          <CardContent>
            <FieldSet>
              <FieldGroup>
                <Field>
                  <FieldLabel>Location type</FieldLabel>
                  <Select
                    value={locationType}
                    onValueChange={(v) => form.setValue("locationType", v as "virtual" | "physical")}
                  >
                    <SelectTrigger className="max-w-[200px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="virtual">Virtual</SelectItem>
                      <SelectItem value="physical">Physical</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                {locationType === "virtual" && (
                  <Field>
                    <FieldLabel>Meeting link</FieldLabel>
                    <Input
                      {...form.register("meetingLink")}
                      type="url"
                      placeholder="https://..."
                      className="max-w-md"
                    />
                    {form.formState.errors.meetingLink && (
                      <p className="text-sm text-destructive mt-1">{form.formState.errors.meetingLink.message}</p>
                    )}
                  </Field>
                )}
                {locationType === "physical" && (
                  <Field>
                    <FieldLabel>Address</FieldLabel>
                    <Input
                      {...form.register("address")}
                      placeholder="Full address or venue name"
                      className="max-w-md"
                    />
                    {form.formState.errors.address && (
                      <p className="text-sm text-destructive mt-1">{form.formState.errors.address.message}</p>
                    )}
                  </Field>
                )}
              </FieldGroup>
            </FieldSet>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle style={{ color: "var(--primary)" }}>Flier (optional)</CardTitle>
          </CardHeader>
          <CardContent>
            <FieldSet>
              <FieldGroup>
                <Field>
                  <FieldLabel>Flier</FieldLabel>
                  <div className="flex flex-wrap items-start gap-4">
                    {flierUrl && (
                      <div className="h-24 min-w-[120px] shrink-0 overflow-hidden rounded-xl border border-border/60 bg-muted/30">
                        <img src={flierUrl} alt="Flier preview" className="h-full w-full object-contain" />
                      </div>
                    )}
                    <div className="flex flex-col gap-2">
                      <Input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleFlierChange}
                        className="max-w-xs cursor-pointer"
                      />
                      {flierUrl && (
                        <Button type="button" variant="ghost" size="sm" onClick={() => setFlierUrl(null)}>
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>
                </Field>
              </FieldGroup>
            </FieldSet>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle style={{ color: "var(--primary)" }}>Check-in code</CardTitle>
            <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
              Regenerate if needed and set when it expires.
            </p>
          </CardHeader>
          <CardContent>
            <FieldSet>
              <FieldGroup>
                <Field>
                  <FieldLabel>Code</FieldLabel>
                  <div className="flex items-center gap-2">
                    <span
                      className="rounded-lg border bg-muted/30 px-4 py-2 font-mono text-lg font-semibold tracking-wider"
                      style={{ color: "var(--primary)", borderColor: "var(--border)" }}
                    >
                      {checkInCode}
                    </span>
                    <Button type="button" variant="outline" size="sm" onClick={handleRegenerateCode}>
                      Regenerate
                    </Button>
                  </div>
                </Field>
                <Field>
                  <FieldLabel>Code expires at</FieldLabel>
                  <div className="flex flex-wrap items-end gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "max-w-[240px] justify-start text-left font-normal",
                            !form.watch("codeExpiresDate") && "text-muted-foreground"
                          )}
                        >
                          <CalendarPlus className="mr-2 size-4 shrink-0" />
                          {form.watch("codeExpiresDate")
                            ? format(new Date(form.watch("codeExpiresDate") + "T12:00:00"), "PPP")
                            : "Pick expiration date"}
                          <ChevronDown className="ml-auto size-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={
                            form.watch("codeExpiresDate")
                              ? new Date(form.watch("codeExpiresDate") + "T12:00:00")
                              : undefined
                          }
                          onSelect={(date) =>
                            date &&
                            form.setValue("codeExpiresDate", format(date, "yyyy-MM-dd"), {
                              shouldValidate: true,
                            })
                          }
                        />
                      </PopoverContent>
                    </Popover>
                    <div className="relative max-w-[140px]">
                      <Clock className="absolute left-3 top-1/2 size-4 shrink-0 -translate-y-1/2 opacity-50" />
                      <Input
                        type="time"
                        {...form.register("codeExpiresTime")}
                        className="pl-9 [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                      />
                    </div>
                  </div>
                  {form.formState.errors.codeExpiresDate && (
                    <p className="text-sm text-destructive mt-1">{form.formState.errors.codeExpiresDate.message}</p>
                  )}
                  {form.formState.errors.codeExpiresTime && (
                    <p className="text-sm text-destructive mt-1">{form.formState.errors.codeExpiresTime.message}</p>
                  )}
                </Field>
              </FieldGroup>
            </FieldSet>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" className="gap-2">
            <Save className="size-4" />
            Save changes
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href={`${ROUTES.EVENTS}/${evt.id}`}>Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  )
}
