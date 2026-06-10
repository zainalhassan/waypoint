import { prisma } from "@/lib/prisma";

export async function createPipelineFromUserTemplate(
  userId: string,
  name: string,
  userTemplateId: string,
) {
  const userTemplate = await prisma.userTemplate.findFirst({
    where: { id: userTemplateId, userId },
    include: { stages: { orderBy: { sortOrder: "asc" } } },
  });

  if (!userTemplate) {
    throw new Error("Template not found");
  }

  return prisma.$transaction(async (tx) => {
    return tx.pipeline.create({
      data: {
        userId,
        name,
        template: "CUSTOM",
        stages: {
          create: userTemplate.stages.map((stage) => ({
            name: stage.name,
            slug: stage.slug,
            sortOrder: stage.sortOrder,
            isEntry: stage.isEntry,
            isTerminal: stage.isTerminal,
            color: stage.color,
          })),
        },
      },
      include: { stages: { orderBy: { sortOrder: "asc" } } },
    });
  });
}

export async function getUserTemplates(userId: string) {
  return prisma.userTemplate.findMany({
    where: { userId },
    include: {
      stages: { orderBy: { sortOrder: "asc" } },
      _count: { select: { stages: true } },
    },
    orderBy: { updatedAt: "desc" },
  });
}
