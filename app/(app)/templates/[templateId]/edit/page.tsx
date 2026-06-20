import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserTemplateForm } from "@/components/UserTemplateForm";
import { PageHeader } from "@/components/transit/PageHeader";
import { SectionCard } from "@/components/transit/SectionCard";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default async function EditTemplatePage({
  params,
}: {
  params: Promise<{ templateId: string }>;
}) {
  const { templateId } = await params;
  const session = await auth();

  const template = await prisma.userTemplate.findFirst({
    where: { id: templateId, userId: session!.user!.id },
    include: { stages: { orderBy: { sortOrder: "asc" } } },
  });

  if (!template) notFound();

  if (template.isLinkedToSource) {
    return (
      <div className="mx-auto max-w-xl space-y-6">
        <PageHeader
          title="Template is linked"
          description="This copy stays in sync with the marketplace original. Unlink it from your templates list to make your own edits."
          backHref="/templates"
          backLabel="Templates"
        />
        <SectionCard title="Linked template" headerColor="var(--color-route-yellow)">
          <Link href="/templates" className={cn(buttonVariants({ variant: "outline" }))}>
            Back to my templates
          </Link>
        </SectionCard>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        title="Edit template"
        description="Update stages and details. If this template is public, linked copies will sync when you save."
        backHref="/templates"
        backLabel="Templates"
      />
      <SectionCard title="Template details" headerColor="var(--color-route-blue)">
        <UserTemplateForm
          mode="edit"
          templateId={template.id}
          initial={{
            name: template.name,
            description: template.description ?? "",
            stages: template.stages.map((s) => ({
              name: s.name,
              isEntry: s.isEntry,
              isTerminal: s.isTerminal,
            })),
          }}
        />
      </SectionCard>
    </div>
  );
}
