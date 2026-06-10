import Link from "next/link";
import { Plus } from "lucide-react";
import { auth } from "@/lib/auth";
import { getUserPipelines } from "@/lib/pipelines/createPipelineFromTemplate";
import { getUserById } from "@/lib/user";
import { PipelineCard } from "@/components/PipelineCard";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default async function HomePage() {
  const session = await auth();
  const user = await getUserById(session!.user!.id);
  const pipelines = await getUserPipelines(session!.user!.id);
  const firstName = user?.name?.split(" ")[0] ?? "there";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Welcome back, {firstName}
          </h1>
          <p className="text-muted-foreground">
            Track jobs, applications, and opportunities — all in one place.
          </p>
        </div>
        <Link href="/pipelines/new" className={cn(buttonVariants(), "gap-1.5")}>
          <Plus className="size-4" />
          New pipeline
        </Link>
      </div>

      {pipelines.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="font-medium">Get started with your first pipeline</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Pick a template for job search, grad school, or sales — then add items as you go.
          </p>
          <Link
            href="/pipelines/new"
            className={cn(buttonVariants(), "mt-6 inline-flex")}
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
