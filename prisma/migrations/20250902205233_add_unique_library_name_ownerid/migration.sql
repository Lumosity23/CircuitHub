/*
  Warnings:

  - A unique constraint covering the columns `[name,ownerId]` on the table `libraries` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "libraries_name_ownerId_key" ON "public"."libraries"("name", "ownerId");
