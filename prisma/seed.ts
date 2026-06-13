import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, PipelineTemplate } from "@prisma/client";
import bcrypt from "bcryptjs";
import { Pool } from "pg";
import { buildStagesFromInput } from "../lib/pipelines/stageColors";
import type { StageDefinition } from "../lib/pipelines/templates";
import { PIPELINE_TEMPLATES } from "../lib/pipelines/templates";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const DEMO_EMAIL = "demo@waypoint.app";
const ALEX_EMAIL = "alex@waypoint.app";

function stageRows(stages: StageDefinition[]) {
  return stages.map((stage) => ({
    name: stage.name,
    slug: stage.slug,
    sortOrder: stage.sortOrder,
    isEntry: stage.isEntry ?? false,
    isTerminal: stage.isTerminal ?? false,
    color: stage.color,
  }));
}

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function stageMap<T extends { slug: string; id: string }>(stages: T[]) {
  return Object.fromEntries(stages.map((s) => [s.slug, s.id])) as Record<string, string>;
}

type TimelineEvent = {
  from: string | null;
  to: string;
  daysAgo: number;
};

async function clearDemoUserData(userId: string) {
  await prisma.templateComment.deleteMany({ where: { userId } });
  await prisma.templateRating.deleteMany({ where: { userId } });
  await prisma.templateLike.deleteMany({ where: { userId } });
  await prisma.pipeline.deleteMany({ where: { userId } });
  await prisma.userTemplate.deleteMany({ where: { userId } });
}

async function createPipelineWithStages(
  userId: string,
  name: string,
  template: PipelineTemplate,
  opts?: { isArchived?: boolean; userTemplateId?: string },
) {
  const definition = PIPELINE_TEMPLATES[template];
  return prisma.pipeline.create({
    data: {
      userId,
      name,
      template,
      isArchived: opts?.isArchived ?? false,
      userTemplateId: opts?.userTemplateId,
      stages: { create: stageRows(definition.stages) },
    },
    include: { stages: { orderBy: { sortOrder: "asc" } } },
  });
}

async function createItemWithTimeline(
  pipelineId: string,
  stages: Record<string, string>,
  data: {
    title: string;
    subtitle?: string;
    notes?: string;
    externalUrl?: string;
    metadata?: object;
    startedAt?: Date;
    timeline: TimelineEvent[];
  },
) {
  const last = data.timeline[data.timeline.length - 1]!;
  const item = await prisma.item.create({
    data: {
      pipelineId,
      title: data.title,
      subtitle: data.subtitle,
      notes: data.notes,
      externalUrl: data.externalUrl,
      metadata: data.metadata,
      startedAt: data.startedAt ?? daysAgo(data.timeline[0]?.daysAgo ?? 30),
      currentStageId: stages[last.to]!,
    },
  });

  for (const event of data.timeline) {
    await prisma.stageEvent.create({
      data: {
        itemId: item.id,
        fromStageId: event.from ? stages[event.from] : null,
        toStageId: stages[event.to]!,
        occurredAt: daysAgo(event.daysAgo),
      },
    });
  }

  return item;
}

