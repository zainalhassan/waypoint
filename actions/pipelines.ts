"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { PipelineTemplate } from "@prisma/client";
import { auth } from "@/lib/auth";
import { createPipelineFromTemplate } from "@/lib/pipelines/createPipelineFromTemplate";
import { createPipelineSchema } from "@/lib/validations";

export type ActionState = { error?: string };

export async function createPipeline(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const parsed = createPipelineSchema.safeParse({
    name: formData.get("name"),
    template: formData.get("template"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  if (parsed.data.template === PipelineTemplate.CUSTOM) {
    return { error: "Custom pipelines are not available yet" };
  }

  const pipeline = await createPipelineFromTemplate(
    session.user.id,
    parsed.data.name,
    parsed.data.template,
  );

  revalidatePath("/");
  redirect(`/pipelines/${pipeline.id}`);
}
