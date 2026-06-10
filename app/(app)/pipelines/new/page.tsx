import { CreatePipelineForm } from "@/components/CreatePipelineForm";

export default function NewPipelinePage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">New pipeline</h1>
        <p className="text-muted-foreground">
          Choose a template to get started with predefined stages.
        </p>
      </div>
      <CreatePipelineForm />
    </div>
  );
}