async function seedRichJobPipeline(userId: string) {
  const pipeline = await createPipelineWithStages(userId, "2026 Job Hunt", PipelineTemplate.JOB_SEARCH);
  const s = stageMap(pipeline.stages);

  const jobs = [
    {
      title: "Staff Engineer @ Stripe",
      subtitle: "Payments infrastructure",
      metadata: { company: "Stripe", location: "Remote (US)", salaryMin: 220000, salaryMax: 280000, salaryCurrency: "USD" },
      externalUrl: "https://stripe.com/jobs",
      notes: "Referral from Maria. System design round next Tuesday.",
      timeline: [
        { from: null, to: "applied", daysAgo: 45 },
        { from: "applied", to: "screening", daysAgo: 38 },
        { from: "screening", to: "interview", daysAgo: 28 },
      ],
    },
    {
      title: "Senior Engineer @ Vercel",
      subtitle: "Developer experience",
      metadata: { company: "Vercel", location: "Remote", salaryMin: 180000, salaryMax: 210000, salaryCurrency: "USD" },
      timeline: [
        { from: null, to: "applied", daysAgo: 30 },
        { from: "applied", to: "screening", daysAgo: 22 },
        { from: "screening", to: "interview", daysAgo: 14 },
        { from: "interview", to: "offer", daysAgo: 3 },
      ],
    },
    {
      title: "Platform Engineer @ Datadog",
      subtitle: "Observability platform",
      metadata: { company: "Datadog", location: "New York, NY", salaryMin: 170000, salaryMax: 200000, salaryCurrency: "USD" },
      timeline: [
        { from: null, to: "applied", daysAgo: 25 },
        { from: "applied", to: "screening", daysAgo: 18 },
        { from: "screening", to: "interview", daysAgo: 10 },
      ],
    },
    {
      title: "Backend Engineer @ Notion",
      subtitle: "Collaboration core",
      metadata: { company: "Notion", location: "San Francisco, CA", salaryMin: 165000, salaryMax: 195000, salaryCurrency: "USD" },
      timeline: [
        { from: null, to: "applied", daysAgo: 20 },
        { from: "applied", to: "screening", daysAgo: 12 },
      ],
    },
    {
      title: "Senior SWE @ Linear",
      subtitle: "Product engineering",
      metadata: { company: "Linear", location: "Remote (EU)", salaryMin: 150000, salaryMax: 180000, salaryCurrency: "USD" },
      timeline: [{ from: null, to: "applied", daysAgo: 18 }],
    },
    {
      title: "Full Stack @ Figma",
      subtitle: "Design tools",
      metadata: { company: "Figma", location: "Remote", salaryMin: 160000, salaryMax: 190000, salaryCurrency: "USD" },
      timeline: [
        { from: null, to: "applied", daysAgo: 35 },
        { from: "applied", to: "screening", daysAgo: 28 },
        { from: "screening", to: "interview", daysAgo: 20 },
        { from: "interview", to: "rejected", daysAgo: 8 },
      ],
    },
    {
      title: "Engineer @ Anthropic",
      subtitle: "Safety tooling",
      metadata: { company: "Anthropic", location: "San Francisco, CA", salaryMin: 200000, salaryMax: 250000, salaryCurrency: "USD" },
      timeline: [
        { from: null, to: "applied", daysAgo: 40 },
        { from: "applied", to: "ghosted", daysAgo: 25 },
      ],
    },
    {
      title: "SWE II @ Shopify",
      subtitle: "Commerce platform",
      metadata: { company: "Shopify", location: "Remote (Canada)", salaryMin: 130000, salaryMax: 155000, salaryCurrency: "USD" },
      timeline: [
        { from: null, to: "applied", daysAgo: 15 },
        { from: "applied", to: "withdrawn", daysAgo: 10 },
      ],
    },
    {
      title: "Senior Engineer @ Cloudflare",
      subtitle: "Edge network",
      metadata: { company: "Cloudflare", location: "Austin, TX", salaryMin: 175000, salaryMax: 205000, salaryCurrency: "USD" },
      timeline: [
        { from: null, to: "applied", daysAgo: 50 },
        { from: "applied", to: "screening", daysAgo: 42 },
        { from: "screening", to: "interview", daysAgo: 35 },
        { from: "interview", to: "rejected", daysAgo: 20 },
      ],
    },
    {
      title: "Principal Engineer @ Snowflake",
      subtitle: "Data platform",
      metadata: { company: "Snowflake", location: "Remote", salaryMin: 240000, salaryMax: 300000, salaryCurrency: "USD" },
      timeline: [{ from: null, to: "applied", daysAgo: 8 }],
    },
    {
      title: "Engineer @ Retool",
      subtitle: "Internal tools",
      metadata: { company: "Retool", location: "San Francisco, CA", salaryMin: 155000, salaryMax: 185000, salaryCurrency: "USD" },
      timeline: [
        { from: null, to: "applied", daysAgo: 12 },
        { from: "applied", to: "screening", daysAgo: 7 },
      ],
    },
    {
      title: "Senior Backend @ Monzo",
      subtitle: "Banking core",
      metadata: { company: "Monzo", location: "London, UK", salaryMin: 90000, salaryMax: 110000, salaryCurrency: "GBP" },
      timeline: [
        { from: null, to: "applied", daysAgo: 60 },
        { from: "applied", to: "screening", daysAgo: 52 },
        { from: "screening", to: "interview", daysAgo: 44 },
        { from: "interview", to: "offer", daysAgo: 30 },
      ],
    },
    {
      title: "SWE @ Plaid",
      subtitle: "Fintech APIs",
      metadata: { company: "Plaid", location: "Remote", salaryMin: 150000, salaryMax: 175000, salaryCurrency: "USD" },
      timeline: [{ from: null, to: "applied", daysAgo: 5 }],
    },
    {
      title: "Senior Engineer @ GitHub",
      subtitle: "Developer platform",
      metadata: { company: "GitHub", location: "Remote", salaryMin: 170000, salaryMax: 200000, salaryCurrency: "USD" },
      notes: "Recruiter reached out on LinkedIn.",
      timeline: [
        { from: null, to: "applied", daysAgo: 22 },
        { from: "applied", to: "screening", daysAgo: 16 },
        { from: "screening", to: "interview", daysAgo: 9 },
      ],
    },
    {
      title: "Engineer @ Ramp",
      subtitle: "Spend management",
      metadata: { company: "Ramp", location: "New York, NY", salaryMin: 160000, salaryMax: 190000, salaryCurrency: "USD" },
      timeline: [
        { from: null, to: "applied", daysAgo: 33 },
        { from: "applied", to: "ghosted", daysAgo: 18 },
      ],
    },
  ];

  for (const job of jobs) {
    await createItemWithTimeline(pipeline.id, s, job);
  }
}

