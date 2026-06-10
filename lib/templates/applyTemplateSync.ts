import type { UserTemplateStage } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { buildSyncPreview } from "@/lib/templates/syncPreview";
import type { StageMappings } from "@/lib/templates/syncTypes";

function stageCreateData(stages: UserTemplateStage[]) {
  return stages.map((stage) => ({
    name: stage.name,
    slug: stage.slug,
    sortOrder: stage.sortOrder,
    isEntry: stage.isEntry,
    isTerminal: stage.isTerminal,
    color: stage.color,
  }));
}

function resolveTargetSlug(
  removedSlug: string,
  mappings: StageMappings,
  sourceSlugs: Set<string>,
  fallbackSlug: string,
): string {
  const mapped = mappings[removedSlug];
  if (mapped && sourceSlugs.has(mapped)) return mapped;
  return fallbackSlug;
}

async function migratePipeline(
  pipelineId: string,
  sourceStages: UserTemplateStage[],
  removedSlugs: string[],
  mappings: StageMappings,
) {
  const pipeline = await prisma.pipeline.findUnique({
    where: { id: pipelineId },
    include: {
      stages: true,
      items: true,
    },
  });

  if (!pipeline) return;

  const sourceBySlug = new Map(sourceStages.map((s) => [s.slug, s]));
  const sourceSlugs = new Set(sourceStages.map((s) => s.slug));
  const fallbackSlug =
    sourceStages.find((s) => s.isEntry)?.slug ?? sourceStages[0]?.slug ?? "";

  await prisma.$transaction(async (tx) => {
    const stageIdBySlug = new Map(pipeline.stages.map((s) => [s.slug, s.id]));

    for (const source of sourceStages) {
      const existingId = stageIdBySlug.get(source.slug);
      if (existingId) {
        await tx.stage.update({
          where: { id: existingId },
          data: {
            name: source.name,
            sortOrder: source.sortOrder,
            isEntry: source.isEntry,
            isTerminal: source.isTerminal,
            color: source.color,
            isArchived: false,
          },
        });
      } else {
        const created = await tx.stage.create({
          data: {
            pipelineId,
            name: source.name,
            slug: source.slug,
            sortOrder: source.sortOrder,
            isEntry: source.isEntry,
            isTerminal: source.isTerminal,
            color: source.color,
          },
        });
        stageIdBySlug.set(source.slug, created.id);
      }
    }

    for (const removedSlug of removedSlugs) {
      const removedStageId = stageIdBySlug.get(removedSlug);
      if (!removedStageId) continue;

      const targetSlug = resolveTargetSlug(
        removedSlug,
        mappings,
        sourceSlugs,
        fallbackSlug,
      );
      const targetStageId = stageIdBySlug.get(targetSlug);
      if (!targetStageId || targetStageId === removedStageId) continue;

      const itemsToMove = pipeline.items.filter(
        (item) => item.currentStageId === removedStageId,
      );

      for (const item of itemsToMove) {
        await tx.item.update({
          where: { id: item.id },
          data: { currentStageId: targetStageId },
        });
        await tx.stageEvent.create({
          data: {
            itemId: item.id,
            fromStageId: removedStageId,
            toStageId: targetStageId,
          },
        });
      }

      const removedMeta = pipeline.stages.find((s) => s.slug === removedSlug);
      await tx.stage.update({
        where: { id: removedStageId },
        data: {
          isArchived: true,
          isEntry: false,
          name: removedMeta ? `${removedMeta.name} (removed)` : `${removedSlug} (removed)`,
        },
      });
    }
  });
}

export async function applyTemplateSync(
  copyId: string,
  userId: string,
  mappings: StageMappings = {},
) {
  const copy = await prisma.userTemplate.findFirst({
    where: { id: copyId, userId, isLinkedToSource: true },
    include: {
      forkedFrom: {
        include: { stages: { orderBy: { sortOrder: "asc" } } },
      },
    },
  });

  if (!copy?.forkedFrom?.isPublic) {
    throw new Error("Template not found or source unavailable");
  }

  const preview = await buildSyncPreview(copyId, userId);
  if (!preview) {
    throw new Error("Could not build sync preview");
  }

  if (preview.requiresWizard) {
    for (const impact of preview.removedWithItems) {
      const target = mappings[impact.slug];
      if (!target || !preview.targetStages.some((s) => s.slug === target)) {
        throw new Error(`Choose where to move items from "${impact.name}"`);
      }
      if (target === impact.slug) {
        throw new Error(`"${impact.name}" cannot map to itself`);
      }
    }
  }

  const source = copy.forkedFrom;
  const removedSlugs = preview.removed.map((s) => s.slug);

  await prisma.$transaction(async (tx) => {
    await tx.userTemplateStage.deleteMany({ where: { userTemplateId: copyId } });
    await tx.userTemplate.update({
      where: { id: copyId },
      data: {
        name: source.name,
        description: source.description,
        pendingSourceSync: false,
        stages: { create: stageCreateData(source.stages) },
      },
    });
  });

  const pipelines = await prisma.pipeline.findMany({
    where: { userTemplateId: copyId, userId },
    select: { id: true },
  });

  for (const pipeline of pipelines) {
    await migratePipeline(pipeline.id, source.stages, removedSlugs, mappings);
  }

  return preview;
}

export async function tryAutoSyncLinkedFork(forkId: string, userId: string) {
  const preview = await buildSyncPreview(forkId, userId);
  if (!preview) return { applied: false, pending: false };

  if (preview.requiresWizard) {
    await prisma.userTemplate.update({
      where: { id: forkId },
      data: { pendingSourceSync: true },
    });
    return { applied: false, pending: true };
  }

  await applyTemplateSync(forkId, userId, {});
  return { applied: true, pending: false };
}
