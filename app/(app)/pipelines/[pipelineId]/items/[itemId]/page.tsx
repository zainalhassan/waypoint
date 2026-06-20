import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { EXTERNAL_URL_LABELS } from "@/lib/items/metadataSchemas";
import { getItemHeroMetric } from "@/lib/items/formatMetadata";
import { getPipelineForUser } from "@/lib/pipelines/createPipelineFromTemplate";
import { getUserDefaultCurrency } from "@/lib/user";
import { ItemActions } from "@/components/ItemActions";
import { ItemMetadataDisplay } from "@/components/ItemMetadataDisplay";
import { HeroCard } from "@/components/transit/HeroCard";
import { MobileShell } from "@/components/transit/MobileShell";
import { SectionCard } from "@/components/transit/SectionCard";
import { StageTimeline } from "@/components/StageTimeline";
import { StageUpdateForm } from "@/components/StageUpdateForm";

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

  const defaultCurrency = await getUserDefaultCurrency(session!.user!.id);
  const urlLabels = EXTERNAL_URL_LABELS[pipeline.template];
  const heroMetric = getItemHeroMetric(pipeline.template, item.metadata);

  const hero = (
    <div className="space-y-3">
      <Link
        href={`/pipelines/${pipelineId}`}
        className="inline-flex text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        ← Back to {pipeline.name}
      </Link>
      <HeroCard
        headerLabel={item.currentStage.name}
        headerColor={item.currentStage.color}
        heroLabel={heroMetric.label}
        heroValue={heroMetric.value}
        heroHint={heroMetric.fallback}
        meta={[
          item.title,
          ...(item.subtitle ? [item.subtitle] : []),
          `Tracking since ${item.startedAt.toLocaleDateString(undefined, { dateStyle: "medium" })}`,
        ]}
      />
      <ItemActions
        pipelineId={pipelineId}
        template={pipeline.template}
        defaultCurrency={defaultCurrency}
        item={item}
      />
    </div>
  );

  const detailsCard = (
    <SectionCard
      title="Details"
      description="Supporting information for this item"
      headerColor="var(--color-route-blue)"
    >
      <div className="space-y-4 text-sm">
        <ItemMetadataDisplay template={pipeline.template} metadata={item.metadata} />
        {item.externalUrl && (
          <p>
            <span className="text-muted-foreground">{urlLabels.label}: </span>
            <a
              href={item.externalUrl}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-primary hover:underline"
            >
              {urlLabels.linkText} →
            </a>
          </p>
        )}
        {item.notes && (
          <div>
            <p className="mb-1 text-muted-foreground">Notes</p>
            <p className="whitespace-pre-wrap rounded-md bg-muted/30 p-3">{item.notes}</p>
          </div>
        )}
      </div>
    </SectionCard>
  );

  const stageCard = (
    <SectionCard
      title="Update stage"
      description="Move this item as progress changes — each update is logged in your timeline."
      headerColor={item.currentStage.color ?? "var(--color-route-teal)"}
    >
      <StageUpdateForm
        pipelineId={pipelineId}
        itemId={itemId}
        stages={pipeline.stages.filter(
          (s) => !s.isArchived || s.id === item.currentStageId,
        )}
        currentStageId={item.currentStageId}
      />
    </SectionCard>
  );

  const timelineCard = (
    <SectionCard
      title="Timeline"
      description="Every stage change you've made"
      headerColor="var(--color-route-purple)"
    >
      <StageTimeline events={item.stageEvents} />
    </SectionCard>
  );

  return (
    <MobileShell
      hero={hero}
      desktop={
        <>
          <div className="grid gap-6 lg:grid-cols-2">
            {detailsCard}
            {stageCard}
          </div>
          {timelineCard}
        </>
      }
    >
      {detailsCard}
      {stageCard}
      {timelineCard}
    </MobileShell>
  );
}
