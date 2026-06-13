import type { Item, PipelineTemplate, Stage } from "@prisma/client";

export type PipelineItemSort = "updated" | "started" | "title" | "stage";

export function parsePipelineItemSort(value: string | undefined): PipelineItemSort {
  const options: PipelineItemSort[] = ["updated", "started", "title", "stage"];
  if (value && options.includes(value as PipelineItemSort)) {
    return value as PipelineItemSort;
  }
  return "updated";
}

export function filterAndSortItems(
  items: (Item & { currentStage: Stage })[],
  options: {
    q?: string;
    stageId?: string;
    sort: PipelineItemSort;
  },
) {
  let result = [...items];

  if (options.q) {
    const query = options.q.toLowerCase();
    result = result.filter((item) => {
      const meta =
        item.metadata && typeof item.metadata === "object"
          ? (item.metadata as Record<string, unknown>)
          : {};
      const haystack = [
        item.title,
        item.subtitle ?? "",
        String(meta.company ?? ""),
        String(meta.institution ?? ""),
        String(meta.ticker ?? ""),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }

  if (options.stageId) {
    result = result.filter((item) => item.currentStageId === options.stageId);
  }

  result.sort((a, b) => {
    switch (options.sort) {
      case "title":
        return a.title.localeCompare(b.title);
      case "started":
        return b.startedAt.getTime() - a.startedAt.getTime();
      case "stage":
        return a.currentStage.sortOrder - b.currentStage.sortOrder;
      case "updated":
      default:
        return b.updatedAt.getTime() - a.updatedAt.getTime();
    }
  });

  return result;
}

export function getItemValueForSort(
  template: PipelineTemplate,
  metadata: unknown,
): number {
  if (!metadata || typeof metadata !== "object") return 0;
  const m = metadata as Record<string, unknown>;
  switch (template) {
    case "JOB_SEARCH":
      return Number(m.salaryMax ?? m.salaryMin ?? 0);
    case "SALES":
      return Number(m.dealValue ?? 0);
    case "INVESTMENTS":
      return Number(m.currentValue ?? m.amountInvested ?? 0);
    default:
      return 0;
  }
}
