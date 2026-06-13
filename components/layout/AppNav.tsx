import Link from "next/link";
import { Settings } from "lucide-react";
import { signOutUser } from "@/actions/auth";
import { MobileNav } from "@/components/layout/MobileNav";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";

const NAV_LINKS = [
  { href: "/marketplace", label: "Marketplace" },
  { href: "/templates", label: "Templates" },
  { href: "/pipelines/new", label: "New pipeline" },
] as const;

export function AppNav() {
  return (
    <header className="border-b border-border/80 bg-card shadow-sm">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="text-lg font-bold tracking-tight text-primary">
          Waypoint
        </Link>

        <nav className="hidden items-center gap-1 lg:flex lg:gap-2">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/settings"
            className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
            title="Settings"
            aria-label="Settings"
          >
            <Settings className="size-5" />
          </Link>
          <ThemeToggle />
          <form action={signOutUser}>
            <Button type="submit" variant="ghost" size="sm">
              Sign out
            </Button>
          </form>
        </nav>

        <MobileNav />
      </div>
    </header>
  );
}
