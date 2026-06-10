import { prisma } from "@/lib/prisma";

export async function copyPublicTemplate(userId: string, sourceTemplateId: string) {
  const source = await prisma.userTemplate.findFirst({
    where: { id: sourceTemplateId, isPublic: true },
    include: { stages: { orderBy: { sortOrder: "asc" } } },
  });

  if (!source) {
    throw new Error("Template not found");
  }

  return prisma.$transaction(async (tx) => {
    const copy = await tx.userTemplate.create({
      data: {
        userId,
        name: source.name,
        description: source.description,
        forkedFromId: source.id,
        stages: {
          create: source.stages.map((stage) => ({
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

    await tx.userTemplate.update({
      where: { id: source.id },
      data: { copyCount: { increment: 1 } },
    });

    return copy;
  });
}
