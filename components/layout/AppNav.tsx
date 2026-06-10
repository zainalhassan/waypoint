import Link from "next/link";
import { Settings } from "lucide-react";
import { signOut } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export function AppNav() {
  return (
    <header className="border-b bg-card">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          Waypoint
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/marketplace"
            className="hidden rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground sm:inline"
          >
            Marketplace
          </Link>
          <Link
            href="/templates"
            className="hidden rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground md:inline"
          >
            Templates
          </Link>
          <Link
            href="/pipelines/new"
            className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            New pipeline
          </Link>
          <Link
            href="/settings"
            className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
            title="Settings"
            aria-label="Settings"
          >
            <Settings className="size-5" />
          </Link>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}
          >
            <Button type="submit" variant="ghost" size="sm">
              Sign out
            </Button>
          </form>
        </nav>
      </div>
    </header>
  );
}
