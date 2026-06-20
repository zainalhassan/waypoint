import Link from "next/link";
import { auth } from "@/lib/auth";
import { getUserTemplates } from "@/lib/pipelines/createPipelineFromUserTemplate";
import { toTemplateMetrics } from "@/lib/marketplace/metrics";
import { DeleteTemplateButton } from "@/components/DeleteTemplateButton";
import { PublishTemplateButton } from "@/components/PublishTemplateButton";
import { TemplateLinkActions } from "@/components/TemplateLinkActions";
import { TemplateMetrics } from "@/components/TemplateMetrics";
import { EmptyState } from "@/components/transit/EmptyState";
import { HeroCard } from "@/components/transit/HeroCard";
import { PageHeader } from "@/components/transit/PageHeader";
import { TransitBanner } from "@/components/transit/TransitBanner";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const HEADER_COLORS = [
  "var(--color-route-blue)",
  "var(--color-route-purple)",
  "var(--color-route-teal)",
  "var(--color-route-pink)",
  "var(--color-route-yellow)",
  "var(--color-route-indigo)",
];

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
      <PageHeader
        title="My templates"
        description={
          <>
            Reusable stage flows — share them on the{" "}
            <Link href="/marketplace" className="font-medium text-primary hover:underline">
              marketplace
            </Link>
            .
          </>
        }
      >
        <Link href="/marketplace" className={buttonVariants({ variant: "outline" })}>
          Browse marketplace
        </Link>
        <Link href="/templates/new" className={buttonVariants()}>
          New template
        </Link>
      </PageHeader>

      {synced && (
        <TransitBanner>
          Template synced. Your pipelines were updated and items in removed stages were moved.
        </TransitBanner>
      )}

      {copied && (
        <TransitBanner>
          {linked
            ? "Linked copy saved. It will stay in sync when the author updates the original — use Sync now anytime."
            : "Independent copy saved. You can edit it freely from your templates list."}
        </TransitBanner>
      )}

      {templates.length === 0 ? (
        <EmptyState
          title="No templates yet"
          description={
            <>
              Create your own or{" "}
              <Link href="/marketplace" className="font-medium text-primary hover:underline">
                copy one from the marketplace
              </Link>
              .
            </>
          }
        >
          <Link href="/templates/new" className={cn(buttonVariants())}>
            Create your first template
          </Link>
        </EmptyState>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {templates.map((template, index) => {
            const statusBadges = [
              template.isPublic && { label: "Public", variant: "secondary" as const },
              template.isLinkedToSource && { label: "Linked", variant: "outline" as const },
              template.pendingSourceSync && { label: "Sync required", variant: "destructive" as const },
              template.forkedFromId &&
                !template.isLinkedToSource && { label: "Independent copy", variant: "outline" as const },
            ].filter(Boolean) as { label: string; variant: "secondary" | "outline" | "destructive" }[];

            return (
              <HeroCard
                key={template.id}
                headerLabel={template.isPublic ? "Published" : "Private"}
                headerColor={HEADER_COLORS[index % HEADER_COLORS.length]}
                heroLabel="Stages"
                heroValue={String(template.stages.length)}
                meta={[
                  template.name,
                  ...(template.description ? [template.description] : []),
                  template.stages.map((s) => s.name).join(" → "),
                ]}
              >
                <div className="flex flex-wrap gap-1.5">
                  {statusBadges.map(({ label, variant }) => (
                    <Badge key={label} variant={variant}>
                      {label}
                    </Badge>
                  ))}
                </div>
                {template.isPublic && (
                  <TemplateMetrics
                    metrics={toTemplateMetrics({
                      likeCount: template.likeCount,
                      copyCount: template.copyCount,
                      commentCount: template.commentCount,
                      ratingSum: template.ratingSum,
                      ratingCount: template.ratingCount,
                      pipelineCount: template._count.pipelines,
                    })}
                    compact
                  />
                )}
                {!template.isPublic && template._count.pipelines > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Used in {template._count.pipelines} pipeline
                    {template._count.pipelines === 1 ? "" : "s"}
                  </p>
                )}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <PublishTemplateButton
                    templateId={template.id}
                    isPublic={template.isPublic}
                  />
                  {template.isPublic && (
                    <Link
                      href={`/marketplace/${template.id}`}
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      View on marketplace
                    </Link>
                  )}
                  <DeleteTemplateButton templateId={template.id} />
                </div>
                <TemplateLinkActions
                  templateId={template.id}
                  isLinkedToSource={template.isLinkedToSource}
                  forkedFromId={template.forkedFromId}
                  pendingSourceSync={template.pendingSourceSync}
                  sourceName={template.forkedFrom?.name}
                />
              </HeroCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
