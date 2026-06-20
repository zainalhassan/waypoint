import { getPipelineForUser } from "@/lib/pipelines/createPipelineFromTemplate";
import { PIPELINE_TEMPLATES } from "@/lib/pipelines/templates";
import { getUserDefaultCurrency } from "@/lib/user";
import { ItemForm } from "@/components/ItemForm";
import { PageHeader } from "@/components/transit/PageHeader";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function NewItemPage({
  params,
}: {
  params: Promise<{ pipelineId: string }>;
}) {
  const { pipelineId } = await params;
  const session = await auth();
  const pipeline = await getPipelineForUser(pipelineId, session!.user!.id);

  if (!pipeline) notFound();

  const defaultCurrency = await getUserDefaultCurrency(session!.user!.id);
  const definition = PIPELINE_TEMPLATES[pipeline.template];

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        title="Add item"
        description={`Add a new entry to your ${definition.label.toLowerCase()} pipeline.`}
        backHref={`/pipelines/${pipelineId}`}
        backLabel={pipeline.name}
      />
      <ItemForm
        pipelineId={pipelineId}
        template={pipeline.template}
        defaultCurrency={defaultCurrency}
      />
    </div>
  );
}
