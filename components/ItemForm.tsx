"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { createItem, updateItem, type ActionState } from "@/actions/items";
import type { Item, PipelineTemplate } from "@prisma/client";
import {
  EXTERNAL_URL_LABELS,
  HAS_DEAL_VALUE_FIELDS,
  HAS_INVESTMENT_FIELDS,
  HAS_SALARY_FIELDS,
  METADATA_FIELDS,
} from "@/lib/items/metadataSchemas";
import { DealValueFields } from "@/components/DealValueFields";
import { InvestmentFields } from "@/components/InvestmentFields";
import { SalaryFields } from "@/components/SalaryFields";
import { SectionCard } from "@/components/transit/SectionCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type ItemMetadata = Record<string, unknown>;

type ItemFormProps = {
  pipelineId: string;
  template: PipelineTemplate;
  defaultCurrency: string;
  mode?: "create" | "edit";
  itemId?: string;
  initial?: Pick<Item, "title" | "subtitle" | "notes" | "externalUrl" | "startedAt"> & {
    metadata?: ItemMetadata | null;
  };
  onEditSuccess?: () => void;
};

const initialState: ActionState = {};

function metadataValue(metadata: ItemMetadata | null | undefined, key: string) {
  if (!metadata || typeof metadata !== "object") return undefined;
  const value = metadata[key];
  if (value === null || value === undefined) return undefined;
  return value as string | number;
}

export function ItemForm({
  pipelineId,
  template,
  defaultCurrency,
  mode = "create",
  itemId,
  initial,
  onEditSuccess,
}: ItemFormProps) {
  const isEdit = mode === "edit" && itemId;
  const boundAction = isEdit
    ? updateItem.bind(null, pipelineId, itemId!)
    : createItem.bind(null, pipelineId);
  const [state, formAction, pending] = useActionState(boundAction, initialState);
  const metadataFields = METADATA_FIELDS[template];
  const showSalary = HAS_SALARY_FIELDS.includes(template);
  const showDealValue = HAS_DEAL_VALUE_FIELDS.includes(template);
  const showInvestment = HAS_INVESTMENT_FIELDS.includes(template);
  const urlLabels = EXTERNAL_URL_LABELS[template];
  const meta = (initial?.metadata ?? {}) as ItemMetadata;

  useEffect(() => {
    if (state.success && isEdit) {
      toast.success("Item updated");
      onEditSuccess?.();
    }
  }, [state.success, isEdit, onEditSuccess]);

  const startedAtValue = initial?.startedAt
    ? new Date(initial.startedAt).toISOString().slice(0, 10)
    : undefined;

  return (
    <form action={formAction} className="max-w-lg space-y-6">
      <SectionCard title="Basics" headerColor="var(--color-route-blue)">
        <div className="space-y-2">
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            name="title"
            required
            placeholder="Senior Engineer @ Acme"
            defaultValue={initial?.title}
          />
          <p className="text-xs text-muted-foreground">
            A short name you&apos;ll recognize — role and company works well.
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="subtitle">Role or subtitle</Label>
          <Input
            id="subtitle"
            name="subtitle"
            placeholder="Platform team · Full-time"
            defaultValue={initial?.subtitle ?? ""}
          />
        </div>
        {isEdit && (
          <div className="space-y-2">
            <Label htmlFor="startedAt">Started tracking</Label>
            <Input
              id="startedAt"
              name="startedAt"
              type="date"
              defaultValue={startedAtValue}
            />
          </div>
        )}
      </SectionCard>

      {metadataFields.length > 0 && (
        <SectionCard title="Details" headerColor="var(--color-route-teal)">
          {metadataFields.map((field) => (
            <div key={field.name} className="space-y-2">
              <Label htmlFor={`metadata.${field.name}`}>{field.label}</Label>
              <Input
                id={`metadata.${field.name}`}
                name={`metadata.${field.name}`}
                type={field.type}
                placeholder={field.placeholder}
                defaultValue={String(metadataValue(meta, field.name) ?? "")}
              />
              {field.hint && (
                <p className="text-xs text-muted-foreground">{field.hint}</p>
              )}
            </div>
          ))}
        </SectionCard>
      )}

      {showSalary && (
        <SectionCard title="Compensation" headerColor="var(--color-route-yellow)">
          <SalaryFields
            defaultCurrency={defaultCurrency}
            salaryMin={metadataValue(meta, "salaryMin")}
            salaryMax={metadataValue(meta, "salaryMax")}
            salaryCurrency={metadataValue(meta, "salaryCurrency") as string | undefined}
          />
        </SectionCard>
      )}
      {showDealValue && (
        <SectionCard title="Deal value" headerColor="var(--color-route-yellow)">
          <DealValueFields
            defaultCurrency={defaultCurrency}
            dealValue={metadataValue(meta, "dealValue")}
            dealCurrency={metadataValue(meta, "dealCurrency") as string | undefined}
          />
        </SectionCard>
      )}
      {showInvestment && (
        <SectionCard title="Investment" headerColor="var(--color-route-indigo)">
          <InvestmentFields
            defaultCurrency={defaultCurrency}
            assetType={metadataValue(meta, "assetType") as string | undefined}
            ticker={metadataValue(meta, "ticker") as string | undefined}
            amountInvested={metadataValue(meta, "amountInvested")}
            currentValue={metadataValue(meta, "currentValue")}
            currency={metadataValue(meta, "currency") as string | undefined}
          />
        </SectionCard>
      )}

      <SectionCard title="Extras" headerColor="var(--color-route-purple)">
        <div className="space-y-2">
          <Label htmlFor="externalUrl">{urlLabels.label}</Label>
          <Input
            id="externalUrl"
            name="externalUrl"
            type="url"
            placeholder="https://"
            defaultValue={initial?.externalUrl ?? ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            name="notes"
            rows={4}
            placeholder="Recruiter name, interview tips, anything useful…"
            defaultValue={initial?.notes ?? ""}
          />
        </div>
      </SectionCard>

      {state.error && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      )}
      <Button type="submit" disabled={pending} className="w-full sm:w-auto">
        {pending ? "Saving…" : isEdit ? "Save changes" : "Add item"}
      </Button>
    </form>
  );
}
