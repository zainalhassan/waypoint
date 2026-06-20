import { UserTemplateForm } from "@/components/UserTemplateForm";
import { PageHeader } from "@/components/transit/PageHeader";
import { SectionCard } from "@/components/transit/SectionCard";

export default function NewTemplatePage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        title="New template"
        description="Define your own stages once, then reuse them for any pipeline."
        backHref="/templates"
        backLabel="Templates"
      />
      <SectionCard title="Template details" headerColor="var(--color-route-teal)">
        <UserTemplateForm mode="create" />
      </SectionCard>
    </div>
  );
}
