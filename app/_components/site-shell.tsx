import Link from "next/link";
import { Plane } from "lucide-react";

const widths = {
  sm: "max-w-xl",
  md: "max-w-3xl",
  lg: "max-w-5xl",
} as const;

/**
 * Shared page chrome for the inner routes: the same layered emerald glow as the
 * landing hero, plus a sticky brand header that links home. Content sits in a
 * centered column whose width the caller picks.
 */
export function SiteShell({
  children,
  width = "md",
}: {
  children: React.ReactNode;
  width?: keyof typeof widths;
}) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* layered brand background — mirrors the landing hero */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/8 via-background to-background" />
        <div className="absolute -top-40 left-1/2 h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-primary/15 blur-[130px]" />
        <div className="absolute right-[-8rem] top-10 h-[20rem] w-[20rem] rounded-full bg-teal-400/12 blur-[130px]" />
      </div>

      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center px-6 py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-base font-semibold tracking-tight text-foreground transition-opacity hover:opacity-80"
          >
            <span className="inline-flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Plane className="size-4" />
            </span>
            Ascenda Loyalty
          </Link>
        </div>
      </header>

      <main className={`mx-auto ${widths[width]} px-6 pb-24 pt-10`}>{children}</main>
    </div>
  );
}
