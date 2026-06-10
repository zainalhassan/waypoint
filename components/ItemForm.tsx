"use client";

import { useActionState } from "react";
import { createItem, type ActionState } from "@/actions/items";
import type { PipelineTemplate } from "@prisma/client";
import { METADATA_FIELDS } from "@/lib/items/metadataSchemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type ItemFormProps = {
  pipelineId: string;
  template: PipelineTemplate;
};

const initialState: ActionState = {};

export function ItemForm({ pipelineId, template }: ItemFormProps) {
  const boundAction = createItem.bind(null, pipelineId);
  const [state, formAction, pending] = useActionState(boundAction, initialState);
  const metadataFields = METADATA_FIELDS[template];

  return (
    <form action={formAction} className="max-w-lg space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" required placeholder="Senior Engineer @ Acme" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="subtitle">Subtitle</Label>
        <Input id="subtitle" name="subtitle" placeholder="Optional" />
      </div>
      {metadataFields.map((field) => (
        <div key={field.name} className="space-y-2">
          <Label htmlFor={`metadata.${field.name}`}>{field.label}</Label>
          <Input
            id={`metadata.${field.name}`}
            name={`metadata.${field.name}`}
            type={field.type}
            placeholder={field.placeholder}
          />
        </div>
      ))}
      <div className="space-y-2">
        <Label htmlFor="externalUrl">Link</Label>
        <Input id="externalUrl" name="externalUrl" type="url" placeholder="https://" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" name="notes" rows={4} />
      </div>
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Add item"}
      </Button>
    </form>
  );
}
