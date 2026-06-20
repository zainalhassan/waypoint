"use client";

import Link from "next/link";
import { useActionState } from "react";
import { createPipeline, type ActionState } from "@/actions/pipelines";
import { TEMPLATE_LIST } from "@/lib/pipelines/templates";
import { EmptyState } from "@/components/transit/EmptyState";
import { HeroCard } from "@/components/transit/HeroCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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

const BUILTIN_COLORS = [
  "var(--color-route-blue)",
  "var(--color-route-purple)",
  "var(--color-route-teal)",
  "var(--color-route-pink)",
  "var(--color-route-yellow)",
  "var(--color-route-indigo)",
];

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
          {TEMPLATE_LIST.map((template, index) => (
            <label key={template.template} className="block cursor-pointer">
              <input
                type="radio"
                name="source"
                value={`builtin:${template.template}`}
                className="peer sr-only"
                required={userTemplates.length === 0}
                defaultChecked={template.template === "JOB_SEARCH"}
              />
              <HeroCard
                headerLabel={template.label}
                headerColor={BUILTIN_COLORS[index % BUILTIN_COLORS.length]}
                heroLabel="Stages"
                heroValue={String(template.stages.length)}
                meta={[
                  template.description,
                  template.stages.map((s) => s.name).join(" → "),
                ]}
                className="peer-checked:is-selected transition-transform active:scale-[0.99]"
              />
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <Label>Your templates</Label>
          <Link
            href="/templates/new"
            className="text-sm font-medium text-primary hover:underline"
          >
            Create template
          </Link>
        </div>
        {userTemplates.length === 0 ? (
          <EmptyState
            title="No custom templates yet"
            description={
              <>
                <Link href="/templates/new" className="font-medium text-primary hover:underline">
                  Create one
                </Link>{" "}
                with your own stages, then start a pipeline from it.
              </>
            }
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {userTemplates.map((template, index) => (
              <label key={template.id} className="block cursor-pointer">
                <input
                  type="radio"
                  name="source"
                  value={`user:${template.id}`}
                  className="peer sr-only"
                />
                <HeroCard
                  headerLabel={template.name}
                  headerColor={BUILTIN_COLORS[(index + 3) % BUILTIN_COLORS.length]}
                  heroLabel="Stages"
                  heroValue={String(template.stageNames.length)}
                  meta={[
                    ...(template.description ? [template.description] : []),
                    template.stageNames.join(" → "),
                  ]}
                  className="peer-checked:is-selected transition-transform active:scale-[0.99]"
                />
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
