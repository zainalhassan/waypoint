"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { applyTemplateSyncWithMappings, type ActionState } from "@/actions/templates";
import type { SyncPreview } from "@/lib/templates/syncTypes";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type TemplateSyncWizardProps = {
  preview: SyncPreview;
};

const initialState: ActionState = {};

export function TemplateSyncWizard({ preview }: TemplateSyncWizardProps) {
  const boundAction = applyTemplateSyncWithMappings.bind(null, preview.templateId);
  const [state, formAction, pending] = useActionState(boundAction, initialState);
  const [step, setStep] = useState(1);
  const totalSteps = preview.requiresWizard ? 3 : 2;

  const defaultMappings = Object.fromEntries(
    preview.removedWithItems.map((impact) => {
      const fallback =
        preview.targetStages.find((s) => s.isEntry)?.slug ??
        preview.targetStages[0]?.slug ??
        "";
      return [impact.slug, fallback];
    }),
  );

  const [mappings, setMappings] = useState<Record<string, string>>(defaultMappings);

  function canContinueFromMigrate() {
    return preview.removedWithItems.every((impact) => {
      const target = mappings[impact.slug];
      return target && target !== impact.slug;
    });
  }

  return (
    <form action={formAction} className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((n) => (
          <span
            key={n}
            className={cn(
              "rounded-full px-2.5 py-0.5",
              step === n ? "bg-primary text-primary-foreground" : "bg-muted",
            )}
          >
            {n}
          </span>
        ))}
      </div>

      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Review changes from {preview.sourceName}</CardTitle>
            <CardDescription>
              Compare what will change in your linked template
              {preview.pendingSourceSync ? " — update pending from the author" : ""}.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {preview.added.length > 0 && (
              <section>
                <h3 className="mb-2 text-sm font-medium text-green-700 dark:text-green-400">
                  New stages ({preview.added.length})
                </h3>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {preview.added.map((s) => (
                    <li key={s.slug}>+ {s.name}</li>
                  ))}
                </ul>
              </section>
            )}
            {preview.removed.length > 0 && (
              <section>
                <h3 className="mb-2 text-sm font-medium text-destructive">
                  Removed stages ({preview.removed.length})
                </h3>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {preview.removed.map((s) => (
                    <li key={s.slug}>
                      − {s.name}
                      {preview.removedWithItems.some((r) => r.slug === s.slug) && (
                        <Badge variant="outline" className="ml-2">
                          has items
                        </Badge>
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            )}
            {preview.updated.length > 0 && (
              <section>
                <h3 className="mb-2 text-sm font-medium">Updated stages ({preview.updated.length})</h3>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {preview.updated.map((s) => (
                    <li key={s.slug}>
                      ~ {s.before.name} → {s.after.name}
                    </li>
                  ))}
                </ul>
              </section>
            )}
            {preview.added.length === 0 &&
              preview.removed.length === 0 &&
              preview.updated.length === 0 && (
                <p className="text-sm text-muted-foreground">Already in sync with the source.</p>
              )}
          </CardContent>
        </Card>
      )}

      {step === 2 && preview.requiresWizard && (
        <Card>
          <CardHeader>
            <CardTitle>Move items from removed stages</CardTitle>
            <CardDescription>
              The author removed stages that still have your items. Choose where each group
              should go. Removed stages are archived in your pipelines for history.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {preview.removedWithItems.map((impact) => (
              <div key={impact.slug} className="space-y-2 rounded-lg border p-4">
                <div>
                  <p className="font-medium">{impact.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {impact.itemCount} item{impact.itemCount === 1 ? "" : "s"} across{" "}
                    {impact.pipelines.map((p) => `${p.name} (${p.count})`).join(", ")}
                  </p>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor={`mapping-${impact.slug}`}>Move items to</Label>
                  <select
                    id={`mapping-${impact.slug}`}
                    name={`mapping.${impact.slug}`}
                    value={mappings[impact.slug] ?? ""}
                    onChange={(e) =>
                      setMappings((prev) => ({ ...prev, [impact.slug]: e.target.value }))
                    }
                    required
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
                  >
                    {preview.targetStages
                      .filter((s) => s.slug !== impact.slug)
                      .map((stage) => (
                        <option key={stage.slug} value={stage.slug}>
                          {stage.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {((step === 2 && !preview.requiresWizard) || (step === 3 && preview.requiresWizard)) && (
        <Card>
          <CardHeader>
            <CardTitle>Confirm sync</CardTitle>
            <CardDescription>
              Your template will match the source. Pipelines created from this template will be
              updated; items in removed stages move to your chosen stages.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p>
              <span className="font-medium">{preview.templateName}</span> →{" "}
              <span className="font-medium">{preview.sourceName}</span>
            </p>
            {preview.requiresWizard && (
              <ul className="space-y-1 text-muted-foreground">
                {preview.removedWithItems.map((impact) => (
                  <li key={impact.slug}>
                    {impact.itemCount} item{impact.itemCount === 1 ? "" : "s"} from{" "}
                    <span className="text-foreground">{impact.name}</span> →{" "}
                    <span className="text-foreground">
                      {preview.targetStages.find((s) => s.slug === mappings[impact.slug])?.name}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      )}

      {state.error && <p className="text-sm text-destructive">{state.error}</p>}

      <div className="flex flex-wrap gap-2">
        {step > 1 && (
          <Button type="button" variant="outline" onClick={() => setStep((s) => s - 1)}>
            Back
          </Button>
        )}
        {step < totalSteps ? (
          <Button
            type="button"
            onClick={() => setStep((s) => s + 1)}
            disabled={step === 2 && preview.requiresWizard && !canContinueFromMigrate()}
          >
            Continue
          </Button>
        ) : (
          <Button type="submit" disabled={pending}>
            {pending ? "Applying…" : "Apply sync"}
          </Button>
        )}
        <Link href="/templates" className={buttonVariants({ variant: "ghost" })}>
          Cancel
        </Link>
      </div>
    </form>
  );
}
