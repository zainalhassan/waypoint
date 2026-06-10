"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildStagesFromInput } from "@/lib/pipelines/stageColors";

export type ActionState = { error?: string };

const stageSchema = z.object({
  name: z.string().min(1, "Stage name is required").max(50),
  isEntry: z.boolean().optional(),
  isTerminal: z.boolean().optional(),
});

const createTemplateSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(300).optional(),
  stages: z.array(stageSchema).min(2, "Add at least two stages"),
});

export async function createUserTemplate(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const stageNames = formData.getAll("stageName").map(String);
  const stageTerminal = formData.getAll("stageTerminal").map((v) => String(v) === "on");
  const stageEntry = formData.getAll("stageEntry").map((v) => String(v) === "on");

  const stages = stageNames
    .map((name, i) => ({
      name: name.trim(),
      isEntry: stageEntry[i] ?? i === 0,
      isTerminal: stageTerminal[i] ?? false,
    }))
    .filter((s) => s.name.length > 0);

  const parsed = createTemplateSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    stages,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const definitions = buildStagesFromInput(parsed.data.stages);

  const slugs = definitions.map((s) => s.slug);
  if (new Set(slugs).size !== slugs.length) {
    return { error: "Stage names must produce unique slugs" };
  }

  if (!definitions.some((s) => s.isEntry)) {
    definitions[0].isEntry = true;
  }

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

export async function deleteUserTemplate(templateId: string): Promise<ActionState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const template = await prisma.userTemplate.findFirst({
    where: { id: templateId, userId: session.user.id },
  });

  if (!template) {
    return { error: "Template not found" };
  }

  await prisma.userTemplate.delete({ where: { id: templateId } });

  revalidatePath("/templates");
  revalidatePath("/pipelines/new");
  return {};
}
