import { auth } from "@/lib/auth";
import { getUserTemplates } from "@/lib/pipelines/createPipelineFromUserTemplate";
import { CreatePipelineForm } from "@/components/CreatePipelineForm";
import { PageHeader } from "@/components/transit/PageHeader";
import { SectionCard } from "@/components/transit/SectionCard";

export default async function NewPipelinePage() {
  const session = await auth();
  const templates = await getUserTemplates(session!.user!.id);

  const userTemplates = templates.map((t) => ({
    id: t.id,
    name: t.name,
    description: t.description,
    stageNames: t.stages.map((s) => s.name),
  }));

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title="New pipeline"
        description="Pick a built-in template or one of your own custom stage flows."
      />
      <SectionCard title="Pipeline setup" headerColor="var(--color-brand-primary)">
        <CreatePipelineForm userTemplates={userTemplates} />
      </SectionCard>
    </div>
  );
}
