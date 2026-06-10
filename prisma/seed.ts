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

async function seedJobPipeline(userId: string) {
  const existing = await prisma.pipeline.findFirst({
    where: { userId, name: "2026 Job Hunt" },
  });
  if (existing) return;

  const definition = PIPELINE_TEMPLATES[PipelineTemplate.JOB_SEARCH];
  const pipeline = await prisma.pipeline.create({
    data: {
      userId,
      name: "2026 Job Hunt",
      template: PipelineTemplate.JOB_SEARCH,
      stages: { create: stageRows(definition.stages) },
    },
    include: { stages: true },
  });

  const applied = pipeline.stages.find((s) => s.slug === "applied")!;
  const screening = pipeline.stages.find((s) => s.slug === "screening")!;
  const interview = pipeline.stages.find((s) => s.slug === "interview")!;

  await prisma.item.create({
    data: {
      pipelineId: pipeline.id,
      title: "Senior Engineer @ Acme Corp",
      subtitle: "Platform team",
      currentStageId: interview.id,
      metadata: {
        company: "Acme Corp",
        location: "Remote",
        salaryMin: 120000,
        salaryMax: 150000,
        salaryCurrency: "USD",
      },
      stageEvents: {
        create: [
          { fromStageId: null, toStageId: applied.id },
          { fromStageId: applied.id, toStageId: screening.id },
          { fromStageId: screening.id, toStageId: interview.id },
        ],
      },
    },
  });
}

async function seedInvestmentsPipeline(userId: string) {
  const existing = await prisma.pipeline.findFirst({
    where: { userId, name: "Investment Portfolio" },
  });
  if (existing) return;

  const definition = PIPELINE_TEMPLATES[PipelineTemplate.INVESTMENTS];
  const pipeline = await prisma.pipeline.create({
    data: {
      userId,
      name: "Investment Portfolio",
      template: PipelineTemplate.INVESTMENTS,
      stages: { create: stageRows(definition.stages) },
    },
    include: { stages: true },
  });

  const holding = pipeline.stages.find((s) => s.slug === "holding")!;
  const bought = pipeline.stages.find((s) => s.slug === "bought")!;
  const researching = pipeline.stages.find((s) => s.slug === "researching")!;

  const holdings = [
    {
      title: "Apple Inc.",
      subtitle: "AAPL",
      stageId: holding.id,
      metadata: {
        assetType: "stock",
        ticker: "AAPL",
        amountInvested: 10000,
        currentValue: 12400,
        currency: "USD",
      },
      events: [
        { fromStageId: null, toStageId: researching.id },
        { fromStageId: researching.id, toStageId: bought.id },
        { fromStageId: bought.id, toStageId: holding.id },
      ],
    },
    {
      title: "Vanguard S&P 500 ETF",
      subtitle: "VOO",
      stageId: holding.id,
      metadata: {
        assetType: "etf",
        ticker: "VOO",
        amountInvested: 25000,
        currentValue: 28750,
        currency: "USD",
      },
      events: [
        { fromStageId: null, toStageId: bought.id },
        { fromStageId: bought.id, toStageId: holding.id },
      ],
    },
    {
      title: "Bitcoin",
      subtitle: "BTC",
      stageId: holding.id,
      metadata: {
        assetType: "crypto",
        ticker: "BTC",
        amountInvested: 5000,
        currentValue: 6200,
        currency: "USD",
      },
      events: [
        { fromStageId: null, toStageId: bought.id },
        { fromStageId: bought.id, toStageId: holding.id },
      ],
    },
  ];

  for (const row of holdings) {
    await prisma.item.create({
      data: {
        pipelineId: pipeline.id,
        title: row.title,
        subtitle: row.subtitle,
        currentStageId: row.stageId,
        metadata: row.metadata,
        stageEvents: { create: row.events },
      },
    });
  }
}

async function replaceTemplateStages(templateId: string, stages: StageDefinition[]) {
  await prisma.userTemplateStage.deleteMany({ where: { userTemplateId: templateId } });
  await prisma.userTemplate.update({
    where: { id: templateId },
    data: { stages: { create: stageRows(stages) } },
  });
}

