"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { PipelineTemplate } from "@prisma/client";
import { auth } from "@/lib/auth";
import { createPipelineFromTemplate } from "@/lib/pipelines/createPipelineFromTemplate";
import { createPipelineFromUserTemplate } from "@/lib/pipelines/createPipelineFromUserTemplate";
import { prisma } from "@/lib/prisma";
import { createPipelineSchema, updatePipelineSchema } from "@/lib/validations";

export type ActionState = { error?: string; success?: boolean };

function parseSource(source: string | null): {
  type: "builtin" | "user";
  value: string;
} | null {
  if (!source) return null;
  if (source.startsWith("builtin:")) {
    return { type: "builtin", value: source.slice("builtin:".length) };
  }
  if (source.startsWith("user:")) {
    return { type: "user", value: source.slice("user:".length) };
  }
  return null;
}

export async function createPipeline(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const source = parseSource(formData.get("source")?.toString() ?? null);
  if (!source) {
    return { error: "Select a template" };
  }

  const parsed = createPipelineSchema.safeParse({
    name: formData.get("name"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  let pipeline;

  if (source.type === "user") {
    try {
      pipeline = await createPipelineFromUserTemplate(
        session.user.id,
        parsed.data.name,
        source.value,
      );
    } catch {
      return { error: "Template not found" };
    }
  } else {
    const template = source.value as PipelineTemplate;
    if (!Object.values(PipelineTemplate).includes(template) || template === "CUSTOM") {
      return { error: "Invalid template" };
    }

    pipeline = await createPipelineFromTemplate(
      session.user.id,
      parsed.data.name,
      template,
    );
  }

  revalidatePath("/");
  redirect(`/pipelines/${pipeline.id}`);
}

async function requireOwnedPipeline(pipelineId: string, userId: string) {
  return prisma.pipeline.findFirst({
    where: { id: pipelineId, userId },
  });
}

export async function updatePipeline(
  pipelineId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const pipeline = await requireOwnedPipeline(pipelineId, session.user.id);
  if (!pipeline) return { error: "Pipeline not found" };

  const parsed = updatePipelineSchema.safeParse({
    name: formData.get("name"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  await prisma.pipeline.update({
    where: { id: pipelineId },
    data: { name: parsed.data.name },
  });

  revalidatePath("/");
  revalidatePath(`/pipelines/${pipelineId}`);
  return { success: true };
}

export async function archivePipeline(pipelineId: string): Promise<ActionState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const pipeline = await requireOwnedPipeline(pipelineId, session.user.id);
  if (!pipeline) return { error: "Pipeline not found" };

  await prisma.pipeline.update({
    where: { id: pipelineId },
    data: { isArchived: true },
  });

  revalidatePath("/");
  redirect("/");
}

export async function deletePipeline(pipelineId: string): Promise<ActionState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const pipeline = await requireOwnedPipeline(pipelineId, session.user.id);
  if (!pipeline) return { error: "Pipeline not found" };

  await prisma.pipeline.delete({ where: { id: pipelineId } });

  revalidatePath("/");
  redirect("/");
}
