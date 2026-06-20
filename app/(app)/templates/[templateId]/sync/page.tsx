import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { buildSyncPreview } from "@/lib/templates/syncPreview";
import { TemplateSyncWizard } from "@/components/TemplateSyncWizard";
import { PageHeader } from "@/components/transit/PageHeader";
import { TransitBanner } from "@/components/transit/TransitBanner";

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
      <PageHeader
        title="Sync template"
        description={
          <>
            Match <span className="font-medium">{preview.templateName}</span> with updates from{" "}
            <span className="font-medium">{preview.sourceName}</span>.
          </>
        }
        backHref="/templates"
        backLabel="Templates"
      />

      {preview.pendingSourceSync && (
        <TransitBanner variant="warning">
          The author updated this template. Review the changes before applying — especially if
          stages with your data were removed.
        </TransitBanner>
      )}

      <TemplateSyncWizard preview={preview} />
    </div>
  );
}