async function seedRichGradPipeline(userId: string) {
  const pipeline = await createPipelineWithStages(userId, "MBA Applications 2027", PipelineTemplate.GRAD_SCHOOL);
  const s = stageMap(pipeline.stages);

  const programs = [
    {
      title: "Stanford GSB",
      subtitle: "MBA",
      metadata: { institution: "Stanford University", program: "MBA", deadline: "Jan 9, 2027" },
      externalUrl: "https://www.gsb.stanford.edu",
      timeline: [
        { from: null, to: "researching", daysAgo: 90 },
        { from: "researching", to: "applied", daysAgo: 45 },
        { from: "applied", to: "interview", daysAgo: 20 },
      ],
    },
    {
      title: "Harvard Business School",
      subtitle: "MBA",
      metadata: { institution: "Harvard University", program: "MBA", deadline: "Jan 4, 2027" },
      timeline: [
        { from: null, to: "researching", daysAgo: 80 },
        { from: "researching", to: "applied", daysAgo: 40 },
      ],
    },
    {
      title: "Wharton",
      subtitle: "MBA",
      metadata: { institution: "University of Pennsylvania", program: "MBA", deadline: "Jan 7, 2027" },
      timeline: [
        { from: null, to: "researching", daysAgo: 70 },
        { from: "researching", to: "applied", daysAgo: 35 },
        { from: "applied", to: "accepted", daysAgo: 5 },
      ],
    },
    {
      title: "MIT Sloan",
      subtitle: "MBA",
      metadata: { institution: "MIT", program: "MBA", deadline: "Jan 15, 2027" },
      timeline: [
        { from: null, to: "researching", daysAgo: 60 },
        { from: "researching", to: "applied", daysAgo: 30 },
        { from: "applied", to: "waitlisted", daysAgo: 10 },
      ],
    },
    {
      title: "INSEAD",
      subtitle: "MBA",
      metadata: { institution: "INSEAD", program: "MBA", deadline: "Mar 3, 2027" },
      timeline: [{ from: null, to: "researching", daysAgo: 25 }],
    },
    {
      title: "Columbia Business School",
      subtitle: "MBA",
      metadata: { institution: "Columbia University", program: "MBA", deadline: "Jan 5, 2027" },
      timeline: [
        { from: null, to: "researching", daysAgo: 55 },
        { from: "researching", to: "applied", daysAgo: 28 },
        { from: "applied", to: "rejected", daysAgo: 12 },
      ],
    },
    {
      title: "LBS",
      subtitle: "Masters in Management",
      metadata: { institution: "London Business School", program: "MiM", deadline: "Feb 1, 2027" },
      timeline: [
        { from: null, to: "researching", daysAgo: 40 },
        { from: "researching", to: "applied", daysAgo: 18 },
        { from: "applied", to: "interview", daysAgo: 7 },
      ],
    },
    {
      title: "Berkeley Haas",
      subtitle: "MBA",
      metadata: { institution: "UC Berkeley", program: "MBA", deadline: "Jan 8, 2027" },
      timeline: [{ from: null, to: "researching", daysAgo: 15 }],
    },
  ];

  for (const program of programs) {
    await createItemWithTimeline(pipeline.id, s, program);
  }
}

