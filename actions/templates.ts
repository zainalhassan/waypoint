"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { syncAllLinkedForks } from "@/lib/marketplace/syncTemplate";
import { prisma } from "@/lib/prisma";
import { buildStagesFromInput } from "@/lib/pipelines/stageColors";
import { parseTemplateFormData } from "@/lib/templates/parseTemplateForm";

export type ActionState = { error?: string; success?: boolean };

function validateStageSlugs(definitions: ReturnType<typeof buildStagesFromInput>) {
  const slugs = definitions.map((s) => s.slug);
  if (new Set(slugs).size !== slugs.length) {
    return "Stage names must produce unique slugs";
  }
  if (!definitions.some((s) => s.isEntry)) {
    definitions[0].isEntry = true;
  }
  return null;
}

async function requireOwnedTemplate(templateId: string, userId: string) {
  return prisma.userTemplate.findFirst({
    where: { id: templateId, userId },
    include: { stages: { orderBy: { sortOrder: "asc" } } },
  });
}

export async function createUserTemplate(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const parsed = parseTemplateFormData(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const definitions = buildStagesFromInput(parsed.data.stages);
  const slugError = validateStageSlugs(definitions);
  if (slugError) return { error: slugError };

  await prisma.userTemplate.create({
    data: {
      userId: session.user.id,
      name: parsed.data.name,
      description: parsed.data.description,
      stages: {
        create: definitions.map((stage) => ({
          name: stage.name,
          slug: stage.slug,
          sortOrder: stage.sortOrder,
          isEntry: stage.isEntry ?? false,
          isTerminal: stage.isTerminal ?? false,
          color: stage.color,
        })),
      },
    },
  });

  revalidatePath("/templates");
  revalidatePath("/pipelines/new");
  redirect("/templates");
}

export async function updateUserTemplate(
  templateId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const template = await requireOwnedTemplate(templateId, session.user.id);
  if (!template) {
    return { error: "Template not found" };
  }
  if (template.isLinkedToSource) {
    return { error: "Unlink this template before editing, or sync to get the latest from the source." };
  }

  const parsed = parseTemplateFormData(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const definitions = buildStagesFromInput(parsed.data.stages);
  const slugError = validateStageSlugs(definitions);
  if (slugError) return { error: slugError };

  await prisma.$transaction(async (tx) => {
    await tx.userTemplateStage.deleteMany({ where: { userTemplateId: templateId } });
    await tx.userTemplate.update({
      where: { id: templateId },
      data: {
        name: parsed.data.name,
        description: parsed.data.description,
        stages: {
          create: definitions.map((stage) => ({
            name: stage.name,
            slug: stage.slug,
            sortOrder: stage.sortOrder,
            isEntry: stage.isEntry ?? false,
            isTerminal: stage.isTerminal ?? false,
            color: stage.color,
          })),
        },
      },
    });
  });

  if (template.isPublic) {
    const { applied, pending } = await syncAllLinkedForks(templateId);
    if (pending > 0 && applied === 0) {
      // Linked forks with data conflicts will review via the sync wizard.
    }
  }

  revalidatePath("/templates");
  revalidatePath(`/templates/${templateId}/edit`);
  revalidatePath("/pipelines/new");
  revalidatePath("/marketplace");
  if (template.isPublic) {
    revalidatePath(`/marketplace/${templateId}`);
  }
  redirect("/templates");
}

export async function unlinkTemplate(templateId: string): Promise<ActionState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const template = await requireOwnedTemplate(templateId, session.user.id);
  if (!template) {
    return { error: "Template not found" };
  }
  if (!template.isLinkedToSource) {
    return { error: "Template is already independent" };
  }

  await prisma.userTemplate.update({
    where: { id: templateId },
    data: { isLinkedToSource: false },
  });

  revalidatePath("/templates");
  revalidatePath(`/templates/${templateId}/edit`);
  return { success: true };
}

export async function syncLinkedTemplate(templateId: string): Promise<ActionState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const { syncTemplateFromSource } = await import("@/lib/marketplace/syncTemplate");

  try {
    await syncTemplateFromSource(templateId, session.user.id);
  } catch (error) {
    if (error instanceof Error && error.message === "WIZARD_REQUIRED") {
      redirect(`/templates/${templateId}/sync`);
    }
    return {
      error: error instanceof Error ? error.message : "Could not sync template",
    };
  }

  revalidatePath("/templates");
  revalidatePath("/pipelines/new");
  revalidatePath(`/templates/${templateId}/sync`);
  return { success: true };
}

export async function applyTemplateSyncWithMappings(
  templateId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const mappings: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (key.startsWith("mapping.")) {
      const slug = key.replace("mapping.", "");
      mappings[slug] = String(value);
    }
  }

  const { applyTemplateSync } = await import("@/lib/templates/applyTemplateSync");

  try {
    await applyTemplateSync(templateId, session.user.id, mappings);
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Could not apply sync",
    };
  }

  revalidatePath("/templates");
  revalidatePath("/pipelines/new");
  revalidatePath(`/templates/${templateId}/sync`);
  redirect("/templates?synced=1");
}

export async function deleteUserTemplate(templateId: string): Promise<ActionState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const template = await requireOwnedTemplate(templateId, session.user.id);
  if (!template) {
    return { error: "Template not found" };
  }

  await prisma.userTemplate.delete({ where: { id: templateId } });

  revalidatePath("/templates");
  revalidatePath("/pipelines/new");
  return {};
}
