import { PipelineTemplate } from "@prisma/client";

export type StageDefinition = {
  name: string;
  slug: string;
  sortOrder: number;
  isEntry?: boolean;
  isTerminal?: boolean;
  color?: string;
};

export type TemplateDefinition = {
  template: PipelineTemplate;
  label: string;
  description: string;
  stages: StageDefinition[];
};

export const PIPELINE_TEMPLATES: Record<PipelineTemplate, TemplateDefinition> = {
  JOB_SEARCH: {
    template: "JOB_SEARCH",
    label: "Job Search",
    description: "Track applications from apply to offer.",
    stages: [
      { name: "Applied", slug: "applied", sortOrder: 0, isEntry: true, color: "#3b82f6" },
      { name: "Screening", slug: "screening", sortOrder: 1, color: "#8b5cf6" },
      { name: "Interview", slug: "interview", sortOrder: 2, color: "#06b6d4" },
      { name: "Offer", slug: "offer", sortOrder: 3, isTerminal: true, color: "#22c55e" },
      { name: "Rejected", slug: "rejected", sortOrder: 4, isTerminal: true, color: "#ef4444" },
      { name: "Withdrawn", slug: "withdrawn", sortOrder: 5, isTerminal: true, color: "#f59e0b" },
      { name: "Ghosted", slug: "ghosted", sortOrder: 6, isTerminal: true, color: "#6b7280" },
    ],
  },
  GRAD_SCHOOL: {
    template: "GRAD_SCHOOL",
    label: "Grad School",
    description: "Track university and program applications.",
    stages: [
      { name: "Researching", slug: "researching", sortOrder: 0, isEntry: true, color: "#3b82f6" },
      { name: "Applied", slug: "applied", sortOrder: 1, color: "#8b5cf6" },
      { name: "Interview", slug: "interview", sortOrder: 2, color: "#06b6d4" },
      { name: "Accepted", slug: "accepted", sortOrder: 3, isTerminal: true, color: "#22c55e" },
      { name: "Rejected", slug: "rejected", sortOrder: 4, isTerminal: true, color: "#ef4444" },
      { name: "Waitlisted", slug: "waitlisted", sortOrder: 5, isTerminal: true, color: "#f59e0b" },
    ],
  },
  SALES: {
    template: "SALES",
    label: "Sales & Leads",
    description: "Track leads from first contact to close.",
    stages: [
      { name: "Lead", slug: "lead", sortOrder: 0, isEntry: true, color: "#3b82f6" },
      { name: "Contacted", slug: "contacted", sortOrder: 1, color: "#8b5cf6" },
      { name: "Proposal", slug: "proposal", sortOrder: 2, color: "#06b6d4" },
      { name: "Won", slug: "won", sortOrder: 3, isTerminal: true, color: "#22c55e" },
      { name: "Lost", slug: "lost", sortOrder: 4, isTerminal: true, color: "#ef4444" },
    ],
  },
  INVESTMENTS: {
    template: "INVESTMENTS",
    label: "Investments",
    description: "Track holdings from research to exit with portfolio breakdown.",
    stages: [
      { name: "Researching", slug: "researching", sortOrder: 0, isEntry: true, color: "#3b82f6" },
      { name: "Watching", slug: "watching", sortOrder: 1, color: "#8b5cf6" },
      { name: "Bought", slug: "bought", sortOrder: 2, color: "#06b6d4" },
      { name: "Holding", slug: "holding", sortOrder: 3, color: "#22c55e" },
      { name: "Sold", slug: "sold", sortOrder: 4, isTerminal: true, color: "#f59e0b" },
      { name: "Passed", slug: "passed", sortOrder: 5, isTerminal: true, color: "#6b7280" },
    ],
  },
  CUSTOM: {
    template: "CUSTOM",
    label: "Custom",
    description: "Start with a basic pipeline (custom stages in v2).",
    stages: [
      { name: "Started", slug: "started", sortOrder: 0, isEntry: true, color: "#3b82f6" },
      { name: "In Progress", slug: "in-progress", sortOrder: 1, color: "#8b5cf6" },
      { name: "Complete", slug: "complete", sortOrder: 2, isTerminal: true, color: "#22c55e" },
      { name: "Dropped", slug: "dropped", sortOrder: 3, isTerminal: true, color: "#ef4444" },
    ],
  },
};

export const TEMPLATE_LIST = Object.values(PIPELINE_TEMPLATES).filter(
  (t) => t.template !== "CUSTOM",
);

export function getTemplateLabel(template: PipelineTemplate): string {
  return PIPELINE_TEMPLATES[template]?.label ?? template;
}
