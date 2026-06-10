import type { StageDefinition } from "@/lib/pipelines/templates";
import { STAGE_COLOR_PALETTE, slugify } from "@/lib/pipelines/slugify";

export type StageInput = {
  name: string;
  isEntry?: boolean;
  isTerminal?: boolean;
};

export function buildStagesFromInput(stages: StageInput[]): StageDefinition[] {
  return stages.map((stage, index) => ({
    name: stage.name.trim(),
    slug: slugify(stage.name),
    sortOrder: index,
    isEntry: stage.isEntry ?? index === 0,
    isTerminal: stage.isTerminal ?? false,
    color: STAGE_COLOR_PALETTE[index % STAGE_COLOR_PALETTE.length],
  }));
}
