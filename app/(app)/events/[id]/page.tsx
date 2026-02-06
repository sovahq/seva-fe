import { mockEvents } from "@/data/mock"

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const evt = mockEvents.find((e) => e.id === id)

  if (!evt) {
    return (
      <div className="mx-auto max-w-7xl p-6">
        <p style={{ color: "var(--muted-foreground)" }}>Event not found.</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl p-6">
      <h1 className="text-2xl font-semibold" style={{ color: "var(--primary)" }}>
        {evt.name}
      </h1>
      <p className="mt-1" style={{ color: "var(--muted-foreground)" }}>
        {evt.date}
      </p>
    </div>
  )
}
