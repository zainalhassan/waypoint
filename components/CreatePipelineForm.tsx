"use client";

import { useActionState } from "react";
import { createPipeline, type ActionState } from "@/actions/pipelines";
import { TEMPLATE_LIST } from "@/lib/pipelines/templates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const initialState: ActionState = {};

export function CreatePipelineForm() {
  const [state, formAction, pending] = useActionState(createPipeline, initialState);

  return (
    <form action={formAction} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Pipeline name</Label>
        <Input id="name" name="name" required placeholder="2026 Job Hunt" />
      </div>

      <div className="space-y-3">
        <Label>Template</Label>
        <div className="grid gap-3 sm:grid-cols-3">
          {TEMPLATE_LIST.map((template) => (
            <label key={template.template} className="cursor-pointer">
              <input
                type="radio"
                name="template"
                value={template.template}
                className="peer sr-only"
                required
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

      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "Creating…" : "Create pipeline"}
      </Button>
    </form>
  );
}
