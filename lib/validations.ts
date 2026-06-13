import { z } from "zod";
import { CURRENCIES } from "@/lib/currencies";

const currencyCodes = CURRENCIES.map((c) => c.code) as [string, ...string[]];

const pipelineTemplateEnum = z.enum([
  "JOB_SEARCH",
  "GRAD_SCHOOL",
  "SALES",
  "INVESTMENTS",
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
  template: pipelineTemplateEnum.optional(),
});

export const createItemSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  subtitle: z.string().max(200).optional(),
  notes: z.string().max(5000).optional(),
  externalUrl: z.string().url().optional().or(z.literal("")),
  startedAt: z.string().optional(),
});

export const updateItemSchema = createItemSchema;

export const updateItemStageSchema = z.object({
  stageId: z.string().min(1),
});

export const updateSettingsSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  defaultCurrency: z.enum(currencyCodes),
});

export const updatePipelineSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
