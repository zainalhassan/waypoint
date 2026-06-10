import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getPipelineForUser } from "@/lib/pipelines/createPipelineFromTemplate";
import { StageBadge } from "@/components/StageBadge";
import { StageTimeline } from "@/components/StageTimeline";
import { StageUpdateForm } from "@/components/StageUpdateForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
          <p className="text-muted-foreground">{item.subtitle}</p>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {item.externalUrl && (
              <p>
                <span className="text-muted-foreground">Link: </span>
                <a
                  href={item.externalUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary hover:underline"
                >
                  {item.externalUrl}
                </a>
              </p>
            )}
            {item.notes && (
              <p className="whitespace-pre-wrap">{item.notes}</p>
            )}
            <p className="text-muted-foreground">
              Started {item.startedAt.toLocaleDateString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Update stage</CardTitle>
          </CardHeader>
          <CardContent>
            <StageUpdateForm
              pipelineId={pipelineId}
              itemId={itemId}
              stages={pipeline.stages}
              currentStageId={item.currentStageId}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <StageTimeline events={item.stageEvents} />
        </CardContent>
      </Card>
    </div>
  );
}
