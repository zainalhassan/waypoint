import { z } from "zod";

const pipelineTemplateEnum = z.enum([
  "JOB_SEARCH",
  "GRAD_SCHOOL",
  "SALES",
  "CUSTOM",
]);

export const registerSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

export const createPipelineSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  template: pipelineTemplateEnum,
});

export const createItemSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  subtitle: z.string().max(200).optional(),
  notes: z.string().max(5000).optional(),
  externalUrl: z.string().url().optional().or(z.literal("")),
  startedAt: z.string().optional(),
});

export const updateItemStageSchema = z.object({
  stageId: z.string().min(1),
});
