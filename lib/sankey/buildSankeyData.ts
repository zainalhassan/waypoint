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

/** Sankey requires a DAG — only count forward transitions by stage order. */
export function isForwardStageTransition(
  from: Stage | null | undefined,
  to: Stage,
): boolean {
  if (!from) return true;
  if (from.id === to.id) return false;
  return to.sortOrder > from.sortOrder;
}

function nodeDepth(name: string, depthByName: Map<string, number>): number {
  return depthByName.get(name) ?? 0;
}

function hasCycle(links: SankeyLink[]): boolean {
  const adj = new Map<string, string[]>();
  const nodes = new Set<string>();

  for (const { source, target } of links) {
    nodes.add(source);
    nodes.add(target);
    const list = adj.get(source) ?? [];
    list.push(target);
    adj.set(source, list);
  }

  const visited = new Set<string>();
  const stack = new Set<string>();

  function dfs(node: string): boolean {
    visited.add(node);
    stack.add(node);
    for (const next of adj.get(node) ?? []) {
      if (!visited.has(next)) {
        if (dfs(next)) return true;
      } else if (stack.has(next)) {
        return true;
      }
    }
    stack.delete(node);
    return false;
  }

  for (const node of nodes) {
    if (!visited.has(node) && dfs(node)) return true;
  }
  return false;
}

/** Drop lowest-volume links until the graph is acyclic (safety net). */
export function breakSankeyCycles(links: SankeyLink[]): SankeyLink[] {
  let result = [...links];
  if (!hasCycle(result)) return result;

  const sorted = [...result].sort((a, b) => a.value - b.value);
  for (const link of sorted) {
    const idx = result.findIndex(
      (l) => l.source === link.source && l.target === link.target,
    );
    if (idx === -1) continue;
    result = result.filter((_, i) => i !== idx);
    if (!hasCycle(result)) return result;
  }

  return [];
}

function resolveStage(
  stageById: Map<string, Stage>,
  event: StageEvent & { fromStage?: Stage | null; toStage: Stage },
  kind: "from" | "to",
): Stage | null {
  if (kind === "from") {
    if (!event.fromStageId) return null;
    return (
      stageById.get(event.fromStageId) ??
      event.fromStage ??
      null
    );
  }
  return stageById.get(event.toStageId) ?? event.toStage ?? null;
}

export function buildSankeyData(
  stages: Stage[],
  events: (StageEvent & { fromStage?: Stage | null; toStage: Stage })[],
): SankeyData {
  const activeStages = stages.filter((s) => !s.isArchived);
  const stageById = new Map(stages.map((s) => [s.id, s]));

  const depthByName = new Map<string, number>();
  depthByName.set(ENTRY_LABEL, 0);
  for (const stage of activeStages) {
    depthByName.set(stage.name, stage.sortOrder + 1);
  }

  const linkCounts = new Map<string, number>();

  for (const event of events) {
    const from = resolveStage(stageById, event, "from");
    const to = resolveStage(stageById, event, "to");
    if (!to || to.isArchived) continue;
    if (event.fromStageId && !from) continue;
    if (!isForwardStageTransition(from, to)) continue;

    const source = from?.name ?? ENTRY_LABEL;
    const target = to.name;
    if (source === target) continue;

    const key = linkKey(source, target);
    linkCounts.set(key, (linkCounts.get(key) ?? 0) + 1);
  }

  let links: SankeyLink[] = [];
  for (const [key, value] of linkCounts) {
    const [source, target] = parseLinkKey(key);
    const sourceDepth = nodeDepth(source, depthByName);
    const targetDepth = nodeDepth(target, depthByName);
    if (targetDepth <= sourceDepth) continue;
    links.push({ source, target, value });
  }

  links = breakSankeyCycles(links);

  const usedNames = new Set<string>();
  for (const link of links) {
    usedNames.add(link.source);
    usedNames.add(link.target);
  }

  const nodes = Array.from(usedNames)
    .sort((a, b) => nodeDepth(a, depthByName) - nodeDepth(b, depthByName))
    .map((name) => ({ name }));

  return { nodes, links };
}

/** Last-line defense before ECharts — ensure nodes match links and graph is acyclic. */
export function sanitizeSankeyForECharts(data: SankeyData): SankeyData {
  let links = data.links.filter(
    (l) => l.source !== l.target && l.value > 0,
  );
  links = breakSankeyCycles(links);

  const usedNames = new Set<string>();
  for (const link of links) {
    usedNames.add(link.source);
    usedNames.add(link.target);
  }

  const nodes = Array.from(usedNames).map((name) => ({ name }));
  return { nodes, links };
}
