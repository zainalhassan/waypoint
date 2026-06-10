"use client";

import Link from "next/link";
import { useActionState } from "react";
import { createPipeline, type ActionState } from "@/actions/pipelines";
import { TEMPLATE_LIST } from "@/lib/pipelines/templates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export type UserTemplateOption = {
  id: string;
  name: string;
  description: string | null;
  stageNames: string[];
};

type CreatePipelineFormProps = {
  userTemplates: UserTemplateOption[];
};

const initialState: ActionState = {};

export function CreatePipelineForm({ userTemplates }: CreatePipelineFormProps) {
  const [state, formAction, pending] = useActionState(createPipeline, initialState);

  return (
    <form action={formAction} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Pipeline name</Label>
        <Input id="name" name="name" required placeholder="2026 Job Hunt" />
      </div>

      <div className="space-y-3">
        <Label>Built-in templates</Label>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {TEMPLATE_LIST.map((template) => (
            <label key={template.template} className="cursor-pointer">
              <input
                type="radio"
                name="source"
                value={`builtin:${template.template}`}
                className="peer sr-only"
                required={userTemplates.length === 0}
                defaultChecked={template.template === "JOB_SEARCH"}
              />
              <Card className="peer-checked:border-primary peer-checked:ring-2 peer-checked:ring-primary/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">{template.label}</CardTitle>
                  <CardDescription className="text-xs">
                    {template.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-xs text-muted-foreground">
                  {template.stages.map((s) => s.name).join(" → ")}
                </CardContent>
              </Card>
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <Label>Your templates</Label>
          <Link
            href="/templates/new"
            className="text-sm text-primary hover:underline"
          >
            Create template
          </Link>
        </div>
        {userTemplates.length === 0 ? (
          <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
            No custom templates yet.{" "}
            <Link href="/templates/new" className="text-primary hover:underline">
              Create one
            </Link>{" "}
            with your own stages, then start a pipeline from it.
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {userTemplates.map((template) => (
              <label key={template.id} className="cursor-pointer">
                <input
                  type="radio"
                  name="source"
                  value={`user:${template.id}`}
                  className="peer sr-only"
                />
                <Card className="peer-checked:border-primary peer-checked:ring-2 peer-checked:ring-primary/20">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">{template.name}</CardTitle>
                    {template.description && (
                      <CardDescription className="text-xs">
                        {template.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="text-xs text-muted-foreground">
                    {template.stageNames.join(" → ")}
                  </CardContent>
                </Card>
              </label>
            ))}
          </div>
        )}
      </div>

      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "Creating…" : "Create pipeline"}
      </Button>
    </form>
  );
}
