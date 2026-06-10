-- AlterTable
ALTER TABLE "UserTemplate" ADD COLUMN "pendingSourceSync" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Pipeline" ADD COLUMN "userTemplateId" TEXT;

-- AlterTable
ALTER TABLE "Stage" ADD COLUMN "isArchived" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "Pipeline_userTemplateId_idx" ON "Pipeline"("userTemplateId");

-- AddForeignKey
ALTER TABLE "Pipeline" ADD CONSTRAINT "Pipeline_userTemplateId_fkey" FOREIGN KEY ("userTemplateId") REFERENCES "UserTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;
