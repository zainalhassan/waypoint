import Link from "next/link";
import { UserTemplateForm } from "@/components/UserTemplateForm";

export default function NewTemplatePage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link href="/templates" className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to templates
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">New template</h1>
        <p className="text-muted-foreground">
          Define your own stages once, then reuse them for any pipeline.
        </p>
      </div>
      <UserTemplateForm mode="create" />
    </div>
  );
}
