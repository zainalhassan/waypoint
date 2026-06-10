import Link from "next/link";
import { auth } from "@/lib/auth";
import { getUserTemplates } from "@/lib/pipelines/createPipelineFromUserTemplate";
import { toTemplateMetrics } from "@/lib/marketplace/metrics";
import { DeleteTemplateButton } from "@/components/DeleteTemplateButton";
import { PublishTemplateButton } from "@/components/PublishTemplateButton";
import { TemplateLinkActions } from "@/components/TemplateLinkActions";
import { TemplateMetrics } from "@/components/TemplateMetrics";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default async function TemplatesPage({
  searchParams,
}: {
  searchParams: Promise<{ copied?: string; linked?: string; synced?: string }>;
}) {
  const session = await auth();
  const { copied, linked, synced } = await searchParams;
  const templates = await getUserTemplates(session!.user!.id);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">My templates</h1>
          <p className="text-muted-foreground">
            Reusable stage flows — share them on the{" "}
            <Link href="/marketplace" className="text-primary hover:underline">
              marketplace
            </Link>
            .
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/marketplace" className={buttonVariants({ variant: "outline" })}>
            Browse marketplace
          </Link>
          <Link href="/templates/new" className={buttonVariants()}>
            New template
          </Link>
        </div>
      </div>

      {synced && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-900 dark:border-green-900 dark:bg-green-950 dark:text-green-100">
          Template synced. Your pipelines were updated and items in removed stages were moved.
        </div>
      )}

      {copied && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-900 dark:border-green-900 dark:bg-green-950 dark:text-green-100">
          {linked
            ? "Linked copy saved. It will stay in sync when the author updates the original — use Sync now anytime."
            : "Independent copy saved. You can edit it freely from your templates list."}
        </div>
      )}

      {templates.length === 0 ? (
        <div className="rounded-lg border border-dashed p-10 text-center">
          <p className="font-medium">No templates yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Create your own or{" "}
            <Link href="/marketplace" className="text-primary hover:underline">
              copy one from the marketplace
            </Link>
            .
          </p>
          <Link href="/templates/new" className={cn(buttonVariants(), "mt-4 inline-flex")}>
            Create your first template
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {templates.map((template) => (
            <Card key={template.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <CardTitle className="text-base">{template.name}</CardTitle>
                      {template.isPublic && <Badge variant="secondary">Public</Badge>}
                      {template.isLinkedToSource && (
                        <Badge variant="outline">Linked</Badge>
                      )}
                      {template.pendingSourceSync && (
                        <Badge variant="destructive">Sync required</Badge>
                      )}
                      {template.forkedFromId && !template.isLinkedToSource && (
                        <Badge variant="outline">Independent copy</Badge>
                      )}
                    </div>
                    {template.description && (
                      <CardDescription>{template.description}</CardDescription>
                    )}
                  </div>
                  <DeleteTemplateButton templateId={template.id} />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  {template.stages.map((s) => s.name).join(" → ")}
                </p>
                {template.isPublic && (
                  <TemplateMetrics metrics={toTemplateMetrics(template)} compact />
                )}
                <div className="flex flex-wrap items-center gap-2">
                  <PublishTemplateButton
                    templateId={template.id}
                    isPublic={template.isPublic}
                  />
                  {template.isPublic && (
                    <Link
                      href={`/marketplace/${template.id}`}
                      className="text-sm text-primary hover:underline"
                    >
                      View on marketplace
                    </Link>
                  )}
                </div>
                <TemplateLinkActions
                  templateId={template.id}
                  isLinkedToSource={template.isLinkedToSource}
                  forkedFromId={template.forkedFromId}
                  pendingSourceSync={template.pendingSourceSync}
                  sourceName={template.forkedFrom?.name}
                />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
