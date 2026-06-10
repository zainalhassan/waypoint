"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { copyPublicTemplate } from "@/lib/marketplace/copyTemplate";
import { prisma } from "@/lib/prisma";

export type ActionState = { error?: string; success?: boolean };

async function requirePublicTemplate(templateId: string) {
  return prisma.userTemplate.findFirst({
    where: { id: templateId, isPublic: true },
  });
}

export async function publishTemplate(templateId: string): Promise<ActionState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const template = await prisma.userTemplate.findFirst({
    where: { id: templateId, userId: session.user.id },
  });
  if (!template) return { error: "Template not found" };

  await prisma.userTemplate.update({
    where: { id: templateId },
    data: { isPublic: true, publishedAt: template.publishedAt ?? new Date() },
  });

  revalidatePath("/templates");
  revalidatePath("/marketplace");
  revalidatePath(`/marketplace/${templateId}`);
  return { success: true };
}

export async function unpublishTemplate(templateId: string): Promise<ActionState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const template = await prisma.userTemplate.findFirst({
    where: { id: templateId, userId: session.user.id },
  });
  if (!template) return { error: "Template not found" };

  await prisma.userTemplate.update({
    where: { id: templateId },
    data: { isPublic: false },
  });

  revalidatePath("/templates");
  revalidatePath("/marketplace");
  return { success: true };
}

export async function copyMarketplaceTemplate(
  templateId: string,
  linked: boolean,
): Promise<ActionState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    const copy = await copyPublicTemplate(session.user.id, templateId, linked);
    revalidatePath("/templates");
    revalidatePath("/pipelines/new");
    revalidatePath("/marketplace");
    revalidatePath(`/marketplace/${templateId}`);
    const query = linked ? `copied=${copy.id}&linked=1` : `copied=${copy.id}`;
    redirect(`/templates?${query}`);
  } catch {
    return { error: "Template not found" };
  }
}

export async function toggleTemplateLike(templateId: string): Promise<ActionState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const template = await requirePublicTemplate(templateId);
  if (!template) return { error: "Template not found" };
  if (template.userId === session.user.id) {
    return { error: "You cannot like your own template" };
  }

  const existing = await prisma.templateLike.findUnique({
    where: {
      userId_userTemplateId: { userId: session.user.id, userTemplateId: templateId },
    },
  });

  if (existing) {
    await prisma.$transaction(async (tx) => {
      await tx.templateLike.delete({ where: { id: existing.id } });
      const current = await tx.userTemplate.findUnique({
        where: { id: templateId },
        select: { likeCount: true },
      });
      if (current && current.likeCount > 0) {
        await tx.userTemplate.update({
          where: { id: templateId },
          data: { likeCount: { decrement: 1 } },
        });
      }
    });
  } else {
    await prisma.$transaction([
      prisma.templateLike.create({
        data: { userId: session.user.id, userTemplateId: templateId },
      }),
      prisma.userTemplate.update({
        where: { id: templateId },
        data: { likeCount: { increment: 1 } },
      }),
    ]);
  }

  revalidatePath("/marketplace");
  revalidatePath(`/marketplace/${templateId}`);
  return { success: true };
}

const ratingSchema = z.object({
  templateId: z.string().min(1),
  rating: z.coerce.number().int().min(1).max(5),
});

export async function rateTemplate(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const parsed = ratingSchema.safeParse({
    templateId: formData.get("templateId"),
    rating: formData.get("rating"),
  });
  if (!parsed.success) return { error: "Invalid rating" };

  const template = await requirePublicTemplate(parsed.data.templateId);
  if (!template) return { error: "Template not found" };
  if (template.userId === session.user.id) {
    return { error: "You cannot rate your own template" };
  }

  const existing = await prisma.templateRating.findUnique({
    where: {
      userId_userTemplateId: {
        userId: session.user.id,
        userTemplateId: parsed.data.templateId,
      },
    },
  });

  await prisma.$transaction(async (tx) => {
    if (existing) {
      const delta = parsed.data.rating - existing.rating;
      await tx.templateRating.update({
        where: { id: existing.id },
        data: { rating: parsed.data.rating },
      });
      if (delta !== 0) {
        await tx.userTemplate.update({
          where: { id: parsed.data.templateId },
          data: { ratingSum: { increment: delta } },
        });
      }
    } else {
      await tx.templateRating.create({
        data: {
          userId: session.user.id,
          userTemplateId: parsed.data.templateId,
          rating: parsed.data.rating,
        },
      });
      await tx.userTemplate.update({
        where: { id: parsed.data.templateId },
        data: {
          ratingSum: { increment: parsed.data.rating },
          ratingCount: { increment: 1 },
        },
      });
    }
  });

  revalidatePath("/marketplace");
  revalidatePath(`/marketplace/${parsed.data.templateId}`);
  return { success: true };
}

const commentSchema = z.object({
  templateId: z.string().min(1),
  content: z.string().min(1, "Comment cannot be empty").max(1000),
});

export async function addTemplateComment(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const parsed = commentSchema.safeParse({
    templateId: formData.get("templateId"),
    content: formData.get("content"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid comment" };
  }

  const template = await requirePublicTemplate(parsed.data.templateId);
  if (!template) return { error: "Template not found" };

  await prisma.$transaction([
    prisma.templateComment.create({
      data: {
        userId: session.user.id,
        userTemplateId: parsed.data.templateId,
        content: parsed.data.content.trim(),
      },
    }),
    prisma.userTemplate.update({
      where: { id: parsed.data.templateId },
      data: { commentCount: { increment: 1 } },
    }),
  ]);

  revalidatePath(`/marketplace/${parsed.data.templateId}`);
  revalidatePath("/marketplace");
  return { success: true };
}

export async function deleteTemplateComment(commentId: string): Promise<ActionState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const comment = await prisma.templateComment.findUnique({
    where: { id: commentId },
  });
  if (!comment || comment.userId !== session.user.id) {
    return { error: "Comment not found" };
  }

  await prisma.$transaction([
    prisma.templateComment.delete({ where: { id: commentId } }),
    prisma.userTemplate.update({
      where: { id: comment.userTemplateId },
      data: { commentCount: { decrement: 1 } },
    }),
  ]);

  revalidatePath(`/marketplace/${comment.userTemplateId}`);
  revalidatePath("/marketplace");
  return { success: true };
}
