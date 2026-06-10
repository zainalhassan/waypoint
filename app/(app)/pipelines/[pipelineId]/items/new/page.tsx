import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { getPipelineForUser } from "@/lib/pipelines/createPipelineFromTemplate";
import { ItemForm } from "@/components/ItemForm";

export default async function NewItemPage({
  params,
}: {
  params: Promise<{ pipelineId: string }>;
}) {
  const { pipelineId } = await params;
  const session = await auth();
  const pipeline = await getPipelineForUser(pipelineId, session!.user!.id);

  if (!pipeline) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/pipelines/${pipelineId}`}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to {pipeline.name}
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Add item</h1>
      </div>
      <ItemForm pipelineId={pipelineId} template={pipeline.template} />
    </div>
  );
}
