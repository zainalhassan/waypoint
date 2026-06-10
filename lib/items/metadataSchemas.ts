import { PipelineTemplate } from "@prisma/client";
import { z } from "zod";

const jobSearchMetadata = z.object({
  company: z.string().optional(),
  location: z.string().optional(),
  salaryRange: z.string().optional(),
});

const gradSchoolMetadata = z.object({
  institution: z.string().optional(),
  program: z.string().optional(),
  deadline: z.string().optional(),
});

const salesMetadata = z.object({
  company: z.string().optional(),
  dealValue: z.coerce.number().optional(),
  contactEmail: z.string().email().optional().or(z.literal("")),
});

const customMetadata = z.record(z.string(), z.unknown()).optional();

const schemas: Record<PipelineTemplate, z.ZodTypeAny> = {
  JOB_SEARCH: jobSearchMetadata,
  GRAD_SCHOOL: gradSchoolMetadata,
  SALES: salesMetadata,
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
};

export const METADATA_FIELDS: Record<PipelineTemplate, MetadataField[]> = {
  JOB_SEARCH: [
    { name: "company", label: "Company", type: "text", placeholder: "Acme Inc." },
    { name: "location", label: "Location", type: "text", placeholder: "Remote" },
    { name: "salaryRange", label: "Salary range", type: "text", placeholder: "$120k–$150k" },
  ],
  GRAD_SCHOOL: [
    { name: "institution", label: "Institution", type: "text" },
    { name: "program", label: "Program", type: "text" },
    { name: "deadline", label: "Deadline", type: "text", placeholder: "Jan 15, 2027" },
  ],
  SALES: [
    { name: "company", label: "Company", type: "text" },
    { name: "dealValue", label: "Deal value", type: "number" },
    { name: "contactEmail", label: "Contact email", type: "email" },
  ],
  CUSTOM: [],
};
