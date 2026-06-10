"use client";

import { useActionState, useState } from "react";
import {
  createUserTemplate,
  updateUserTemplate,
  type ActionState,
} from "@/actions/templates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2 } from "lucide-react";

type StageRow = {
  id: string;
  name: string;
  isEntry: boolean;
  isTerminal: boolean;
};

export type UserTemplateFormValues = {
  name: string;
  description: string;
  stages: { name: string; isEntry: boolean; isTerminal: boolean }[];
};

type UserTemplateFormProps = {
  mode: "create" | "edit";
  templateId?: string;
  initial?: UserTemplateFormValues;
};

const initialState: ActionState = {};

function newStage(index: number): StageRow {
  return {
    id: crypto.randomUUID(),
    name: "",
    isEntry: index === 0,
    isTerminal: false,
  };
}

function toStageRows(stages: UserTemplateFormValues["stages"]): StageRow[] {
  return stages.map((stage, index) => ({
    id: String(index + 1),
    name: stage.name,
    isEntry: stage.isEntry,
    isTerminal: stage.isTerminal,
  }));
}

export function UserTemplateForm({ mode, templateId, initial }: UserTemplateFormProps) {
  const boundUpdate =
    mode === "edit" && templateId
      ? updateUserTemplate.bind(null, templateId)
      : createUserTemplate;
  const [state, formAction, pending] = useActionState(boundUpdate, initialState);
  const [stages, setStages] = useState<StageRow[]>(
    initial
      ? toStageRows(initial.stages)
      : [
          { id: "1", name: "Started", isEntry: true, isTerminal: false },
          { id: "2", name: "In progress", isEntry: false, isTerminal: false },
          { id: "3", name: "Complete", isEntry: false, isTerminal: true },
        ],
  );

  function addStage() {
    setStages((prev) => [...prev, newStage(prev.length)]);
  }

  function removeStage(id: string) {
    setStages((prev) => (prev.length <= 2 ? prev : prev.filter((s) => s.id !== id)));
  }

  function updateStage(id: string, patch: Partial<StageRow>) {
    setStages((prev) =>
      prev.map((stage) => (stage.id === id ? { ...stage, ...patch } : stage)),
    );
  }

  return (
    <form action={formAction} className="max-w-xl space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Template name</Label>
        <Input
          id="name"
          name="name"
          required
          defaultValue={initial?.name}
          placeholder="Side projects"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          rows={2}
          defaultValue={initial?.description}
          placeholder="Optional — what this pipeline is for"
        />
      </div>

      <fieldset className="space-y-3">
        <legend className="text-sm font-medium">Stages</legend>
        <p className="text-xs text-muted-foreground">
          Define the steps in order. Mark entry and terminal stages as needed.
        </p>
        {stages.map((stage, index) => (
          <div key={stage.id} className="flex flex-wrap items-end gap-2 rounded-lg border p-3">
            <div className="min-w-[180px] flex-1 space-y-1">
              <Label htmlFor={`stage-${stage.id}`} className="text-xs">
                Stage {index + 1}
              </Label>
              <Input
                id={`stage-${stage.id}`}
                name="stageName"
                value={stage.name}
                onChange={(e) => updateStage(stage.id, { name: e.target.value })}
                required
                placeholder="Stage name"
              />
            </div>
            <input type="hidden" name="stageEntry" value={stage.isEntry ? "on" : "off"} />
            <input type="hidden" name="stageTerminal" value={stage.isTerminal ? "on" : "off"} />
            <label className="flex items-center gap-1.5 text-xs">
              <input
                type="checkbox"
                checked={stage.isEntry}
                onChange={(e) => updateStage(stage.id, { isEntry: e.target.checked })}
              />
              Entry
            </label>
            <label className="flex items-center gap-1.5 text-xs">
              <input
                type="checkbox"
                checked={stage.isTerminal}
                onChange={(e) => updateStage(stage.id, { isTerminal: e.target.checked })}
              />
              Terminal
            </label>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeStage(stage.id)}
              disabled={stages.length <= 2}
              aria-label="Remove stage"
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={addStage}>
          <Plus className="mr-1 size-4" />
          Add stage
        </Button>
      </fieldset>

      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : mode === "edit" ? "Save changes" : "Save template"}
      </Button>
    </form>
  );
}
