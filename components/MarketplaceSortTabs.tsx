"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import type { MarketplaceSort } from "@/lib/marketplace/queries";
import { cn } from "@/lib/utils";

const SORTS: { value: MarketplaceSort; label: string }[] = [
  { value: "popular", label: "Most popular" },
  { value: "rated", label: "Highest rated" },
  { value: "liked", label: "Most liked" },
  { value: "newest", label: "Newest" },
];

type MarketplaceSortTabsProps = {
  current: MarketplaceSort;
};

export function MarketplaceSortTabs({ current }: MarketplaceSortTabsProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <div className="flex flex-wrap gap-2">
      {SORTS.map((sort) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("sort", sort.value);
        const href = `${pathname}?${params.toString()}`;

        return (
          <Link
            key={sort.value}
            href={href}
            className={cn(
              "route-chip transition-opacity",
              current === sort.value
                ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                : "opacity-70 hover:opacity-100",
            )}
          >
            {sort.label}
          </Link>
        );
      })}
    </div>
  );
}