async function seedRichSalesPipeline(userId: string) {
  const pipeline = await createPipelineWithStages(userId, "Enterprise Sales Q2", PipelineTemplate.SALES);
  const s = stageMap(pipeline.stages);

  const deals = [
    {
      title: "Northwind Logistics",
      subtitle: "Annual platform license",
      metadata: { company: "Northwind Logistics", dealValue: 85000, dealCurrency: "USD", contactEmail: "procurement@northwind.io" },
      timeline: [
        { from: null, to: "lead", daysAgo: 60 },
        { from: "lead", to: "contacted", daysAgo: 50 },
        { from: "contacted", to: "proposal", daysAgo: 30 },
        { from: "proposal", to: "won", daysAgo: 5 },
      ],
    },
    {
      title: "Summit Health Systems",
      subtitle: "HIPAA-compliant deployment",
      metadata: { company: "Summit Health", dealValue: 120000, dealCurrency: "USD", contactEmail: "cto@summithealth.com" },
      timeline: [
        { from: null, to: "lead", daysAgo: 45 },
        { from: "lead", to: "contacted", daysAgo: 35 },
        { from: "contacted", to: "proposal", daysAgo: 15 },
      ],
    },
    {
      title: "Harbor Analytics",
      subtitle: "Pilot → expansion",
      metadata: { company: "Harbor Analytics", dealValue: 42000, dealCurrency: "USD", contactEmail: "sales@harbor.io" },
      timeline: [
        { from: null, to: "lead", daysAgo: 25 },
        { from: "lead", to: "contacted", daysAgo: 18 },
      ],
    },
    {
      title: "Brightline Retail",
      subtitle: "Multi-store rollout",
      metadata: { company: "Brightline Retail", dealValue: 65000, dealCurrency: "USD" },
      timeline: [{ from: null, to: "lead", daysAgo: 12 }],
    },
    {
      title: "Atlas Manufacturing",
      subtitle: "ERP integration",
      metadata: { company: "Atlas Manufacturing", dealValue: 95000, dealCurrency: "USD", contactEmail: "it@atlasmfg.com" },
      timeline: [
        { from: null, to: "lead", daysAgo: 70 },
        { from: "lead", to: "contacted", daysAgo: 55 },
        { from: "contacted", to: "proposal", daysAgo: 40 },
        { from: "proposal", to: "lost", daysAgo: 20 },
      ],
    },
    {
      title: "Pinecrest Education",
      subtitle: "District-wide license",
      metadata: { company: "Pinecrest Education", dealValue: 28000, dealCurrency: "USD" },
      timeline: [
        { from: null, to: "lead", daysAgo: 35 },
        { from: "lead", to: "contacted", daysAgo: 28 },
        { from: "contacted", to: "proposal", daysAgo: 20 },
        { from: "proposal", to: "won", daysAgo: 8 },
      ],
    },
    {
      title: "Velocity Media",
      subtitle: "Agency partnership",
      metadata: { company: "Velocity Media", dealValue: 18000, dealCurrency: "USD", contactEmail: "ops@velocity.media" },
      timeline: [
        { from: null, to: "lead", daysAgo: 20 },
        { from: "lead", to: "lost", daysAgo: 10 },
      ],
    },
    {
      title: "Greenfield Energy",
      subtitle: "Sustainability dashboard",
      metadata: { company: "Greenfield Energy", dealValue: 110000, dealCurrency: "USD" },
      timeline: [
        { from: null, to: "lead", daysAgo: 40 },
        { from: "lead", to: "contacted", daysAgo: 32 },
      ],
    },
    {
      title: "Copper Street Finance",
      subtitle: "Compliance module",
      metadata: { company: "Copper Street Finance", dealValue: 72000, dealCurrency: "USD", contactEmail: "compliance@copper.st" },
      timeline: [
        { from: null, to: "lead", daysAgo: 15 },
        { from: "lead", to: "contacted", daysAgo: 8 },
      ],
    },
    {
      title: "Lumen Design Co",
      subtitle: "Creative team seats",
      metadata: { company: "Lumen Design", dealValue: 12000, dealCurrency: "USD" },
      timeline: [{ from: null, to: "lead", daysAgo: 6 }],
    },
  ];

  for (const deal of deals) {
    await createItemWithTimeline(pipeline.id, s, deal);
  }
}

async function seedRichInvestmentsPipeline(userId: string) {
  const pipeline = await createPipelineWithStages(userId, "Investment Portfolio", PipelineTemplate.INVESTMENTS);
  const s = stageMap(pipeline.stages);

  const holdings = [
    { title: "Apple Inc.", subtitle: "AAPL", metadata: { assetType: "stock", ticker: "AAPL", amountInvested: 10000, currentValue: 12400, currency: "USD" }, timeline: [{ from: null, to: "researching", daysAgo: 120 }, { from: "researching", to: "bought", daysAgo: 100 }, { from: "bought", to: "holding", daysAgo: 95 }] },
    { title: "Vanguard S&P 500 ETF", subtitle: "VOO", metadata: { assetType: "etf", ticker: "VOO", amountInvested: 25000, currentValue: 28750, currency: "USD" }, timeline: [{ from: null, to: "bought", daysAgo: 200 }, { from: "bought", to: "holding", daysAgo: 195 }] },
    { title: "Bitcoin", subtitle: "BTC", metadata: { assetType: "crypto", ticker: "BTC", amountInvested: 5000, currentValue: 6200, currency: "USD" }, timeline: [{ from: null, to: "bought", daysAgo: 80 }, { from: "bought", to: "holding", daysAgo: 75 }] },
    { title: "NVIDIA", subtitle: "NVDA", metadata: { assetType: "stock", ticker: "NVDA", amountInvested: 8000, currentValue: 14200, currency: "USD" }, timeline: [{ from: null, to: "researching", daysAgo: 90 }, { from: "researching", to: "watching", daysAgo: 85 }, { from: "watching", to: "bought", daysAgo: 60 }, { from: "bought", to: "holding", daysAgo: 55 }] },
    { title: "Ethereum", subtitle: "ETH", metadata: { assetType: "crypto", ticker: "ETH", amountInvested: 3000, currentValue: 2800, currency: "USD" }, timeline: [{ from: null, to: "holding", daysAgo: 150 }] },
    { title: "Tesla", subtitle: "TSLA", metadata: { assetType: "stock", ticker: "TSLA", amountInvested: 6000, currentValue: 5100, currency: "USD" }, timeline: [{ from: null, to: "bought", daysAgo: 180 }, { from: "bought", to: "sold", daysAgo: 30 }] },
    { title: "Palantir", subtitle: "PLTR", metadata: { assetType: "stock", ticker: "PLTR", amountInvested: 0, currentValue: 0, currency: "USD" }, timeline: [{ from: null, to: "researching", daysAgo: 14 }] },
    { title: "Solana", subtitle: "SOL", metadata: { assetType: "crypto", ticker: "SOL", amountInvested: 0, currentValue: 0, currency: "USD" }, timeline: [{ from: null, to: "watching", daysAgo: 7 }] },
    { title: "Berkshire Hathaway", subtitle: "BRK.B", metadata: { assetType: "stock", ticker: "BRK.B", amountInvested: 15000, currentValue: 16800, currency: "USD" }, timeline: [{ from: null, to: "holding", daysAgo: 300 }] },
    { title: "Coinbase", subtitle: "COIN", metadata: { assetType: "stock", ticker: "COIN", amountInvested: 4000, currentValue: 3200, currency: "USD" }, timeline: [{ from: null, to: "researching", daysAgo: 45 }, { from: "researching", to: "passed", daysAgo: 40 }] },
  ];

  for (const row of holdings) {
    await createItemWithTimeline(pipeline.id, s, row);
  }
}

