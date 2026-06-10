-- DropForeignKey
ALTER TABLE "StageEvent" DROP CONSTRAINT "StageEvent_fromStageId_fkey";
ALTER TABLE "StageEvent" DROP CONSTRAINT "StageEvent_toStageId_fkey";

-- AddForeignKey
ALTER TABLE "StageEvent" ADD CONSTRAINT "StageEvent_fromStageId_fkey" FOREIGN KEY ("fromStageId") REFERENCES "Stage"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "StageEvent" ADD CONSTRAINT "StageEvent_toStageId_fkey" FOREIGN KEY ("toStageId") REFERENCES "Stage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
