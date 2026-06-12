import type { Stage } from "@prisma/client";

export function pickEntryStage(stages: Stage[]) {
  const active = stages.filter((s) => !s.isArchived);
  return active.find((s) => s.isEntry) ?? active[0] ?? null;
}