async function seedArchivedPipeline(userId: string) {
  const pipeline = await createPipelineWithStages(userId, "2024 Job Hunt (archived)", PipelineTemplate.JOB_SEARCH, { isArchived: true });
  const s = stageMap(pipeline.stages);

  await createItemWithTimeline(pipeline.id, s, {
    title: "Engineer @ OldCorp",
    subtitle: "Legacy role",
    metadata: { company: "OldCorp", location: "Remote", salaryMin: 100000, salaryMax: 120000, salaryCurrency: "USD" },
    timeline: [
      { from: null, to: "applied", daysAgo: 400 },
      { from: "applied", to: "offer", daysAgo: 350 },
    ],
  });
}

async function replaceTemplateStages(templateId: string, stages: StageDefinition[]) {
  await prisma.userTemplateStage.deleteMany({ where: { userTemplateId: templateId } });
  await prisma.userTemplate.update({
    where: { id: templateId },
    data: { stages: { create: stageRows(stages) } },
  });
}

async function seedMarketplaceTemplates() {
  let alex = await prisma.user.findUnique({ where: { email: ALEX_EMAIL } });

  if (!alex) {
    alex = await prisma.user.create({
      data: {
        name: "Alex Rivera",
        email: ALEX_EMAIL,
        passwordHash: await bcrypt.hash("demo12345", 12),
      },
    });
  }

  const templates = [
    {
      name: "Freelance Projects",
      description: "Track client work from inquiry to delivery and payment.",
      stages: buildStagesFromInput([
        { name: "Inquiry", isEntry: true },
        { name: "Proposal sent" },
        { name: "In progress" },
        { name: "Delivered" },
        { name: "Paid", isTerminal: true },
        { name: "Declined", isTerminal: true },
      ]),
      metrics: { likeCount: 12, copyCount: 28, ratingSum: 44, ratingCount: 10, commentCount: 3 },
    },
    {
      name: "Home Renovation",
      description: "Plan and track renovation tasks from idea to done.",
      stages: buildStagesFromInput([
        { name: "Idea", isEntry: true },
        { name: "Quoted" },
        { name: "Scheduled" },
        { name: "In progress" },
        { name: "Complete", isTerminal: true },
        { name: "On hold", isTerminal: true },
      ]),
      metrics: { likeCount: 8, copyCount: 15, ratingSum: 27, ratingCount: 6, commentCount: 2 },
    },
    {
      name: "Content Creation",
      description: "YouTube and blog pipeline from brainstorm to publish.",
      stages: buildStagesFromInput([
        { name: "Idea", isEntry: true },
        { name: "Outline" },
        { name: "Drafting" },
        { name: "Editing" },
        { name: "Published", isTerminal: true },
        { name: "Shelved", isTerminal: true },
      ]),
      metrics: { likeCount: 19, copyCount: 41, ratingSum: 68, ratingCount: 15, commentCount: 5 },
    },
    {
      name: "PhD Application Tracker",
      description: "Research programs, deadlines, and advisor outreach.",
      stages: buildStagesFromInput([
        { name: "Researching", isEntry: true },
        { name: "Advisor contacted" },
        { name: "Applied" },
        { name: "Interview" },
        { name: "Admitted", isTerminal: true },
        { name: "Rejected", isTerminal: true },
      ]),
      metrics: { likeCount: 6, copyCount: 11, ratingSum: 18, ratingCount: 4, commentCount: 1 },
    },
    {
      name: "Real Estate Offers",
      description: "Track properties from viewing to closing.",
      stages: buildStagesFromInput([
        { name: "Shortlisted", isEntry: true },
        { name: "Viewed" },
        { name: "Offer made" },
        { name: "Under contract" },
        { name: "Closed", isTerminal: true },
        { name: "Passed", isTerminal: true },
      ]),
      metrics: { likeCount: 4, copyCount: 7, ratingSum: 9, ratingCount: 2, commentCount: 0 },
    },
  ];

  const templateIds: Record<string, string> = {};

  for (const tpl of templates) {
    const existing = await prisma.userTemplate.findFirst({
      where: { userId: alex.id, name: tpl.name },
    });

    if (existing) {
      templateIds[tpl.name] = existing.id;
      continue;
    }

    const created = await prisma.userTemplate.create({
      data: {
        userId: alex.id,
        name: tpl.name,
        description: tpl.description,
        isPublic: true,
        publishedAt: daysAgo(30),
        likeCount: tpl.metrics.likeCount,
        copyCount: tpl.metrics.copyCount,
        ratingSum: tpl.metrics.ratingSum,
        ratingCount: tpl.metrics.ratingCount,
        commentCount: tpl.metrics.commentCount,
        stages: { create: stageRows(tpl.stages) },
      },
    });
    templateIds[tpl.name] = created.id;
  }

  return { alex, templateIds };
}

