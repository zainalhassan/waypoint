import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { buildSyncPreview } from "@/lib/templates/syncPreview";
import { TemplateSyncWizard } from "@/components/TemplateSyncWizard";
export default async function TemplateSyncPage({
  params,
}: {
  params: Promise<{ templateId: string }>;
}) {
  const { templateId } = await params;
  const session = await auth();
  const preview = await buildSyncPreview(templateId, session!.user!.id);

  if (!preview) notFound();

  const hasChanges =
    preview.added.length > 0 ||
    preview.removed.length > 0 ||
    preview.updated.length > 0 ||
    preview.pendingSourceSync;

  if (!hasChanges) {
    redirect("/templates");
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link href="/templates" className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to templates
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Sync template</h1>
        <p className="text-muted-foreground">
          Match <span className="font-medium">{preview.templateName}</span> with updates from{" "}
          <span className="font-medium">{preview.sourceName}</span>.
        </p>
      </div>

      {preview.pendingSourceSync && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100">
          The author updated this template. Review the changes before applying — especially if
          stages with your data were removed.
        </div>
      )}

      <TemplateSyncWizard preview={preview} />
    </div>
  );
}
