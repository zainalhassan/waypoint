import { prisma } from "@/lib/prisma";
import { applyTemplateSync, tryAutoSyncLinkedFork } from "@/lib/templates/applyTemplateSync";
import { buildSyncPreview } from "@/lib/templates/syncPreview";

export async function syncTemplateFromSource(copyId: string, userId: string) {
  const preview = await buildSyncPreview(copyId, userId);
  if (!preview) {
    throw new Error("Template not found");
  }

  if (preview.requiresWizard) {
    await prisma.userTemplate.update({
      where: { id: copyId },
      data: { pendingSourceSync: true },
    });
    throw new Error("WIZARD_REQUIRED");
  }

  await applyTemplateSync(copyId, userId, {});
  return preview;
}

export async function syncAllLinkedForks(sourceTemplateId: string) {
  const linkedForks = await prisma.userTemplate.findMany({
    where: { forkedFromId: sourceTemplateId, isLinkedToSource: true },
    select: { id: true, userId: true },
  });

  let applied = 0;
  let pending = 0;

  for (const fork of linkedForks) {
    const result = await tryAutoSyncLinkedFork(fork.id, fork.userId);
    if (result.applied) applied += 1;
    if (result.pending) pending += 1;
  }

  return { applied, pending };
}
