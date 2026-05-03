-- AlterTable
ALTER TABLE "DocumentRegistry" ADD COLUMN     "ownerId" TEXT,
ADD COLUMN     "ownerName" TEXT NOT NULL DEFAULT 'ไม่ระบุชื่อ';

-- AddForeignKey
ALTER TABLE "DocumentRegistry" ADD CONSTRAINT "DocumentRegistry_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "user_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
