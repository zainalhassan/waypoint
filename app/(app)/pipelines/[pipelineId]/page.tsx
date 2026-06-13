import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { getPipelineForUser } from "@/lib/pipelines/createPipelineFromTemplate";
import {
  filterAndSortItems,
  parsePipelineItemSort,
} from "@/lib/pipelines/itemFilters";
import { PIPELINE_TEMPLATES } from "@/lib/pipelines/templates";
import { ItemBoard } from "@/components/ItemBoard";
import { ItemTable } from "@/components/ItemTable";
import { PipelineItemFilters } from "@/components/PipelineItemFilters";
import { PipelineSettings } from "@/components/PipelineSettings";
import { buttonVariants } from "@/components/ui/button";

export default async function PipelinePage({
  params,
  searchParams,
}: {
  params: Promise<{ pipelineId: string }>;
  searchParams: Promise<{
    q?: string;
    stage?: string;
    sort?: string;
    view?: string;
  }>;
}) {
  const { pipelineId } = await params;
  const filters = await searchParams;
  const session = await auth();
  const pipeline = await getPipelineForUser(pipelineId, session!.user!.id);

  if (!pipeline) notFound();

  const definition = PIPELINE_TEMPLATES[pipeline.template];
  const sort = parsePipelineItemSort(filters.sort);
  const view = filters.view === "board" ? "board" : "table";
  const filteredItems = filterAndSortItems(pipeline.items, {
    q: filters.q,
    stageId: filters.stage,
    sort,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">{definition.label}</p>
          <h1 className="text-2xl font-semibold tracking-tight">{pipeline.name}</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <PipelineSettings pipelineId={pipelineId} name={pipeline.name} />
          <Link
            href={`/pipelines/${pipelineId}/analytics`}
            className={buttonVariants({ variant: "outline" })}
          >
            Analytics
          </Link>
          <Link
            href={`/pipelines/${pipelineId}/items/new`}
            className={buttonVariants()}
          >
            Add item
          </Link>
        </div>
      </div>

      <Suspense fallback={null}>
        <PipelineItemFilters
          stages={pipeline.stages}
          current={{
            q: filters.q,
            stage: filters.stage,
            sort,
            view,
          }}
        />
      </Suspense>

      {view === "board" ? (
        <ItemBoard
          pipelineId={pipelineId}
          stages={pipeline.stages}
          items={filteredItems}
        />
      ) : (
        <ItemTable
          pipelineId={pipelineId}
          template={pipeline.template}
          items={filteredItems}
        />
      )}
    </div>
  );
}
