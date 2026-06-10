import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getPipelineForUser } from "@/lib/pipelines/createPipelineFromTemplate";
import { buildSankeyData } from "@/lib/sankey/buildSankeyData";
import { computePipelineStats } from "@/lib/sankey/stats";
import { getUserDefaultCurrency } from "@/lib/user";
import { InvestmentBreakdown } from "@/components/InvestmentBreakdown";
import { SankeyChart } from "@/components/SankeyChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

  const sankeyData = buildSankeyData(pipeline.stages, events);
  const stats = computePipelineStats(pipeline.items, pipeline.template);
  const defaultCurrency = await getUserDefaultCurrency(session!.user!.id);
  const isInvestments = pipeline.template === "INVESTMENTS";

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/pipelines/${pipelineId}`}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to {pipeline.name}
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Analytics</h1>
      </div>

      {isInvestments && (
        <InvestmentBreakdown items={pipeline.items} defaultCurrency={defaultCurrency} />
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total items
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{stats.total}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{stats.active}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stats.conversionLabel}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {stats.conversionRate !== null ? `${stats.conversionRate}%` : "—"}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Stage flow</CardTitle>
        </CardHeader>
        <CardContent>
          <SankeyChart data={sankeyData} />
        </CardContent>
      </Card>
    </div>
  );
}
