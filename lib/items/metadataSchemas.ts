import { PipelineTemplate } from "@prisma/client";
import { z } from "zod";
import { ASSET_TYPES } from "@/lib/investments/breakdown";

const optionalNumber = z.preprocess(
  (val) => (val === "" || val === null || val === undefined ? undefined : Number(val)),
  z.number().nonnegative().optional(),
);

const assetTypeValues = ASSET_TYPES.map((t) => t.value) as [string, ...string[]];

const jobSearchMetadata = z.object({
  company: z.string().optional(),
  location: z.string().optional(),
  salaryMin: optionalNumber,
  salaryMax: optionalNumber,
  salaryCurrency: z.string().length(3).optional(),
});

const gradSchoolMetadata = z.object({
  institution: z.string().optional(),
  program: z.string().optional(),
  deadline: z.string().optional(),
});

const salesMetadata = z.object({
  company: z.string().optional(),
  dealValue: optionalNumber,
  dealCurrency: z.string().length(3).optional(),
  contactEmail: z.string().email().optional().or(z.literal("")),
});

const investmentsMetadata = z.object({
  assetType: z.enum(assetTypeValues).optional(),
  ticker: z.string().optional(),
  amountInvested: optionalNumber,
  currentValue: optionalNumber,
  currency: z.string().length(3).optional(),
});

const customMetadata = z.record(z.string(), z.unknown()).optional();

const schemas: Record<PipelineTemplate, z.ZodTypeAny> = {
  JOB_SEARCH: jobSearchMetadata,
  GRAD_SCHOOL: gradSchoolMetadata,
  SALES: salesMetadata,
  INVESTMENTS: investmentsMetadata,
  CUSTOM: customMetadata,
};

export function getMetadataSchema(template: PipelineTemplate) {
  return schemas[template];
}

export type MetadataField = {
  name: string;
  label: string;
  type: "text" | "email" | "number";
  placeholder?: string;
  hint?: string;
};

export const METADATA_FIELDS: Record<PipelineTemplate, MetadataField[]> = {
  JOB_SEARCH: [
    { name: "company", label: "Company", type: "text", placeholder: "Acme Inc." },
    { name: "location", label: "Location", type: "text", placeholder: "Remote, London, etc." },
  ],
  GRAD_SCHOOL: [
    { name: "institution", label: "Institution", type: "text", placeholder: "Stanford University" },
    { name: "program", label: "Program", type: "text", placeholder: "MBA" },
    { name: "deadline", label: "Application deadline", type: "text", placeholder: "Jan 15, 2027" },
  ],
  SALES: [
    { name: "company", label: "Company", type: "text" },
    { name: "contactEmail", label: "Contact email", type: "email", placeholder: "contact@company.com" },
  ],
  INVESTMENTS: [],
  CUSTOM: [],
};

export const HAS_SALARY_FIELDS: PipelineTemplate[] = ["JOB_SEARCH"];
export const HAS_DEAL_VALUE_FIELDS: PipelineTemplate[] = ["SALES"];
export const HAS_INVESTMENT_FIELDS: PipelineTemplate[] = ["INVESTMENTS"];
