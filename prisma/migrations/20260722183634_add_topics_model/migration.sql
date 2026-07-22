-- Create Topic table
CREATE TABLE "Topic" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Topic_pkey" PRIMARY KEY ("id")
);

-- Migrate existing topics from Til table
INSERT INTO "Topic" ("id", "name", "userId")
SELECT gen_random_uuid()::text, LOWER(TRIM(t.topic)), t."userId"
FROM (SELECT DISTINCT "topic", "userId" FROM "Til" WHERE "topic" IS NOT NULL AND TRIM("topic") != '') t;

-- Add topicId column to Til
ALTER TABLE "Til" ADD COLUMN "topicId" TEXT;

-- Set topicId based on migrated topics
UPDATE "Til" til
SET "topicId" = topic."id"
FROM "Topic" topic
WHERE LOWER(TRIM(til."topic")) = topic."name"
  AND til."userId" = topic."userId";

-- Drop old topic column and index
DROP INDEX IF EXISTS "Til_userId_topic_idx";
ALTER TABLE "Til" DROP COLUMN "topic";

-- Create new indexes
CREATE INDEX "Til_userId_topicId_idx" ON "Til"("userId", "topicId");
CREATE INDEX "Topic_userId_idx" ON "Topic"("userId");

-- Create unique constraint on Topic
CREATE UNIQUE INDEX "Topic_userId_name_key" ON "Topic"("userId", "name");

-- Add foreign keys
ALTER TABLE "Til" ADD CONSTRAINT "Til_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Topic" ADD CONSTRAINT "Topic_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
