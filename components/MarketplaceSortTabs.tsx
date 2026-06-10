import Link from "next/link";
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
  return (
    <div className="flex flex-wrap gap-2">
      {SORTS.map((sort) => (
        <Link
          key={sort.value}
          href={`/marketplace?sort=${sort.value}`}
          className={cn(
            "rounded-full border px-3 py-1.5 text-sm transition-colors",
            current === sort.value
              ? "border-primary bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground",
          )}
        >
          {sort.label}
        </Link>
      ))}
    </div>
  );
}
