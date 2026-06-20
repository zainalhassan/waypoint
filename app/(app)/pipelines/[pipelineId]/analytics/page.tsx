import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { computeDurationAnalytics } from "@/lib/analytics/durations";
import { getPipelineForUser } from "@/lib/pipelines/createPipelineFromTemplate";
import { buildSankeyData } from "@/lib/sankey/buildSankeyData";
import { computePipelineStats } from "@/lib/sankey/stats";
import { getUserDefaultCurrency } from "@/lib/user";
import { DurationAnalyticsPanel } from "@/components/DurationAnalyticsPanel";
import { InvestmentBreakdown } from "@/components/InvestmentBreakdown";
import { PipelineExportButton } from "@/components/PipelineExportButton";
import { SankeyChart } from "@/components/SankeyChart";
import { PageHeader } from "@/components/transit/PageHeader";
import { SectionCard } from "@/components/transit/SectionCard";
import { StatCard } from "@/components/transit/StatCard";

export default async function AnalyticsPage({
  params,
}: {
  params: Promise<{ pipelineId: string }>;
}) {
  const { pipelineId } = await params;
  const session = await auth();
  const pipeline = await getPipelineForUser(pipelineId, session!.user!.id);

  if (!pipeline) notFound();

  const events = await prisma.stageEvent.findMany({
    where: { item: { pipelineId } },
    include: { fromStage: true, toStage: true },
    orderBy: { occurredAt: "asc" },
  });

  const itemsWithEvents = await prisma.item.findMany({
    where: { pipelineId },
    include: {
      currentStage: true,
      stageEvents: { include: { fromStage: true, toStage: true } },
    },
  });

  const sankeyData = buildSankeyData(pipeline.stages, events);
  const stats = computePipelineStats(pipeline.items, pipeline.template);
  const durationAnalytics = computeDurationAnalytics(
    itemsWithEvents,
    pipeline.stages,
    events,
  );
  const defaultCurrency = await getUserDefaultCurrency(session!.user!.id);
  const isInvestments = pipeline.template === "INVESTMENTS";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        description={pipeline.name}
        backHref={`/pipelines/${pipelineId}`}
        backLabel={pipeline.name}
      >
        <PipelineExportButton pipelineId={pipelineId} />
      </PageHeader>

      {isInvestments && (
        <InvestmentBreakdown items={pipeline.items} defaultCurrency={defaultCurrency} />
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Total items"
          value={stats.total}
          headerColor="var(--color-route-blue)"
        />
        <StatCard
          label="Active"
          value={stats.active}
          headerColor="var(--color-route-teal)"
        />
        <StatCard
          label={stats.conversionLabel}
          value={stats.conversionRate !== null ? `${stats.conversionRate}%` : "—"}
          headerColor="var(--color-route-purple)"
        />
      </div>

      <DurationAnalyticsPanel analytics={durationAnalytics} />

      <SectionCard title="Stage flow" headerColor="var(--color-route-indigo)">
        <SankeyChart data={sankeyData} />
      </SectionCard>
    </div>
  );
}
