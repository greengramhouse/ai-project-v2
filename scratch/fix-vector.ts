import "dotenv/config";
import { prisma } from "../lib/prisma";

async function fixVector() {
  console.log("🛠️ Attempting to fix vector dimensions to 3072...");
  try {
    // 1. Drop the table if it exists (since we want to reset the dimension)
    await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "documents" CASCADE;`);
    console.log("✅ Dropped old documents table.");

    // 2. We'll let Prisma recreate it or do it manually.
    // Manually creating it ensures 3072.
    await prisma.$executeRawUnsafe(`
      CREATE TABLE "documents" (
        "id" TEXT NOT NULL,
        "content" TEXT NOT NULL,
        "metadata" JSONB,
        "embedding" vector(3072),
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
      );
    `);
    console.log("✅ Created new documents table with vector(3072).");
  } catch (error) {
    console.error("❌ Error fixing vector:", error);
  } finally {
    await prisma.$disconnect();
  }
}

fixVector();
