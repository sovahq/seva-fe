"use client"

import * as React from "react"
import { mockEvents } from "@/data/mock/events"
import { mockAttendanceRecords } from "@/data/mock/attendance"
import type { Event, AttendanceRecord } from "@/types"

/** In-memory store so state survives EventsProvider remounts (e.g. Strict Mode or navigation). */
let eventsStore: Event[] = [...mockEvents]
let attendanceStore: AttendanceRecord[] = [...mockAttendanceRecords]

type EventsContextValue = {
  events: Event[]
  attendance: AttendanceRecord[]
  addEvent: (event: Event) => void
  updateEvent: (id: string, updates: Partial<Event>) => void
  addAttendanceRecord: (record: AttendanceRecord) => void
  getAttendanceForEvent: (eventId: string) => AttendanceRecord[]
}

const EventsContext = React.createContext<EventsContextValue | null>(null)

export function EventsProvider({ children }: { children: React.ReactNode }) {
  const [events, setEvents] = React.useState<Event[]>(() => [...eventsStore])
  const [attendance, setAttendance] = React.useState<AttendanceRecord[]>(() => [...attendanceStore])

  const addEvent = React.useCallback((event: Event) => {
    setEvents((prev) => {
      const next = [...prev, event]
      eventsStore = next
      return next
    })
  }, [])

  const updateEvent = React.useCallback((id: string, updates: Partial<Event>) => {
    setEvents((prev) => {
      const next = prev.map((e) => (e.id === id ? { ...e, ...updates } : e))
      eventsStore = next
      return next
    })
  }, [])

  const addAttendanceRecord = React.useCallback((record: AttendanceRecord) => {
    setAttendance((prev) => {
      const next = [...prev, record]
      attendanceStore = next
      return next
    })
  }, [])

  const getAttendanceForEvent = React.useCallback(
    (eventId: string) => attendance.filter((a) => a.eventId === eventId),
    [attendance]
  )

  const value: EventsContextValue = React.useMemo(
    () => ({
      events,
      attendance,
      addEvent,
      updateEvent,
      addAttendanceRecord,
      getAttendanceForEvent,
    }),
    [events, attendance, addEvent, updateEvent, addAttendanceRecord, getAttendanceForEvent]
  )

  return <EventsContext.Provider value={value}>{children}</EventsContext.Provider>
}

export function useEvents(): EventsContextValue {
  const ctx = React.useContext(EventsContext)
  if (!ctx) throw new Error("useEvents must be used within EventsProvider")
  return ctx
}
