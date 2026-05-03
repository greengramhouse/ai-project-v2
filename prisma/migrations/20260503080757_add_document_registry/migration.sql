-- CreateEnum
CREATE TYPE "RegistryType" AS ENUM ('OUTGOING_LETTER', 'ORDER', 'ANNOUNCEMENT', 'INTERNAL_MEMO');

-- AlterTable
ALTER TABLE "user_profiles" ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'user';

-- CreateTable
CREATE TABLE "DocumentRegistry" (
    "id" SERIAL NOT NULL,
    "type" "RegistryType" NOT NULL,
    "runningNumber" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "fullDocumentNumber" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "recipient" TEXT,
    "url" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DocumentRegistry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DocumentRegistry_type_year_idx" ON "DocumentRegistry"("type", "year");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentRegistry_type_year_runningNumber_key" ON "DocumentRegistry"("type", "year", "runningNumber");
