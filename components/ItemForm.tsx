"use client";

import { useActionState } from "react";
import { createItem, type ActionState } from "@/actions/items";
import type { PipelineTemplate } from "@prisma/client";
import {
  HAS_DEAL_VALUE_FIELDS,
  HAS_INVESTMENT_FIELDS,
  HAS_SALARY_FIELDS,
  METADATA_FIELDS,
} from "@/lib/items/metadataSchemas";
import { DealValueFields } from "@/components/DealValueFields";
import { InvestmentFields } from "@/components/InvestmentFields";
import { SalaryFields } from "@/components/SalaryFields";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type ItemFormProps = {
  pipelineId: string;
  template: PipelineTemplate;
  defaultCurrency: string;
};

const initialState: ActionState = {};

export function ItemForm({ pipelineId, template, defaultCurrency }: ItemFormProps) {
  const boundAction = createItem.bind(null, pipelineId);
  const [state, formAction, pending] = useActionState(boundAction, initialState);
  const metadataFields = METADATA_FIELDS[template];
  const showSalary = HAS_SALARY_FIELDS.includes(template);
  const showDealValue = HAS_DEAL_VALUE_FIELDS.includes(template);
  const showInvestment = HAS_INVESTMENT_FIELDS.includes(template);

  return (
    <form action={formAction} className="max-w-lg space-y-6">
      <fieldset className="space-y-4">
        <legend className="text-sm font-medium">Basics</legend>
        <div className="space-y-2">
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            name="title"
            required
            placeholder="Senior Engineer @ Acme"
          />
          <p className="text-xs text-muted-foreground">
            A short name you&apos;ll recognize — role and company works well.
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="subtitle">Role or subtitle</Label>
          <Input id="subtitle" name="subtitle" placeholder="Platform team · Full-time" />
        </div>
      </fieldset>

      {metadataFields.length > 0 && (
        <fieldset className="space-y-4">
          <legend className="text-sm font-medium">Details</legend>
          {metadataFields.map((field) => (
            <div key={field.name} className="space-y-2">
              <Label htmlFor={`metadata.${field.name}`}>{field.label}</Label>
              <Input
                id={`metadata.${field.name}`}
                name={`metadata.${field.name}`}
                type={field.type}
                placeholder={field.placeholder}
              />
              {field.hint && (
                <p className="text-xs text-muted-foreground">{field.hint}</p>
              )}
            </div>
          ))}
        </fieldset>
      )}

      {showSalary && <SalaryFields defaultCurrency={defaultCurrency} />}
      {showDealValue && <DealValueFields defaultCurrency={defaultCurrency} />}
      {showInvestment && <InvestmentFields defaultCurrency={defaultCurrency} />}

      <fieldset className="space-y-4">
        <legend className="text-sm font-medium">Extras</legend>
        <div className="space-y-2">
          <Label htmlFor="externalUrl">Job posting link</Label>
          <Input id="externalUrl" name="externalUrl" type="url" placeholder="https://" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            name="notes"
            rows={4}
            placeholder="Recruiter name, interview tips, anything useful…"
          />
        </div>
      </fieldset>

      {state.error && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      )}
      <Button type="submit" disabled={pending} className="w-full sm:w-auto">
        {pending ? "Saving…" : "Add item"}
      </Button>
    </form>
  );
}
