import type { Stage, StageEvent } from "@prisma/client";

export type SankeyNode = { name: string };
export type SankeyLink = { source: string; target: string; value: number };

export type SankeyData = {
  nodes: SankeyNode[];
  links: SankeyLink[];
};

const ENTRY_LABEL = "Started";
const LINK_KEY_SEP = "\u001f";

function linkKey(source: string, target: string) {
  return `${source}${LINK_KEY_SEP}${target}`;
}

function parseLinkKey(key: string): [string, string] {
  const idx = key.indexOf(LINK_KEY_SEP);
  if (idx === -1) return [key, ""];
  return [key.slice(0, idx), key.slice(idx + LINK_KEY_SEP.length)];
}

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
    const key = linkKey(source, target);
    linkCounts.set(key, (linkCounts.get(key) ?? 0) + 1);
  }

  const nodeNames = new Set<string>();
  nodeNames.add(ENTRY_LABEL);

  for (const stage of stages) {
    nodeNames.add(stage.name);
  }

  const links: SankeyLink[] = [];
  for (const [key, value] of linkCounts) {
    const [source, target] = parseLinkKey(key);
    links.push({ source, target, value });
    nodeNames.add(source);
    nodeNames.add(target);
  }

  const nodes = Array.from(nodeNames).map((name) => ({ name }));

  return { nodes, links };
}
