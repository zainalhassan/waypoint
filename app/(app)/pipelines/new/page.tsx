import { auth } from "@/lib/auth";
import { getUserTemplates } from "@/lib/pipelines/createPipelineFromUserTemplate";
import { CreatePipelineForm } from "@/components/CreatePipelineForm";

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
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">New pipeline</h1>
        <p className="text-muted-foreground">
          Pick a built-in template or one of your own custom stage flows.
        </p>
      </div>
      <CreatePipelineForm userTemplates={userTemplates} />
    </div>
  );
}
