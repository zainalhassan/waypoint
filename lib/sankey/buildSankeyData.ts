import type { Stage, StageEvent } from "@prisma/client";

export type SankeyNode = { name: string };
export type SankeyLink = { source: string; target: string; value: number };

export type SankeyData = {
  nodes: SankeyNode[];
  links: SankeyLink[];
};

const ENTRY_LABEL = "Started";

export function buildSankeyData(
  stages: Stage[],
  events: (StageEvent & { fromStage?: Stage | null; toStage: Stage })[],
): SankeyData {
  const stageById = new Map(stages.map((s) => [s.id, s]));
  const linkCounts = new Map<string, number>();

  for (const event of events) {
    const source = event.fromStageId
      ? (stageById.get(event.fromStageId)?.name ?? "Unknown")
      : ENTRY_LABEL;
    const target = stageById.get(event.toStageId)?.name ?? "Unknown";
    const key = `${source}→${target}`;
    linkCounts.set(key, (linkCounts.get(key) ?? 0) + 1);
  }

  const nodeNames = new Set<string>();
  nodeNames.add(ENTRY_LABEL);

  for (const stage of stages) {
    nodeNames.add(stage.name);
  }

  const links: SankeyLink[] = [];
  for (const [key, value] of linkCounts) {
    const [source, target] = key.split("→");
    links.push({ source, target, value });
    nodeNames.add(source);
    nodeNames.add(target);
  }

  const nodes = Array.from(nodeNames).map((name) => ({ name }));

  return { nodes, links };
}