async function seedDemoMarketplaceEngagement(demoId: string, alexId: string, alexTemplateIds: Record<string, string>) {
  for (const [name, templateId] of Object.entries(alexTemplateIds)) {
    await prisma.templateLike.upsert({
      where: { userId_userTemplateId: { userId: demoId, userTemplateId: templateId } },
      create: { userId: demoId, userTemplateId: templateId },
      update: {},
    });

    if (name === "Freelance Projects") {
      await prisma.templateRating.upsert({
        where: { userId_userTemplateId: { userId: demoId, userTemplateId: templateId } },
        create: { userId: demoId, userTemplateId: templateId, rating: 5 },
        update: { rating: 5 },
      });
      const existing = await prisma.templateComment.findFirst({
        where: { userId: demoId, userTemplateId: templateId },
      });
      if (!existing) {
        await prisma.templateComment.create({
          data: {
            userId: demoId,
            userTemplateId: templateId,
            content: "Used this for my consulting side hustle — stages map perfectly to client work.",
          },
        });
      }
    }
  }

  const fundraisingStages = buildStagesFromInput([
    { name: "Prospect list", isEntry: true },
    { name: "Outreach" },
    { name: "Meeting" },
    { name: "Due diligence" },
    { name: "Committed", isTerminal: true },
    { name: "Passed", isTerminal: true },
  ]);

  let demoPublic = await prisma.userTemplate.findFirst({
    where: { userId: demoId, name: "Startup Fundraising" },
  });

  if (!demoPublic) {
    demoPublic = await prisma.userTemplate.create({
      data: {
        userId: demoId,
        name: "Startup Fundraising",
        description: "Track investor conversations from first touch to close.",
        isPublic: true,
        publishedAt: daysAgo(14),
        likeCount: 5,
        copyCount: 9,
        ratingSum: 13,
        ratingCount: 3,
        commentCount: 1,
        stages: { create: stageRows(fundraisingStages) },
        comments: {
          create: {
            userId: alexId,
            content: "Clean flow for seed rounds — borrowed this for our raise tracker.",
          },
        },
      },
    });

    const pipeline = await prisma.pipeline.create({
      data: {
        userId: demoId,
        userTemplateId: demoPublic.id,
        name: "Seed Round 2026",
        template: PipelineTemplate.CUSTOM,
        stages: { create: stageRows(fundraisingStages) },
      },
      include: { stages: true },
    });

    const s = stageMap(pipeline.stages);
    const investors = [
      { title: "Sequoia Scout", timeline: [{ from: null, to: "prospect-list", daysAgo: 30 }, { from: "prospect-list", to: "outreach", daysAgo: 20 }, { from: "outreach", to: "meeting", daysAgo: 10 }] },
      { title: "a16z Speedrun", timeline: [{ from: null, to: "prospect-list", daysAgo: 25 }, { from: "prospect-list", to: "outreach", daysAgo: 15 }] },
      { title: "Local angel — Priya", timeline: [{ from: null, to: "meeting", daysAgo: 18 }, { from: "meeting", to: "due-diligence", daysAgo: 8 }] },
      { title: "YC Continuity", timeline: [{ from: null, to: "outreach", daysAgo: 12 }, { from: "outreach", to: "passed", daysAgo: 5 }] },
    ];
    for (const inv of investors) {
      await createItemWithTimeline(pipeline.id, s, inv);
    }
  }
}

