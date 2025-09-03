-- CreateEnum
CREATE TYPE "public"."BomItemType" AS ENUM ('GROUP', 'COMPONENT');

-- AlterTable
ALTER TABLE "public"."project_bom_items" ADD COLUMN     "parentId" TEXT,
ADD COLUMN     "type" "public"."BomItemType" NOT NULL DEFAULT 'COMPONENT';

-- AddForeignKey
ALTER TABLE "public"."project_bom_items" ADD CONSTRAINT "project_bom_items_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "public"."project_bom_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;
