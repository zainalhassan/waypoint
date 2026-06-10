import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { getPublicTemplate } from "@/lib/marketplace/queries";
import { CopyTemplateButton } from "@/components/CopyTemplateButton";
import { TemplateComments } from "@/components/TemplateComments";
import { TemplateLikeButton } from "@/components/TemplateLikeButton";
import { TemplateMetrics } from "@/components/TemplateMetrics";
import { TemplateRatingForm } from "@/components/TemplateRatingForm";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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
      <div>
        <Link href="/marketplace" className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to marketplace
        </Link>
        <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{template.name}</h1>
            <p className="text-muted-foreground">by {template.authorName}</p>
            {template.description && (
              <p className="mt-2 max-w-2xl text-sm">{template.description}</p>
            )}
          </div>
          <CopyTemplateButton templateId={template.id} isOwner={template.isOwner} />
        </div>
      </div>

      <TemplateMetrics metrics={template.metrics} />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Stages</CardTitle>
            <CardDescription>{template.stages.length} stages in this flow</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {template.stages.map((stage, index) => (
              <div
                key={stage.id}
                className="flex items-center gap-3 rounded-md border px-3 py-2 text-sm"
              >
                <span className="text-muted-foreground">{index + 1}.</span>
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: stage.color ?? "#6b7280" }}
                />
                <span className="font-medium">{stage.name}</span>
                {stage.isEntry && <Badge variant="outline">Entry</Badge>}
                {stage.isTerminal && <Badge variant="secondary">Terminal</Badge>}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rate & like</CardTitle>
            <CardDescription>Help others discover great templates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
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
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Comments ({template.metrics.commentCount})</CardTitle>
        </CardHeader>
        <CardContent>
          <TemplateComments
            templateId={template.id}
            comments={template.comments}
            currentUserId={session!.user!.id}
          />
        </CardContent>
      </Card>
    </div>
  );
}
