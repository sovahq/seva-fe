import Link from "next/link"
import { SevaLogo } from "@/components/branding"
import { Button } from "@/components/ui/button"
import { ROUTES } from "@/routes/routenames"

export default function HomePage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center bg-background px-6 py-20">
      <div className="grid w-full max-w-2xl grid-cols-12 gap-y-12">
        <div className="col-span-12 flex flex-col items-center text-center">
          <SevaLogo
            asLink
            to="/"
            size="lg"
            style={{ color: "var(--primary)" }}
            className="transition-opacity hover:opacity-90"
          />
          <p className="mt-8 max-w-md text-lg leading-relaxed text-muted-foreground">
            Manage your Local Organisation — governance, members, meetings, and finances in one place.
          </p>
        </div>
        <div className="col-span-12 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-5">
          <Button asChild className="h-12 min-w-[160px] rounded-full px-8 text-base font-semibold">
            <Link href={ROUTES.ONBOARDING}>Get started</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="h-12 min-w-[160px] rounded-full border-border px-8 text-base font-semibold text-foreground"
          >
            <Link href={ROUTES.LOGIN}>Log in</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
