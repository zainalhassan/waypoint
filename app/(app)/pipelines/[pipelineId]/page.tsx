import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { getPipelineForUser } from "@/lib/pipelines/createPipelineFromTemplate";
import { PIPELINE_TEMPLATES } from "@/lib/pipelines/templates";
import { ItemTable } from "@/components/ItemTable";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default async function PipelinePage({
  params,
}: {
  params: Promise<{ pipelineId: string }>;
}) {
  const { pipelineId } = await params;
  const session = await auth();
  const pipeline = await getPipelineForUser(pipelineId, session!.user!.id);

  if (!pipeline) notFound();

  const definition = PIPELINE_TEMPLATES[pipeline.template];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">{definition.label}</p>
          <h1 className="text-2xl font-semibold tracking-tight">{pipeline.name}</h1>
        </div>
        <div className="flex flex-wrap gap-2">
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

      <ItemTable
        pipelineId={pipelineId}
        template={pipeline.template}
        items={pipeline.items}
      />
    </div>
  );
}