async function seedDemoTemplateScenarios(demoId: string, alexTemplateIds: Record<string, string>) {
  const freelanceSourceId = alexTemplateIds["Freelance Projects"];
  const renovationSourceId = alexTemplateIds["Home Renovation"];
  const contentSourceId = alexTemplateIds["Content Creation"];
  if (!freelanceSourceId || !renovationSourceId || !contentSourceId) return;

  const freelanceOldStages = buildStagesFromInput([
    { name: "Inquiry", isEntry: true },
    { name: "Proposal sent" },
    { name: "In progress" },
    { name: "Delivered" },
    { name: "Paid", isTerminal: true },
    { name: "Declined", isTerminal: true },
  ]);

  const freelanceNewStages = buildStagesFromInput([
    { name: "Inquiry", isEntry: true },
    { name: "Proposal sent" },
    { name: "Delivered" },
    { name: "Paid", isTerminal: true },
    { name: "Declined", isTerminal: true },
  ]);

  const alexFreelance = await prisma.userTemplate.findUnique({
    where: { id: freelanceSourceId },
    include: { stages: true },
  });
  if (alexFreelance && alexFreelance.stages.some((s) => s.slug === "in-progress")) {
    await replaceTemplateStages(freelanceSourceId, freelanceNewStages);
  }

  let linkedFreelance = await prisma.userTemplate.create({
    data: {
      userId: demoId,
      name: "Freelance Projects",
      description: "Linked copy — Alex removed the In progress stage; sync wizard needed.",
      forkedFromId: freelanceSourceId,
      isLinkedToSource: true,
      pendingSourceSync: true,
      stages: { create: stageRows(freelanceOldStages) },
    },
    include: { stages: true },
  });

  const freelancePipeline = await prisma.pipeline.create({
    data: {
      userId: demoId,
      userTemplateId: linkedFreelance.id,
      name: "Q2 Client Work",
      template: PipelineTemplate.CUSTOM,
      stages: { create: stageRows(freelanceOldStages) },
    },
    include: { stages: true },
  });

  const fs = stageMap(freelancePipeline.stages);
  await createItemWithTimeline(freelancePipeline.id, fs, {
    title: "Brand refresh — Northwind Studio",
    subtitle: "Logo + style guide",
    metadata: { company: "Northwind Studio" },
    timeline: [
      { from: null, to: "inquiry", daysAgo: 40 },
      { from: "inquiry", to: "proposal-sent", daysAgo: 30 },
      { from: "proposal-sent", to: "in-progress", daysAgo: 20 },
    ],
  });
  await createItemWithTimeline(freelancePipeline.id, fs, {
    title: "Landing page — Harbor Analytics",
    subtitle: "React marketing site",
    timeline: [
      { from: null, to: "inquiry", daysAgo: 25 },
      { from: "inquiry", to: "in-progress", daysAgo: 15 },
    ],
  });
  await createItemWithTimeline(freelancePipeline.id, fs, {
    title: "API audit — Summit Health",
    subtitle: "Security review",
    timeline: [
      { from: null, to: "inquiry", daysAgo: 50 },
      { from: "inquiry", to: "in-progress", daysAgo: 35 },
      { from: "in-progress", to: "delivered", daysAgo: 10 },
    ],
  });

  const renovationStages = buildStagesFromInput([
    { name: "Idea", isEntry: true },
    { name: "Quoted" },
    { name: "Scheduled" },
    { name: "In progress" },
    { name: "Complete", isTerminal: true },
    { name: "On hold", isTerminal: true },
  ]);

  const linkedRenovation = await prisma.userTemplate.create({
    data: {
      userId: demoId,
      name: "Home Renovation",
      description: "Linked copy in sync with marketplace — safe auto-sync example.",
      forkedFromId: renovationSourceId,
      isLinkedToSource: true,
      pendingSourceSync: false,
      stages: { create: stageRows(renovationStages) },
    },
  });

  const renovationPipeline = await prisma.pipeline.create({
    data: {
      userId: demoId,
      userTemplateId: linkedRenovation.id,
      name: "Kitchen & Bath Remodel",
      template: PipelineTemplate.CUSTOM,
      stages: { create: stageRows(renovationStages) },
    },
    include: { stages: true },
  });

  const rs = stageMap(renovationPipeline.stages);
  await createItemWithTimeline(renovationPipeline.id, rs, {
    title: "Kitchen cabinets",
    subtitle: "Custom oak, soft-close",
    timeline: [
      { from: null, to: "idea", daysAgo: 60 },
      { from: "idea", to: "quoted", daysAgo: 45 },
      { from: "quoted", to: "scheduled", daysAgo: 30 },
      { from: "scheduled", to: "in-progress", daysAgo: 14 },
    ],
  });
  await createItemWithTimeline(renovationPipeline.id, rs, {
    title: "Bathroom tile",
    subtitle: "Heated floors",
    timeline: [
      { from: null, to: "idea", daysAgo: 50 },
      { from: "idea", to: "quoted", daysAgo: 35 },
      { from: "quoted", to: "complete", daysAgo: 5 },
    ],
  });
  await createItemWithTimeline(renovationPipeline.id, rs, {
    title: "Backyard deck",
    subtitle: "Composite decking",
    timeline: [{ from: null, to: "idea", daysAgo: 20 }],
  });

  const contentEditedStages = buildStagesFromInput([
    { name: "Brainstorm", isEntry: true },
    { name: "Outline" },
    { name: "Script draft" },
    { name: "Record & edit" },
    { name: "Published", isTerminal: true },
    { name: "Shelved", isTerminal: true },
  ]);

  const independentContent = await prisma.userTemplate.create({
    data: {
      userId: demoId,
      name: "My YouTube Workflow",
      description: "Independent copy — edited freely, not linked to Alex's template.",
      forkedFromId: contentSourceId,
      isLinkedToSource: false,
      pendingSourceSync: false,
      stages: { create: stageRows(contentEditedStages) },
    },
  });

  const contentPipeline = await prisma.pipeline.create({
    data: {
      userId: demoId,
      userTemplateId: independentContent.id,
      name: "Waypoint Launch Videos",
      template: PipelineTemplate.CUSTOM,
      stages: { create: stageRows(contentEditedStages) },
    },
    include: { stages: true },
  });

  const cs = stageMap(contentPipeline.stages);
  const videos = [
    { title: "Why pipeline trackers beat spreadsheets", subtitle: "Launch video #1", timeline: [{ from: null, to: "brainstorm", daysAgo: 30 }, { from: "brainstorm", to: "outline", daysAgo: 22 }, { from: "outline", to: "script-draft", daysAgo: 14 }] },
    { title: "Building a Sankey chart in 10 minutes", subtitle: "Tutorial", timeline: [{ from: null, to: "brainstorm", daysAgo: 20 }, { from: "brainstorm", to: "record-edit", daysAgo: 8 }] },
    { title: "Marketplace templates deep dive", subtitle: "Feature walkthrough", timeline: [{ from: null, to: "brainstorm", daysAgo: 10 }, { from: "brainstorm", to: "published", daysAgo: 2 }] },
    { title: "Dark mode design tokens", subtitle: "Shelved for now", timeline: [{ from: null, to: "brainstorm", daysAgo: 15 }, { from: "brainstorm", to: "shelved", daysAgo: 12 }] },
  ];
  for (const video of videos) {
    await createItemWithTimeline(contentPipeline.id, cs, video);
  }
}

