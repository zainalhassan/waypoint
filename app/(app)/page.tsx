import Link from "next/link";
import { Plus } from "lucide-react";
import { auth } from "@/lib/auth";
import { getUserPipelines } from "@/lib/pipelines/createPipelineFromTemplate";
import { getUserById } from "@/lib/user";
import { PipelineCard } from "@/components/PipelineCard";
import { EmptyState } from "@/components/transit/EmptyState";
import { PageHeader } from "@/components/transit/PageHeader";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default async function HomePage() {
  const session = await auth();
  const user = await getUserById(session!.user!.id);
  const pipelines = await getUserPipelines(session!.user!.id);
  const firstName = user?.name?.split(" ")[0] ?? "there";

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back, ${firstName}`}
        description="Track jobs, applications, and opportunities — all in one place."
      >
        <Link href="/pipelines/new" className={cn(buttonVariants(), "hidden gap-1.5 lg:inline-flex")}>
          <Plus className="size-4" />
          New pipeline
        </Link>
      </PageHeader>

      {pipelines.length === 0 ? (
        <EmptyState
          title="Get started with your first pipeline"
          description="Pick a template for job search, grad school, or sales — then add items as you go."
        >
          <Link href="/pipelines/new" className={cn(buttonVariants())}>
            Create your first pipeline
          </Link>
        </EmptyState>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
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
