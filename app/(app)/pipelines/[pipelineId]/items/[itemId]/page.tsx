import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getPipelineForUser } from "@/lib/pipelines/createPipelineFromTemplate";
import { ItemMetadataDisplay } from "@/components/ItemMetadataDisplay";
import { StageBadge } from "@/components/StageBadge";
import { StageTimeline } from "@/components/StageTimeline";
import { StageUpdateForm } from "@/components/StageUpdateForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function ItemDetailPage({
  params,
}: {
  params: Promise<{ pipelineId: string; itemId: string }>;
}) {
  const { pipelineId, itemId } = await params;
  const session = await auth();
  const pipeline = await getPipelineForUser(pipelineId, session!.user!.id);

  if (!pipeline) notFound();

  const item = await prisma.item.findFirst({
    where: { id: itemId, pipelineId },
    include: {
      currentStage: true,
      stageEvents: {
        include: { fromStage: true, toStage: true },
        orderBy: { occurredAt: "desc" },
      },
    },
  });

  if (!item) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/pipelines/${pipelineId}`}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to {pipeline.name}
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">{item.title}</h1>
          <StageBadge
            name={item.currentStage.name}
            color={item.currentStage.color}
          />
        </div>
        {item.subtitle && (
          <p className="mt-1 text-muted-foreground">{item.subtitle}</p>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
            <CardDescription>Key information about this item</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <ItemMetadataDisplay
              template={pipeline.template}
              metadata={item.metadata}
            />
            {item.externalUrl && (
              <p>
                <span className="text-muted-foreground">Link: </span>
                <a
                  href={item.externalUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-primary hover:underline"
                >
                  View posting →
                </a>
              </p>
            )}
            {item.notes && (
              <div>
                <p className="mb-1 text-muted-foreground">Notes</p>
                <p className="whitespace-pre-wrap rounded-md bg-muted/30 p-3">
                  {item.notes}
                </p>
              </div>
            )}
            <p className="text-muted-foreground">
              Tracking since {item.startedAt.toLocaleDateString(undefined, {
                dateStyle: "medium",
              })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Update stage</CardTitle>
            <CardDescription>
              Move this item as progress changes — each update is logged in your timeline.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <StageUpdateForm
              pipelineId={pipelineId}
              itemId={itemId}
              stages={pipeline.stages.filter(
                (s) => !s.isArchived || s.id === item.currentStageId,
              )}
              currentStageId={item.currentStageId}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Timeline</CardTitle>
          <CardDescription>Every stage change you&apos;ve made</CardDescription>
        </CardHeader>
        <CardContent>
          <StageTimeline events={item.stageEvents} />
        </CardContent>
      </Card>
    </div>
  );
}