async function main() {
  const passwordHash = await bcrypt.hash("demo12345", 12);

  const user = await prisma.user.upsert({
    where: { email: DEMO_EMAIL },
    update: { name: "Demo User", passwordHash },
    create: { name: "Demo User", email: DEMO_EMAIL, passwordHash, defaultCurrency: "USD" },
  });

  console.log("Resetting demo user data…");
  await clearDemoUserData(user.id);

  console.log("Seeding pipelines…");
  await seedRichJobPipeline(user.id);
  await seedRichGradPipeline(user.id);
  await seedRichSalesPipeline(user.id);
  await seedRichInvestmentsPipeline(user.id);
  await seedArchivedPipeline(user.id);

  console.log("Seeding marketplace & templates…");
  const { alex, templateIds } = await seedMarketplaceTemplates();
  await seedDemoMarketplaceEngagement(user.id, alex.id, templateIds);
  await seedDemoTemplateScenarios(user.id, templateIds);

  const counts = await prisma.$transaction([
    prisma.pipeline.count({ where: { userId: user.id, isArchived: false } }),
    prisma.item.count({ where: { pipeline: { userId: user.id } } }),
    prisma.userTemplate.count({ where: { userId: user.id } }),
  ]);

  console.log("");
  console.log("Seed complete:");
  console.log("");
  console.log("  demo@waypoint.app / demo12345");
  console.log("  alex@waypoint.app / demo12345");
  console.log("");
  console.log(`  Demo user: ${counts[0]} active pipelines, ${counts[1]} items, ${counts[2]} templates`);
  console.log("");
  console.log("Explore:");
  console.log("  • Home — 8 active pipelines (+ 1 archived, hidden)");
  console.log("  • 2026 Job Hunt — 15 applications, board/table views, analytics");
  console.log("  • MBA Applications — 8 programs with deadlines");
  console.log("  • Enterprise Sales Q2 — 10 deals with values");
  console.log("  • Investment Portfolio — 10 holdings across stages");
  console.log("  • Q2 Client Work — sync wizard scenario (2 items in removed stage)");
  console.log("  • Kitchen & Bath Remodel — linked template, 3 renovation items");
  console.log("  • Waypoint Launch Videos — 4 videos on custom template");
  console.log("  • Seed Round 2026 — fundraising pipeline");
  console.log("  • Marketplace — 5 public templates from Alex");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
