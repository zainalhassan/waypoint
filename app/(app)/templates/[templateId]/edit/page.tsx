import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserTemplateForm } from "@/components/UserTemplateForm";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
        <Link href="/templates" className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to templates
        </Link>
        <Card>
          <CardHeader>
            <CardTitle>Template is linked</CardTitle>
            <CardDescription>
              This copy stays in sync with the marketplace original. Unlink it from your
              templates list to make your own edits.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/templates" className={cn(buttonVariants({ variant: "outline" }))}>
              Back to my templates
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link href="/templates" className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to templates
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Edit template</h1>
        <p className="text-muted-foreground">
          Update stages and details. If this template is public, linked copies will sync
          when you save.
        </p>
      </div>
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
    </div>
  );
}
