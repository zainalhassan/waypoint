"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { PipelineTemplate } from "@prisma/client";
import { auth } from "@/lib/auth";
import { getMetadataSchema } from "@/lib/items/metadataSchemas";
import { prisma } from "@/lib/prisma";
import { pickEntryStage } from "@/lib/pipelines/pickEntryStage";
import { getUserDefaultCurrency } from "@/lib/user";
import { createItemSchema, updateItemSchema, updateItemStageSchema } from "@/lib/validations";

export type ActionState = { error?: string; success?: boolean };

async function requirePipeline(pipelineId: string, userId: string) {
  return prisma.pipeline.findFirst({
    where: { id: pipelineId, userId },
    include: { stages: { orderBy: { sortOrder: "asc" } } },
  });
}

export async function createItem(
  pipelineId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const pipeline = await requirePipeline(pipelineId, session.user.id);
  if (!pipeline) return { error: "Pipeline not found" };

  const parsed = createItemSchema.safeParse({
    title: formData.get("title"),
    subtitle: formData.get("subtitle") || undefined,
    notes: formData.get("notes") || undefined,
    externalUrl: formData.get("externalUrl") || undefined,
    startedAt: formData.get("startedAt") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const defaultCurrency = await getUserDefaultCurrency(session.user.id);
  const metadataParsed = parseMetadataFromForm(
    formData,
    pipeline.template,
    defaultCurrency,
  );
  if (!metadataParsed.success) {
    return { error: "Invalid metadata fields" };
  }

  const entryStage = pickEntryStage(pipeline.stages);
  if (!entryStage) return { error: "Pipeline has no active stages" };

  const item = await prisma.$transaction(async (tx) => {
    const created = await tx.item.create({
      data: {
        pipelineId,
        title: parsed.data.title,
        subtitle: parsed.data.subtitle,
        notes: parsed.data.notes,
        externalUrl: parsed.data.externalUrl || null,
        startedAt: parsed.data.startedAt
          ? new Date(parsed.data.startedAt)
          : new Date(),
        currentStageId: entryStage.id,
        metadata: metadataParsed.data as object,
      },
    });

    await tx.stageEvent.create({
      data: {
        itemId: created.id,
        fromStageId: null,
        toStageId: entryStage.id,
      },
    });

    return created;
  });

  revalidatePath(`/pipelines/${pipelineId}`);
  redirect(`/pipelines/${pipelineId}/items/${item.id}`);
}

function parseMetadataFromForm(
  formData: FormData,
  template: PipelineTemplate,
  defaultCurrency: string,
) {
  const metadataInput: Record<string, unknown> = {};
  for (const [key, value] of formData.entries()) {
    if (key.startsWith("metadata.")) {
      metadataInput[key.replace("metadata.", "")] = value;
    }
  }

  if (!metadataInput.salaryCurrency) {
    metadataInput.salaryCurrency = defaultCurrency;
  }
  if (!metadataInput.dealCurrency) {
    metadataInput.dealCurrency = defaultCurrency;
  }
  if (!metadataInput.currency) {
    metadataInput.currency = defaultCurrency;
  }

  const metadataSchema = getMetadataSchema(template);
  return metadataSchema.safeParse(metadataInput);
}

export async function updateItem(
  pipelineId: string,
  itemId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const pipeline = await requirePipeline(pipelineId, session.user.id);
  if (!pipeline) return { error: "Pipeline not found" };

  const item = await prisma.item.findFirst({
    where: { id: itemId, pipelineId },
  });
  if (!item) return { error: "Item not found" };

  const parsed = updateItemSchema.safeParse({
    title: formData.get("title"),
    subtitle: formData.get("subtitle") || undefined,
    notes: formData.get("notes") || undefined,
    externalUrl: formData.get("externalUrl") || undefined,
    startedAt: formData.get("startedAt") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const defaultCurrency = await getUserDefaultCurrency(session.user.id);
  const metadataParsed = parseMetadataFromForm(
    formData,
    pipeline.template,
    defaultCurrency,
  );
  if (!metadataParsed.success) {
    return { error: "Invalid metadata fields" };
  }

  await prisma.item.update({
    where: { id: itemId },
    data: {
      title: parsed.data.title,
      subtitle: parsed.data.subtitle,
      notes: parsed.data.notes,
      externalUrl: parsed.data.externalUrl || null,
      startedAt: parsed.data.startedAt
        ? new Date(parsed.data.startedAt)
        : item.startedAt,
      metadata: metadataParsed.data as object,
    },
  });

  revalidatePath(`/pipelines/${pipelineId}`);
  revalidatePath(`/pipelines/${pipelineId}/items/${itemId}`);
  revalidatePath(`/pipelines/${pipelineId}/analytics`);
  return { success: true };
}

export async function deleteItem(
  pipelineId: string,
  itemId: string,
): Promise<ActionState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const pipeline = await requirePipeline(pipelineId, session.user.id);
  if (!pipeline) return { error: "Pipeline not found" };

  const item = await prisma.item.findFirst({
    where: { id: itemId, pipelineId },
  });
  if (!item) return { error: "Item not found" };

  await prisma.item.delete({ where: { id: itemId } });

  revalidatePath(`/pipelines/${pipelineId}`);
  revalidatePath(`/pipelines/${pipelineId}/analytics`);
  redirect(`/pipelines/${pipelineId}`);
}

export async function moveItemToStage(
  pipelineId: string,
  itemId: string,
  stageId: string,
): Promise<ActionState> {
  const formData = new FormData();
  formData.set("stageId", stageId);
  return updateItemStage(pipelineId, itemId, {}, formData);
}

export async function updateItemStage(
  pipelineId: string,
  itemId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const pipeline = await requirePipeline(pipelineId, session.user.id);
  if (!pipeline) return { error: "Pipeline not found" };

  const parsed = updateItemStageSchema.safeParse({
    stageId: formData.get("stageId"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const item = await prisma.item.findFirst({
    where: { id: itemId, pipelineId },
  });
  if (!item) return { error: "Item not found" };

  const newStage = pipeline.stages.find((s) => s.id === parsed.data.stageId);
  if (!newStage) return { error: "Invalid stage" };

  if (newStage.isArchived) {
    return { error: "Cannot move items to a removed stage" };
  }

  if (item.currentStageId === newStage.id) {
    return { error: "Item is already in this stage" };
  }

  await prisma.$transaction(async (tx) => {
    await tx.stageEvent.create({
      data: {
        itemId: item.id,
        fromStageId: item.currentStageId,
        toStageId: newStage.id,
      },
    });
    await tx.item.update({
      where: { id: item.id },
      data: { currentStageId: newStage.id },
    });
  });

  revalidatePath(`/pipelines/${pipelineId}`);
  revalidatePath(`/pipelines/${pipelineId}/items/${itemId}`);
  revalidatePath(`/pipelines/${pipelineId}/analytics`);
  return { success: true };
}
