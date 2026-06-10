import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, PipelineTemplate } from "@prisma/client";
import bcrypt from "bcryptjs";
import { Pool } from "pg";
import { buildStagesFromInput } from "../lib/pipelines/stageColors";
import { PIPELINE_TEMPLATES } from "../lib/pipelines/templates";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

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
      stages: {
        create: definition.stages.map((s) => ({
          name: s.name,
          slug: s.slug,
          sortOrder: s.sortOrder,
          isEntry: s.isEntry ?? false,
          isTerminal: s.isTerminal ?? false,
          color: s.color,
        })),
      },
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
      stages: {
        create: definition.stages.map((s) => ({
          name: s.name,
          slug: s.slug,
          sortOrder: s.sortOrder,
          isEntry: s.isEntry ?? false,
          isTerminal: s.isTerminal ?? false,
          color: s.color,
        })),
      },
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

  for (const holding of holdings) {
    await prisma.item.create({
      data: {
        pipelineId: pipeline.id,
        title: holding.title,
        subtitle: holding.subtitle,
        currentStageId: holding.stageId,
        metadata: holding.metadata,
        stageEvents: { create: holding.events },
      },
    });
  }
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

  const createdIds: string[] = [];

  for (const tpl of templates) {
    const existing = await prisma.userTemplate.findFirst({
      where: { userId: alex.id, name: tpl.name },
    });
    if (existing) {
      createdIds.push(existing.id);
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
        stages: {
          create: tpl.stages.map((stage) => ({
            name: stage.name,
            slug: stage.slug,
            sortOrder: stage.sortOrder,
            isEntry: stage.isEntry ?? false,
            isTerminal: stage.isTerminal ?? false,
            color: stage.color,
          })),
        },
      },
    });
    createdIds.push(created.id);
  }

  const demo = await prisma.user.findUnique({ where: { email: "demo@waypoint.app" } });
  if (!demo || createdIds.length === 0) return;

  const freelanceId = createdIds[0];
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
        content: "Used this for my consulting side hustle — stages map perfectly to client work.",
      },
    });
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
        stages: {
          create: stages.map((stage) => ({
            name: stage.name,
            slug: stage.slug,
            sortOrder: stage.sortOrder,
            isEntry: stage.isEntry ?? false,
            isTerminal: stage.isTerminal ?? false,
            color: stage.color,
          })),
        },
        comments: {
          create: {
            userId: alex.id,
            content: "Clean flow for seed rounds — borrowed this for our raise tracker.",
          },
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
  await seedMarketplaceTemplates();

  console.log("Seed complete:");
  console.log(`  demo@waypoint.app / demo12345`);
  console.log(`  alex@waypoint.app / demo12345 (marketplace author)`);
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
