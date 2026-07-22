-- Add columns and index to match existing database state
ALTER TABLE "Til" ADD COLUMN "title" TEXT;
ALTER TABLE "Til" ADD COLUMN "topic" TEXT;
CREATE INDEX "Til_userId_topic_idx" ON "Til"("userId", "topic");
