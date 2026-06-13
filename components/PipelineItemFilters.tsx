"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Stage } from "@prisma/client";
import type { PipelineItemSort } from "@/lib/pipelines/itemFilters";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type PipelineItemFiltersProps = {
  stages: Stage[];
  current: {
    q?: string;
    stage?: string;
    sort: PipelineItemSort;
    view: "table" | "board";
  };
};

const SORT_OPTIONS: { value: PipelineItemSort; label: string }[] = [
  { value: "updated", label: "Recently updated" },
  { value: "started", label: "Start date" },
  { value: "title", label: "Title" },
  { value: "stage", label: "Stage order" },
];

export function PipelineItemFilters({ stages, current }: PipelineItemFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function updateParams(updates: Record<string, string | undefined>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    router.replace(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-col gap-4 rounded-lg border bg-card p-4 sm:flex-row sm:flex-wrap sm:items-end">
      <div className="min-w-[200px] flex-1 space-y-2">
        <Label htmlFor="item-search">Search</Label>
        <Input
          id="item-search"
          placeholder="Title, company, institution…"
          value={current.q ?? ""}
          onChange={(e) => updateParams({ q: e.target.value || undefined })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="item-stage">Stage</Label>
        <select
          id="item-stage"
          className="flex h-9 min-w-[140px] rounded-md border border-input bg-transparent px-3 py-1 text-sm"
          value={current.stage ?? ""}
          onChange={(e) => updateParams({ stage: e.target.value || undefined })}
        >
          <option value="">All stages</option>
          {stages
            .filter((s) => !s.isArchived)
            .map((stage) => (
              <option key={stage.id} value={stage.id}>
                {stage.name}
              </option>
            ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="item-sort">Sort</Label>
        <select
          id="item-sort"
          className="flex h-9 min-w-[160px] rounded-md border border-input bg-transparent px-3 py-1 text-sm"
          value={current.sort}
          onChange={(e) => updateParams({ sort: e.target.value })}
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      <div className="flex gap-1 rounded-lg border p-1">
        {(["table", "board"] as const).map((view) => (
          <button
            key={view}
            type="button"
            className={cn(
              "rounded-md px-3 py-1.5 text-sm capitalize transition-colors",
              current.view === view
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted",
            )}
            onClick={() => updateParams({ view })}
          >
            {view}
          </button>
        ))}
      </div>
    </div>
  );
}
