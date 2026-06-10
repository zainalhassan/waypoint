export type StageSnapshot = {
  slug: string;
  name: string;
  sortOrder: number;
  isEntry: boolean;
  isTerminal: boolean;
  color: string | null;
};

export type RemovedStageImpact = {
  slug: string;
  name: string;
  itemCount: number;
  pipelines: { id: string; name: string; count: number }[];
};

export type SyncPreview = {
  templateId: string;
  templateName: string;
  sourceName: string;
  added: StageSnapshot[];
  removed: StageSnapshot[];
  updated: { slug: string; before: StageSnapshot; after: StageSnapshot }[];
  unchanged: StageSnapshot[];
  removedWithItems: RemovedStageImpact[];
  targetStages: StageSnapshot[];
  requiresWizard: boolean;
  pendingSourceSync: boolean;
};

export type StageMappings = Record<string, string>;