async function seedMarketplaceTemplates() {
  const alexEmail = "alex@waypoint.app";
  let alex = await prisma.user.findUnique({ where: { email: alexEmail } });

  if (!alex) {
    alex = await prisma.user.create({
      data: {
        name: "Alex Rivera",
        email: alexEmail,
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
        publishedAt: new Date(),
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

  const demo = await prisma.user.findUnique({ where: { email: "demo@waypoint.app" } });
  if (!demo) return templateIds;

  const freelanceId = templateIds["Freelance Projects"];
  if (freelanceId) {
    const existingLike = await prisma.templateLike.findFirst({
      where: { userId: demo.id, userTemplateId: freelanceId },
    });
    if (!existingLike) {
      await prisma.templateLike.create({
        data: { userId: demo.id, userTemplateId: freelanceId },
      });
    }

    const existingRating = await prisma.templateRating.findFirst({
      where: { userId: demo.id, userTemplateId: freelanceId },
    });
    if (!existingRating) {
      await prisma.templateRating.create({
        data: { userId: demo.id, userTemplateId: freelanceId, rating: 5 },
      });
    }

    const existingComment = await prisma.templateComment.findFirst({
      where: { userId: demo.id, userTemplateId: freelanceId },
    });
    if (!existingComment) {
      await prisma.templateComment.create({
        data: {
          userId: demo.id,
          userTemplateId: freelanceId,
          content:
            "Used this for my consulting side hustle — stages map perfectly to client work.",
        },
      });
    }
  }

  const demoPublic = await prisma.userTemplate.findFirst({
    where: { userId: demo.id, name: "Startup Fundraising" },
  });
  if (!demoPublic) {
    const stages = buildStagesFromInput([
      { name: "Prospect list", isEntry: true },
      { name: "Outreach" },
      { name: "Meeting" },
      { name: "Due diligence" },
      { name: "Committed", isTerminal: true },
      { name: "Passed", isTerminal: true },
    ]);
    await prisma.userTemplate.create({
      data: {
        userId: demo.id,
        name: "Startup Fundraising",
        description: "Track investor conversations from first touch to close.",
        isPublic: true,
        publishedAt: new Date(),
        likeCount: 5,
        copyCount: 9,
        ratingSum: 13,
        ratingCount: 3,
        commentCount: 1,
        stages: { create: stageRows(stages) },
        comments: {
          create: {
            userId: alex.id,
            content: "Clean flow for seed rounds — borrowed this for our raise tracker.",
          },
        },
      },
    });
  }

  return templateIds;
}

/** Demo scenarios for linked copies, sync wizard, and independent edits. */
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

  let linkedFreelance = await prisma.userTemplate.findFirst({
    where: { userId: demoId, forkedFromId: freelanceSourceId, isLinkedToSource: true },
    include: { stages: true },
  });

  if (!linkedFreelance) {
    linkedFreelance = await prisma.userTemplate.create({
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
  } else {
    const hasInProgress = linkedFreelance.stages.some((s) => s.slug === "in-progress");
    if (!hasInProgress) {
      await replaceTemplateStages(linkedFreelance.id, freelanceOldStages);
    }
    await prisma.userTemplate.update({
      where: { id: linkedFreelance.id },
      data: { pendingSourceSync: true, isLinkedToSource: true },
    });
    linkedFreelance = await prisma.userTemplate.findUniqueOrThrow({
      where: { id: linkedFreelance.id },
      include: { stages: true },
    });
  }

  const pipelineName = "Q2 Client Work";
  let freelancePipeline = await prisma.pipeline.findFirst({
    where: { userId: demoId, name: pipelineName },
    include: { stages: true, items: true },
  });

  if (!freelancePipeline) {
    freelancePipeline = await prisma.pipeline.create({
      data: {
        userId: demoId,
        userTemplateId: linkedFreelance.id,
        name: pipelineName,
        template: PipelineTemplate.CUSTOM,
        stages: { create: stageRows(freelanceOldStages) },
      },
      include: { stages: true, items: true },
    });

    const inquiry = freelancePipeline.stages.find((s) => s.slug === "inquiry")!;
    const inProgress = freelancePipeline.stages.find((s) => s.slug === "in-progress")!;
    const delivered = freelancePipeline.stages.find((s) => s.slug === "delivered")!;

    await prisma.item.createMany({
      data: [
        {
          pipelineId: freelancePipeline.id,
          title: "Brand refresh — Northwind Studio",
          subtitle: "Logo + style guide",
          currentStageId: inProgress.id,
        },
        {
          pipelineId: freelancePipeline.id,
          title: "Landing page — Harbor Analytics",
          subtitle: "React marketing site",
          currentStageId: inProgress.id,
        },
        {
          pipelineId: freelancePipeline.id,
          title: "API audit — Summit Health",
          subtitle: "Security review",
          currentStageId: delivered.id,
        },
      ],
    });

    const items = await prisma.item.findMany({ where: { pipelineId: freelancePipeline.id } });
    const northwind = items.find((i) => i.title.includes("Northwind"))!;
    const harbor = items.find((i) => i.title.includes("Harbor"))!;
    const summit = items.find((i) => i.title.includes("Summit"))!;

    await prisma.stageEvent.createMany({
      data: [
        { itemId: northwind.id, fromStageId: null, toStageId: inquiry.id },
        { itemId: northwind.id, fromStageId: inquiry.id, toStageId: inProgress.id },
        { itemId: harbor.id, fromStageId: null, toStageId: inquiry.id },
        { itemId: harbor.id, fromStageId: inquiry.id, toStageId: inProgress.id },
        { itemId: summit.id, fromStageId: null, toStageId: inquiry.id },
        { itemId: summit.id, fromStageId: inquiry.id, toStageId: inProgress.id },
        { itemId: summit.id, fromStageId: inProgress.id, toStageId: delivered.id },
      ],
    });
  }

  const renovationStages = buildStagesFromInput([
    { name: "Idea", isEntry: true },
    { name: "Quoted" },
    { name: "Scheduled" },
    { name: "In progress" },
    { name: "Complete", isTerminal: true },
    { name: "On hold", isTerminal: true },
  ]);

  let linkedRenovation = await prisma.userTemplate.findFirst({
    where: { userId: demoId, forkedFromId: renovationSourceId, isLinkedToSource: true },
  });

  if (!linkedRenovation) {
    linkedRenovation = await prisma.userTemplate.create({
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
  }

  const contentEditedStages = buildStagesFromInput([
    { name: "Brainstorm", isEntry: true },
    { name: "Outline" },
    { name: "Script draft" },
    { name: "Record & edit" },
    { name: "Published", isTerminal: true },
    { name: "Shelved", isTerminal: true },
  ]);

  let independentContent = await prisma.userTemplate.findFirst({
    where: {
      userId: demoId,
      name: "My YouTube Workflow",
      forkedFromId: contentSourceId,
      isLinkedToSource: false,
    },
  });

  if (!independentContent) {
    independentContent = await prisma.userTemplate.create({
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

    const pipeline = await prisma.pipeline.create({
      data: {
        userId: demoId,
        userTemplateId: independentContent.id,
        name: "Waypoint Launch Videos",
        template: PipelineTemplate.CUSTOM,
        stages: { create: stageRows(contentEditedStages) },
      },
      include: { stages: true },
    });

    const idea = pipeline.stages.find((s) => s.slug === "brainstorm")!;
    const scriptDraft = pipeline.stages.find((s) => s.slug === "script-draft")!;

    await prisma.item.create({
      data: {
        pipelineId: pipeline.id,
        title: "Why pipeline trackers beat spreadsheets",
        subtitle: "Launch video #1",
        currentStageId: scriptDraft.id,
        stageEvents: {
          create: [
            { fromStageId: null, toStageId: idea.id },
            { fromStageId: idea.id, toStageId: scriptDraft.id },
          ],
        },
      },
    });
  }
}

async function main() {
  const email = "demo@waypoint.app";
  const passwordHash = await bcrypt.hash("demo12345", 12);

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      name: "Demo User",
      email,
      passwordHash,
    },
  });

  await seedJobPipeline(user.id);
  await seedInvestmentsPipeline(user.id);
  const alexTemplateIds = await seedMarketplaceTemplates();
  await seedDemoTemplateScenarios(user.id, alexTemplateIds);

  console.log("Seed complete:");
  console.log("");
  console.log("  demo@waypoint.app / demo12345");
  console.log("  alex@waypoint.app / demo12345");
  console.log("");
  console.log("Demo scenarios (log in as demo):");
  console.log("  1. Templates → Freelance Projects → Review sync (wizard: 2 items in removed stage)");
  console.log("  2. Templates → Home Renovation → linked, in sync (try Sync now — auto applies)");
  console.log("  3. Templates → My YouTube Workflow → independent copy (Edit freely)");
  console.log("  4. Pipelines → Q2 Client Work → items stuck in In progress until sync");
  console.log("  5. Marketplace → browse Alex's templates, likes, comments");
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
