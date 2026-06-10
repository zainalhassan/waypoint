import { z } from "zod";

const stageSchema = z.object({
  name: z.string().min(1, "Stage name is required").max(50),
  isEntry: z.boolean().optional(),
  isTerminal: z.boolean().optional(),
});

export const templateFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(300).optional(),
  stages: z.array(stageSchema).min(2, "Add at least two stages"),
});

export function parseTemplateFormData(formData: FormData) {
  const stageNames = formData.getAll("stageName").map(String);
  const stageTerminal = formData.getAll("stageTerminal").map((v) => String(v) === "on");
  const stageEntry = formData.getAll("stageEntry").map((v) => String(v) === "on");

  const stages = stageNames
    .map((name, i) => ({
      name: name.trim(),
      isEntry: stageEntry[i] ?? i === 0,
      isTerminal: stageTerminal[i] ?? false,
    }))
    .filter((s) => s.name.length > 0);

  return templateFormSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    stages,
  });
}
