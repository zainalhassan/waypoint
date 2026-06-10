import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, PipelineTemplate } from "@prisma/client";
import bcrypt from "bcryptjs";
import { Pool } from "pg";
import { PIPELINE_TEMPLATES } from "../lib/pipelines/templates";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

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

  const existing = await prisma.pipeline.findFirst({
    where: { userId: user.id, name: "2026 Job Hunt" },
  });

  if (existing) {
    console.log("Seed data already exists");
    return;
  }

  const definition = PIPELINE_TEMPLATES[PipelineTemplate.JOB_SEARCH];
  const pipeline = await prisma.pipeline.create({
    data: {
      userId: user.id,
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

  const item = await prisma.item.create({
    data: {
      pipelineId: pipeline.id,
      title: "Senior Engineer @ Acme Corp",
      subtitle: "Platform team",
      currentStageId: interview.id,
      metadata: { company: "Acme Corp", location: "Remote" },
      stageEvents: {
        create: [
          { fromStageId: null, toStageId: applied.id },
          { fromStageId: applied.id, toStageId: screening.id },
          { fromStageId: screening.id, toStageId: interview.id },
        ],
      },
    },
  });

  console.log(`Seeded demo user: ${email} / demo12345`);
  console.log(`Pipeline: ${pipeline.id}, sample item: ${item.id}`);
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
