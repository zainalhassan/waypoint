import type { StageSnapshot } from "@/lib/templates/syncTypes";

export type StageDiff = {
  added: StageSnapshot[];
  removed: StageSnapshot[];
  updated: { slug: string; before: StageSnapshot; after: StageSnapshot }[];
  unchanged: StageSnapshot[];
};

function stageChanged(a: StageSnapshot, b: StageSnapshot) {
  return (
    a.name !== b.name ||
    a.sortOrder !== b.sortOrder ||
    a.isEntry !== b.isEntry ||
    a.isTerminal !== b.isTerminal ||
    a.color !== b.color
  );
}

export function computeStageDiff(
  currentStages: StageSnapshot[],
  sourceStages: StageSnapshot[],
): StageDiff {
  const currentBySlug = new Map(currentStages.map((s) => [s.slug, s]));
  const sourceBySlug = new Map(sourceStages.map((s) => [s.slug, s]));

  const added = sourceStages.filter((s) => !currentBySlug.has(s.slug));
  const removed = currentStages.filter((s) => !sourceBySlug.has(s.slug));
  const unchanged: StageSnapshot[] = [];
  const updated: StageDiff["updated"] = [];

  for (const source of sourceStages) {
    const current = currentBySlug.get(source.slug);
    if (!current) continue;
    if (stageChanged(current, source)) {
      updated.push({ slug: source.slug, before: current, after: source });
    } else {
      unchanged.push(source);
    }
  }

  return { added, removed, updated, unchanged };
}
