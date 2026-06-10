-- AlterTable
ALTER TABLE "UserTemplate" ADD COLUMN "isPublic" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "UserTemplate" ADD COLUMN "publishedAt" TIMESTAMP(3);
ALTER TABLE "UserTemplate" ADD COLUMN "forkedFromId" TEXT;
ALTER TABLE "UserTemplate" ADD COLUMN "likeCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "UserTemplate" ADD COLUMN "copyCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "UserTemplate" ADD COLUMN "ratingSum" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "UserTemplate" ADD COLUMN "ratingCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "UserTemplate" ADD COLUMN "commentCount" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "TemplateLike" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userTemplateId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TemplateLike_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TemplateRating" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userTemplateId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TemplateRating_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TemplateComment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userTemplateId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TemplateComment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserTemplate_isPublic_publishedAt_idx" ON "UserTemplate"("isPublic", "publishedAt");
CREATE INDEX "UserTemplate_isPublic_copyCount_idx" ON "UserTemplate"("isPublic", "copyCount");
CREATE INDEX "UserTemplate_isPublic_likeCount_idx" ON "UserTemplate"("isPublic", "likeCount");
CREATE INDEX "UserTemplate_isPublic_ratingCount_ratingSum_idx" ON "UserTemplate"("isPublic", "ratingCount", "ratingSum");
CREATE UNIQUE INDEX "TemplateLike_userId_userTemplateId_key" ON "TemplateLike"("userId", "userTemplateId");
CREATE INDEX "TemplateLike_userTemplateId_idx" ON "TemplateLike"("userTemplateId");
CREATE UNIQUE INDEX "TemplateRating_userId_userTemplateId_key" ON "TemplateRating"("userId", "userTemplateId");
CREATE INDEX "TemplateRating_userTemplateId_idx" ON "TemplateRating"("userTemplateId");
CREATE INDEX "TemplateComment_userTemplateId_createdAt_idx" ON "TemplateComment"("userTemplateId", "createdAt");

-- AddForeignKey
ALTER TABLE "UserTemplate" ADD CONSTRAINT "UserTemplate_forkedFromId_fkey" FOREIGN KEY ("forkedFromId") REFERENCES "UserTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "TemplateLike" ADD CONSTRAINT "TemplateLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TemplateLike" ADD CONSTRAINT "TemplateLike_userTemplateId_fkey" FOREIGN KEY ("userTemplateId") REFERENCES "UserTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TemplateRating" ADD CONSTRAINT "TemplateRating_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TemplateRating" ADD CONSTRAINT "TemplateRating_userTemplateId_fkey" FOREIGN KEY ("userTemplateId") REFERENCES "UserTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TemplateComment" ADD CONSTRAINT "TemplateComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TemplateComment" ADD CONSTRAINT "TemplateComment_userTemplateId_fkey" FOREIGN KEY ("userTemplateId") REFERENCES "UserTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
