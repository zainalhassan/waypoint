import { prisma } from "@/lib/prisma";
import { computeStageDiff } from "@/lib/templates/stageDiff";
import type { RemovedStageImpact, StageSnapshot, SyncPreview } from "@/lib/templates/syncTypes";

function toSnapshot(stage: {
  slug: string;
  name: string;
  sortOrder: number;
  isEntry: boolean;
  isTerminal: boolean;
  color: string | null;
}): StageSnapshot {
  return {
    slug: stage.slug,
    name: stage.name,
    sortOrder: stage.sortOrder,
    isEntry: stage.isEntry,
    isTerminal: stage.isTerminal,
    color: stage.color,
  };
}

async function loadLinkedTemplate(copyId: string, userId: string) {
  return prisma.userTemplate.findFirst({
    where: { id: copyId, userId, isLinkedToSource: true },
    include: {
      stages: { orderBy: { sortOrder: "asc" } },
      forkedFrom: {
        include: { stages: { orderBy: { sortOrder: "asc" } } },
      },
    },
  });
}

export async function buildSyncPreview(
  copyId: string,
  userId: string,
): Promise<SyncPreview | null> {
  const copy = await loadLinkedTemplate(copyId, userId);
  if (!copy?.forkedFrom?.isPublic) return null;

  const currentStages = copy.stages.map(toSnapshot);
  const sourceStages = copy.forkedFrom.stages.map(toSnapshot);
  const { added, removed, updated, unchanged } = computeStageDiff(currentStages, sourceStages);

  const pipelines = await prisma.pipeline.findMany({
    where: { userTemplateId: copyId, userId },
    include: {
      stages: { where: { isArchived: false } },
      items: { include: { currentStage: true } },
    },
  });

  const removedWithItems: RemovedStageImpact[] = [];

  for (const removedStage of removed) {
    const pipelinesAffected: RemovedStageImpact["pipelines"] = [];
    let itemCount = 0;

    for (const pipeline of pipelines) {
      const count = pipeline.items.filter(
        (item) => item.currentStage.slug === removedStage.slug,
      ).length;
      if (count > 0) {
        itemCount += count;
        pipelinesAffected.push({
          id: pipeline.id,
          name: pipeline.name,
          count,
        });
      }
    }

    if (itemCount > 0) {
      removedWithItems.push({
        slug: removedStage.slug,
        name: removedStage.name,
        itemCount,
        pipelines: pipelinesAffected,
      });
    }
  }

  const requiresWizard = removedWithItems.length > 0;

  return {
    templateId: copy.id,
    templateName: copy.name,
    sourceName: copy.forkedFrom.name,
    added,
    removed,
    updated,
    unchanged,
    removedWithItems,
    targetStages: sourceStages,
    requiresWizard,
    pendingSourceSync: copy.pendingSourceSync,
  };
}
