-- CreateTable
CREATE TABLE "Til" (
    "id" TEXT NOT NULL,
    "raw" TEXT NOT NULL,
    "formatted" TEXT NOT NULL,
    "tags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Til_pkey" PRIMARY KEY ("id")
);
