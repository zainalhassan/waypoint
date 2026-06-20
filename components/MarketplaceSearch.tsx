"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FilterPanel } from "@/components/transit/FilterPanel";

type MarketplaceSearchProps = {
  currentQ?: string;
  currentMinStages?: string;
};

export function MarketplaceSearch({ currentQ, currentMinStages }: MarketplaceSearchProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function update(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.replace(`${pathname}?${params.toString()}`);
  }

  return (
    <FilterPanel title="Search marketplace">
      <div className="min-w-[200px] flex-1 space-y-2">
        <Label htmlFor="marketplace-search">Search templates</Label>
        <Input
          id="marketplace-search"
          placeholder="Name, description, stage names…"
          value={currentQ ?? ""}
          onChange={(e) => update("q", e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="min-stages">Min. stages</Label>
        <select
          id="min-stages"
          className="flex h-10 min-w-[120px] rounded-[var(--radius-button)] border border-input bg-transparent px-3 py-1 text-sm"
          value={currentMinStages ?? ""}
          onChange={(e) => update("minStages", e.target.value)}
        >
          <option value="">Any</option>
          <option value="3">3+</option>
          <option value="5">5+</option>
          <option value="7">7+</option>
        </select>
      </div>
    </FilterPanel>
  );
}
