"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Settings, X } from "lucide-react";
import { signOutUser } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/marketplace", label: "Marketplace" },
  { href: "/templates", label: "Templates" },
  { href: "/pipelines/new", label: "New pipeline" },
] as const;

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-expanded={open}
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((prev) => !prev)}
      >
        {open ? <X className="size-5" /> : <Menu className="size-5" />}
      </Button>

      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 top-14 z-40 bg-black/30"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          />
          <nav className="fixed inset-x-0 top-14 z-50 max-h-[calc(100dvh-3.5rem)] overflow-y-auto border-b bg-card shadow-lg">
            <ul className="flex flex-col p-2">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={cn(
                      "block rounded-md px-4 py-3 text-sm font-medium transition-colors hover:bg-muted",
                      pathname === link.href || pathname.startsWith(`${link.href}/`)
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground",
                    )}
                    onClick={() => setOpen(false)}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/settings"
                  className={cn(
                    "flex items-center gap-2 rounded-md px-4 py-3 text-sm font-medium transition-colors hover:bg-muted",
                    pathname === "/settings"
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground",
                  )}
                  onClick={() => setOpen(false)}
                >
                  <Settings className="size-4" />
                  Settings
                </Link>
              </li>
              <li className="mt-2 border-t pt-2">
                <form action={signOutUser}>
                  <Button
                    type="submit"
                    variant="ghost"
                    className="h-auto w-full justify-start px-4 py-3 text-sm font-medium"
                  >
                    Sign out
                  </Button>
                </form>
              </li>
            </ul>
          </nav>
        </>
      )}
    </div>
  );
}
