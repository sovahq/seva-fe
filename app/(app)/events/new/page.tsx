"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useAuth } from "@/context/AuthContext"
import { useEvents } from "@/context/EventsContext"
import { generateCheckInCode } from "@/lib/check-in-code"
import { ROUTES } from "@/routes/routenames"
import type { Event } from "@/types"
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
import { ArrowLeft, CalendarPlus, ChevronDown, Clock } from "lucide-react"

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

const defaultDate = () => {
  const d = new Date()
  return d.toISOString().slice(0, 10)
}
const defaultTime = () => {
  const d = new Date()
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`
}

export default function NewMeetingPage() {
  const router = useRouter()
  const { currentOrganizationId } = useAuth()
  const { addEvent } = useEvents()
  const [checkInCode, setCheckInCode] = useState(() => generateCheckInCode())
  const [flierUrl, setFlierUrl] = useState<string | null>(null)

  const form = useForm<MeetingFormValues>({
    resolver: zodResolver(meetingFormSchema),
    defaultValues: {
      name: "",
      date: defaultDate(),
      time: defaultTime(),
      locationType: "physical",
      meetingLink: "",
      address: "",
      codeExpiresDate: defaultDate(),
      codeExpiresTime: "23:59",
    },
  })

  const locationType = form.watch("locationType")

  function handleFlierChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) setFlierUrl(URL.createObjectURL(file))
    else setFlierUrl(null)
  }

  function handleRegenerateCode() {
    setCheckInCode(generateCheckInCode())
  }

  function onSubmit(data: MeetingFormValues) {
    const orgId = currentOrganizationId ?? ""
    const startTime = `${data.date}T${data.time}:00`
    const codeExpiresAt = `${data.codeExpiresDate}T${data.codeExpiresTime}:00`

    const evt: Event = {
      id: `evt-${Date.now()}`,
      organizationId: orgId,
      name: data.name.trim(),
      date: data.date,
      type: "meeting",
      startTime,
      locationType: data.locationType,
      meetingLink: data.locationType === "virtual" ? data.meetingLink?.trim() : undefined,
      address: data.locationType === "physical" ? data.address?.trim() : undefined,
      flierUrl: flierUrl ?? undefined,
      checkInCode,
      checkInCodeExpiresAt: codeExpiresAt,
    }
    addEvent(evt)
    router.push(`${ROUTES.EVENTS}/${evt.id}`)
  }

  return (
    <div className="mx-auto max-w-2xl p-6">
      <div className="mb-6">
        <Link
          href={ROUTES.EVENTS}
          className="inline-flex items-center gap-1.5 text-sm font-medium hover:underline"
          style={{ color: "var(--muted-foreground)" }}
        >
          <ArrowLeft className="size-4 shrink-0" />
          Back to events
        </Link>
      </div>
      <h1 className="text-2xl font-semibold" style={{ color: "var(--primary)" }}>
        Create meeting
      </h1>
      <p className="mt-1 text-sm" style={{ color: "var(--muted-foreground)" }}>
        Add name, time, location, and an optional flier. A check-in code will be generated for members.
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
            <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
              Virtual (meeting link) or physical (address).
            </p>
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
                    <FieldDescription>Zoom, Google Meet, or other video call URL.</FieldDescription>
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
            <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
              Upload an image or PDF to show on the meeting page.
            </p>
          </CardHeader>
          <CardContent>
            <FieldSet>
              <FieldGroup>
                <Field>
                  <FieldLabel>Flier</FieldLabel>
                  <div className="flex flex-wrap items-start gap-4">
                    {flierUrl && (
                      <div className="h-24 min-w-[120px] shrink-0 overflow-hidden rounded-xl border border-border/60 bg-muted/30">
                        <img
                          src={flierUrl}
                          alt="Flier preview"
                          className="h-full w-full object-contain"
                        />
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
              Share this code at the meeting so members can check in. Set when it expires.
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
                  <FieldDescription>After this date and time, the code will no longer work for check-in.</FieldDescription>
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
            <CalendarPlus className="size-4" />
            Create meeting
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href={ROUTES.EVENTS}>Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  )
}
