import Link from "next/link";
import { Plus } from "lucide-react";
import { auth } from "@/lib/auth";
import { getUserPipelines } from "@/lib/pipelines/createPipelineFromTemplate";
import { PipelineCard } from "@/components/PipelineCard";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default async function HomePage() {
  const session = await auth();
  const pipelines = await getUserPipelines(session!.user!.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Your pipelines</h1>
          <p className="text-muted-foreground">
            Track progress across jobs, schools, sales, and more.
          </p>
        </div>
        <Link href="/pipelines/new" className={cn(buttonVariants(), "gap-1.5")}>
          <Plus className="size-4" />
          New pipeline
        </Link>
      </div>

      {pipelines.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="text-muted-foreground">No pipelines yet.</p>
          <Link
            href="/pipelines/new"
            className={cn(buttonVariants(), "mt-4 inline-flex")}
          >
            Create your first pipeline
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pipelines.map((pipeline) => {
            const activeCount = pipeline.items.filter(
              (item) => !item.currentStage.isTerminal,
            ).length;

            return (
              <PipelineCard
                key={pipeline.id}
                id={pipeline.id}
                name={pipeline.name}
                template={pipeline.template}
                itemCount={pipeline._count.items}
                activeCount={activeCount}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
