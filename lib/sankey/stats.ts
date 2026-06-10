import type { Item, PipelineTemplate, Stage } from "@prisma/client";

export type PipelineStats = {
  total: number;
  active: number;
  terminal: number;
  conversionRate: number | null;
  conversionLabel: string;
};

export function computePipelineStats(
  items: (Item & { currentStage: Stage })[],
  template: PipelineTemplate,
): PipelineStats {
  const total = items.length;
  const terminal = items.filter((i) => i.currentStage.isTerminal).length;
  const active = total - terminal;

  let successSlugs: string[] = [];
  let conversionLabel = "Success rate";

  switch (template) {
    case "JOB_SEARCH":
      successSlugs = ["interview", "offer"];
      conversionLabel = "Reached interview";
      break;
    case "GRAD_SCHOOL":
      successSlugs = ["interview", "accepted"];
      conversionLabel = "Reached interview";
      break;
    case "SALES":
      successSlugs = ["won"];
      conversionLabel = "Win rate";
      break;
    case "INVESTMENTS":
      successSlugs = ["holding", "sold"];
      conversionLabel = "Active holdings";
      break;
    default:
      successSlugs = ["complete"];
      conversionLabel = "Completion rate";
  }

  const successCount = items.filter((i) =>
    successSlugs.includes(i.currentStage.slug),
  ).length;

  return {
    total,
    active,
    terminal,
    conversionRate: total > 0 ? Math.round((successCount / total) * 100) : null,
    conversionLabel,
  };
}
