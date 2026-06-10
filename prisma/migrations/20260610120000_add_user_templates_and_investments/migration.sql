-- AlterEnum
ALTER TYPE "PipelineTemplate" ADD VALUE 'INVESTMENTS';

-- CreateTable
CREATE TABLE "UserTemplate" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserTemplateStage" (
    "id" TEXT NOT NULL,
    "userTemplateId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "isEntry" BOOLEAN NOT NULL DEFAULT false,
    "isTerminal" BOOLEAN NOT NULL DEFAULT false,
    "color" TEXT,

    CONSTRAINT "UserTemplateStage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserTemplate_userId_idx" ON "UserTemplate"("userId");

-- CreateIndex
CREATE INDEX "UserTemplateStage_userTemplateId_sortOrder_idx" ON "UserTemplateStage"("userTemplateId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "UserTemplateStage_userTemplateId_slug_key" ON "UserTemplateStage"("userTemplateId", "slug");

-- AddForeignKey
ALTER TABLE "UserTemplate" ADD CONSTRAINT "UserTemplate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserTemplateStage" ADD CONSTRAINT "UserTemplateStage_userTemplateId_fkey" FOREIGN KEY ("userTemplateId") REFERENCES "UserTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
