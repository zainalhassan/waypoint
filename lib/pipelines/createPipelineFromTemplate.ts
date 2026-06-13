import { PipelineTemplate } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { PIPELINE_TEMPLATES } from "@/lib/pipelines/templates";

export async function createPipelineFromTemplate(
  userId: string,
  name: string,
  template: PipelineTemplate,
) {
  const definition = PIPELINE_TEMPLATES[template];

  return prisma.$transaction(async (tx) => {
    const pipeline = await tx.pipeline.create({
      data: {
        userId,
        name,
        template,
        stages: {
          create: definition.stages.map((stage) => ({
            name: stage.name,
            slug: stage.slug,
            sortOrder: stage.sortOrder,
            isEntry: stage.isEntry ?? false,
            isTerminal: stage.isTerminal ?? false,
            color: stage.color,
          })),
        },
      },
      include: { stages: { orderBy: { sortOrder: "asc" } } },
    });

    return pipeline;
  });
}

export async function getPipelineForUser(
  pipelineId: string,
  userId: string,
) {
  return prisma.pipeline.findFirst({
    where: { id: pipelineId, userId },
    include: {
      stages: { orderBy: { sortOrder: "asc" } },
      items: {
        include: { currentStage: true },
        orderBy: { updatedAt: "desc" },
      },
    },
  });
}

export async function getUserPipelines(userId: string) {
  return prisma.pipeline.findMany({
    where: { userId, isArchived: false },
    include: {
      _count: { select: { items: true } },
      stages: true,
      items: { select: { currentStageId: true, currentStage: true } },
    },
    orderBy: { updatedAt: "desc" },
  });
}
