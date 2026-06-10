"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { updateItemStage, type ActionState } from "@/actions/items";
import type { Stage } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type StageUpdateFormProps = {
  pipelineId: string;
  itemId: string;
  stages: Stage[];
  currentStageId: string;
};

const initialState: ActionState = {};

export function StageUpdateForm({
  pipelineId,
  itemId,
  stages,
  currentStageId,
}: StageUpdateFormProps) {
  const boundAction = updateItemStage.bind(null, pipelineId, itemId);
  const [state, formAction, pending] = useActionState(boundAction, initialState);

  useEffect(() => {
    if (state.success) {
      toast.success("Stage updated");
    }
  }, [state.success]);

  return (
    <form action={formAction} className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor="stageId">Current stage</Label>
        <select
          id="stageId"
          name="stageId"
          defaultValue={currentStageId}
          required
          className={cn(
            "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs",
            "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 outline-none",
          )}
        >
          {stages.map((stage) => (
            <option key={stage.id} value={stage.id}>
              {stage.name}
            </option>
          ))}
        </select>
      </div>
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "Updating…" : "Save stage"}
      </Button>
    </form>
  );
}
