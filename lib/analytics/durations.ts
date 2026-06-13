import type { Item, Stage, StageEvent } from "@prisma/client";

export type StageDurationStat = {
  stageId: string;
  stageName: string;
  slug: string;
  avgDays: number | null;
  sampleCount: number;
};

export type FunnelDropOff = {
  fromStage: string;
  toStage: string;
  count: number;
  dropOffRate: number | null;
};

export type DurationAnalytics = {
  stageDurations: StageDurationStat[];
  funnelDropOffs: FunnelDropOff[];
  avgTimeToTerminalDays: number | null;
};

type EventWithStages = StageEvent & {
  fromStage: Stage | null;
  toStage: Stage;
};

type ItemWithEvents = Item & {
  stageEvents: EventWithStages[];
  currentStage: Stage;
};

function daysBetween(start: Date, end: Date) {
  return (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
}

export function computeStageDurations(
  items: ItemWithEvents[],
  stages: Stage[],
): StageDurationStat[] {
  const activeStages = stages.filter((s) => !s.isArchived);
  const durationsByStage = new Map<string, number[]>();

  for (const item of items) {
    const events = [...item.stageEvents].sort(
      (a, b) => a.occurredAt.getTime() - b.occurredAt.getTime(),
    );

    for (let i = 0; i < events.length; i++) {
      const event = events[i];
      const next = events[i + 1];
      const end = next?.occurredAt ?? new Date();
      const stageId = event.toStageId;
      const days = daysBetween(event.occurredAt, end);
      const list = durationsByStage.get(stageId) ?? [];
      list.push(days);
      durationsByStage.set(stageId, list);
    }
  }

  return activeStages.map((stage) => {
    const samples = durationsByStage.get(stage.id) ?? [];
    const avgDays =
      samples.length > 0
        ? Math.round((samples.reduce((a, b) => a + b, 0) / samples.length) * 10) / 10
        : null;
    return {
      stageId: stage.id,
      stageName: stage.name,
      slug: stage.slug,
      avgDays,
      sampleCount: samples.length,
    };
  });
}

export function computeFunnelDropOffs(
  events: EventWithStages[],
): FunnelDropOff[] {
  const transitionCounts = new Map<string, number>();
  const fromTotals = new Map<string, number>();

  for (const event of events) {
    if (!event.fromStage) continue;
    const key = `${event.fromStage.name}→${event.toStage.name}`;
    transitionCounts.set(key, (transitionCounts.get(key) ?? 0) + 1);
    fromTotals.set(
      event.fromStage.name,
      (fromTotals.get(event.fromStage.name) ?? 0) + 1,
    );
  }

  return [...transitionCounts.entries()].map(([key, count]) => {
    const [fromStage, toStage] = key.split("→");
    const fromTotal = fromTotals.get(fromStage) ?? 0;
    const dropOffRate =
      fromTotal > 0 ? Math.round((1 - count / fromTotal) * 100) : null;
    return { fromStage, toStage, count, dropOffRate };
  });
}

export function computeAvgTimeToTerminal(
  items: ItemWithEvents[],
): number | null {
  const terminalItems = items.filter((item) => item.currentStage.isTerminal);
  if (terminalItems.length === 0) return null;

  const durations = terminalItems.map((item) => {
    const first = [...item.stageEvents].sort(
      (a, b) => a.occurredAt.getTime() - b.occurredAt.getTime(),
    )[0];
    const last = item.stageEvents.reduce((latest, e) =>
      e.occurredAt > latest.occurredAt ? e : latest,
    );
    const start = first?.occurredAt ?? item.startedAt;
    return daysBetween(start, last.occurredAt);
  });

  return (
    Math.round(
      (durations.reduce((a, b) => a + b, 0) / durations.length) * 10,
    ) / 10
  );
}

export function computeDurationAnalytics(
  items: ItemWithEvents[],
  stages: Stage[],
  events: EventWithStages[],
): DurationAnalytics {
  return {
    stageDurations: computeStageDurations(items, stages),
    funnelDropOffs: computeFunnelDropOffs(events),
    avgTimeToTerminalDays: computeAvgTimeToTerminal(items),
  };
}
