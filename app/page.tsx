import Link from "next/link"
import { SevaLogo } from "@/components/branding"
import { Button } from "@/components/ui/button"
import { ROUTES } from "@/routes/routenames"

export default function HomePage() {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center px-4 py-12">
      <div className="flex max-w-md flex-col items-center text-center">
        <SevaLogo
          asLink
          to="/"
          size="lg"
          style={{ color: "var(--primary)" }}
          className="transition-opacity hover:opacity-90"
        />
        <p
          className="mt-4 text-lg"
          style={{ color: "var(--muted-foreground)" }}
        >
          Manage your Local Organisation — governance, members, meetings, and finances in one place.
        </p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:gap-4">
          <Button
            asChild
            className="h-11 px-6 font-medium"
            style={{
              backgroundColor: "var(--primary)",
              color: "var(--primary-foreground)",
            }}
          >
            <Link href={ROUTES.ONBOARDING}>Get started</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="h-11 px-6 font-medium"
            style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
          >
            <Link href={ROUTES.LOGIN}>Log in</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
