import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { getPublicTemplate } from "@/lib/marketplace/queries";
import { CopyTemplateButton } from "@/components/CopyTemplateButton";
import { TemplateComments } from "@/components/TemplateComments";
import { TemplateLikeButton } from "@/components/TemplateLikeButton";
import { TemplateMetrics } from "@/components/TemplateMetrics";
import { TemplateRatingForm } from "@/components/TemplateRatingForm";
import { PageHeader } from "@/components/transit/PageHeader";
import { RouteChip } from "@/components/transit/RouteChip";
import { SectionCard } from "@/components/transit/SectionCard";
import { Badge } from "@/components/ui/badge";

export default async function MarketplaceTemplatePage({
  params,
}: {
  params: Promise<{ templateId: string }>;
}) {
  const { templateId } = await params;
  const session = await auth();
  const template = await getPublicTemplate(templateId, session!.user!.id);

  if (!template) notFound();

  return (
    <div className="space-y-6">
      <PageHeader
        title={template.name}
        description={`by ${template.authorName}${template.description ? ` · ${template.description}` : ""}`}
        backHref="/marketplace"
        backLabel="Marketplace"
      >
        <CopyTemplateButton templateId={template.id} isOwner={template.isOwner} />
      </PageHeader>

      <TemplateMetrics metrics={template.metrics} />

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard
          title="Stages"
          description={`${template.stages.length} stages in this flow`}
          headerColor="var(--color-route-indigo)"
        >
          <div className="space-y-2">
            {template.stages.map((stage, index) => (
              <div
                key={stage.id}
                className="flex flex-wrap items-center gap-2 rounded-[var(--radius-button)] border border-border px-3 py-2 text-sm"
              >
                <span className="text-muted-foreground">{index + 1}.</span>
                <RouteChip label={stage.name} color={stage.color} />
                {stage.isEntry && <Badge variant="outline">Entry</Badge>}
                {stage.isTerminal && <Badge variant="secondary">Terminal</Badge>}
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          title="Rate & like"
          description="Help others discover great templates"
          headerColor="var(--color-route-pink)"
        >
          <TemplateLikeButton
            templateId={template.id}
            liked={template.viewerLiked}
            likeCount={template.metrics.likeCount}
            isOwner={template.isOwner}
          />
          <TemplateRatingForm
            templateId={template.id}
            currentRating={template.viewerRating}
            isOwner={template.isOwner}
          />
        </SectionCard>
      </div>

      <SectionCard
        title={`Comments (${template.metrics.commentCount})`}
        headerColor="var(--color-route-teal)"
      >
        <TemplateComments
          templateId={template.id}
          comments={template.comments}
          currentUserId={session!.user!.id}
        />
      </SectionCard>
    </div>
  );
}
