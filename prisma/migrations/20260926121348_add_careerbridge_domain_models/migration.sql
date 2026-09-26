/*
  Warnings:

  - You are about to drop the column `createdAt` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `emailVerified` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `firstName` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `lastName` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `users` table. All the data in the column will be lost.
  - Added the required column `first_name` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `last_name` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password_hash` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'DEACTIVATED');

-- CreateEnum
CREATE TYPE "ProfileStatus" AS ENUM ('INCOMPLETE', 'COMPLETE');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'NON_BINARY', 'PREFER_NOT_TO_SAY');

-- CreateEnum
CREATE TYPE "GraduationStatus" AS ENUM ('FINAL_YEAR', 'GRADUATED');

-- CreateEnum
CREATE TYPE "MentorApplicationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "MentorRequestStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED', 'CANCELLED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "RoadmapTaskStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED');

-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'GRADUATE';

-- DropIndex
DROP INDEX "users_isActive_idx";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "createdAt",
DROP COLUMN "emailVerified",
DROP COLUMN "firstName",
DROP COLUMN "isActive",
DROP COLUMN "lastName",
DROP COLUMN "password",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "first_name" TEXT NOT NULL,
ADD COLUMN     "last_name" TEXT NOT NULL,
ADD COLUMN     "password_hash" TEXT NOT NULL,
ADD COLUMN     "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "profiles" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "status" "ProfileStatus" NOT NULL DEFAULT 'INCOMPLETE',
    "phone_number" VARCHAR(30),
    "gender" "Gender",
    "institution_name" TEXT,
    "field_of_study" TEXT,
    "graduation_status" "GraduationStatus",
    "graduation_year" INTEGER,
    "bio" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skills" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profile_skills" (
    "profile_id" UUID NOT NULL,
    "skill_id" UUID NOT NULL,

    CONSTRAINT "profile_skills_pkey" PRIMARY KEY ("profile_id","skill_id")
);

-- CreateTable
CREATE TABLE "career_interests" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "career_interests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profile_career_interests" (
    "profile_id" UUID NOT NULL,
    "career_interest_id" UUID NOT NULL,

    CONSTRAINT "profile_career_interests_pkey" PRIMARY KEY ("profile_id","career_interest_id")
);

-- CreateTable
CREATE TABLE "mentor_profiles" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "applicationStatus" "MentorApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "professional_title" TEXT,
    "organisation" TEXT,
    "years_of_experience" INTEGER,
    "bio" TEXT,
    "is_available" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mentor_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mentor_skills" (
    "mentor_profile_id" UUID NOT NULL,
    "skill_id" UUID NOT NULL,

    CONSTRAINT "mentor_skills_pkey" PRIMARY KEY ("mentor_profile_id","skill_id")
);

-- CreateTable
CREATE TABLE "mentor_career_interests" (
    "mentor_profile_id" UUID NOT NULL,
    "career_interest_id" UUID NOT NULL,

    CONSTRAINT "mentor_career_interests_pkey" PRIMARY KEY ("mentor_profile_id","career_interest_id")
);

-- CreateTable
CREATE TABLE "career_pathways" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "career_pathways_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "career_pathway_interests" (
    "career_pathway_id" UUID NOT NULL,
    "career_interest_id" UUID NOT NULL,

    CONSTRAINT "career_pathway_interests_pkey" PRIMARY KEY ("career_pathway_id","career_interest_id")
);

-- CreateTable
CREATE TABLE "roadmaps" (
    "id" UUID NOT NULL,
    "profile_id" UUID NOT NULL,
    "pathway_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roadmaps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roadmap_tasks" (
    "id" UUID NOT NULL,
    "roadmap_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL,
    "status" "RoadmapTaskStatus" NOT NULL DEFAULT 'PENDING',
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roadmap_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mentor_requests" (
    "id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "mentor_id" UUID NOT NULL,
    "status" "MentorRequestStatus" NOT NULL DEFAULT 'PENDING',
    "message" TEXT,
    "requested_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "responded_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "mentor_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feedback" (
    "id" UUID NOT NULL,
    "mentor_request_id" UUID NOT NULL,
    "author_id" UUID NOT NULL,
    "recipient_id" UUID NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "feedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "profiles_user_id_key" ON "profiles"("user_id");

-- CreateIndex
CREATE INDEX "profiles_graduation_status_idx" ON "profiles"("graduation_status");

-- CreateIndex
CREATE UNIQUE INDEX "skills_name_key" ON "skills"("name");

-- CreateIndex
CREATE INDEX "profile_skills_skill_id_idx" ON "profile_skills"("skill_id");

-- CreateIndex
CREATE UNIQUE INDEX "career_interests_name_key" ON "career_interests"("name");

-- CreateIndex
CREATE INDEX "profile_career_interests_career_interest_id_idx" ON "profile_career_interests"("career_interest_id");

-- CreateIndex
CREATE UNIQUE INDEX "mentor_profiles_user_id_key" ON "mentor_profiles"("user_id");

-- CreateIndex
CREATE INDEX "mentor_profiles_applicationStatus_idx" ON "mentor_profiles"("applicationStatus");

-- CreateIndex
CREATE INDEX "mentor_profiles_is_available_idx" ON "mentor_profiles"("is_available");

-- CreateIndex
CREATE INDEX "mentor_skills_skill_id_idx" ON "mentor_skills"("skill_id");

-- CreateIndex
CREATE INDEX "mentor_career_interests_career_interest_id_idx" ON "mentor_career_interests"("career_interest_id");

-- CreateIndex
CREATE UNIQUE INDEX "career_pathways_name_key" ON "career_pathways"("name");

-- CreateIndex
CREATE INDEX "career_pathways_is_active_idx" ON "career_pathways"("is_active");

-- CreateIndex
CREATE INDEX "career_pathway_interests_career_interest_id_idx" ON "career_pathway_interests"("career_interest_id");

-- CreateIndex
CREATE INDEX "roadmaps_profile_id_idx" ON "roadmaps"("profile_id");

-- CreateIndex
CREATE INDEX "roadmaps_pathway_id_idx" ON "roadmaps"("pathway_id");

-- CreateIndex
CREATE UNIQUE INDEX "roadmaps_profile_id_pathway_id_key" ON "roadmaps"("profile_id", "pathway_id");

-- CreateIndex
CREATE INDEX "roadmap_tasks_roadmap_id_status_idx" ON "roadmap_tasks"("roadmap_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "roadmap_tasks_roadmap_id_order_key" ON "roadmap_tasks"("roadmap_id", "order");

-- CreateIndex
CREATE INDEX "mentor_requests_student_id_status_idx" ON "mentor_requests"("student_id", "status");

-- CreateIndex
CREATE INDEX "mentor_requests_mentor_id_status_idx" ON "mentor_requests"("mentor_id", "status");

-- CreateIndex
CREATE INDEX "mentor_requests_status_idx" ON "mentor_requests"("status");

-- CreateIndex
CREATE UNIQUE INDEX "feedback_mentor_request_id_key" ON "feedback"("mentor_request_id");

-- CreateIndex
CREATE INDEX "feedback_author_id_idx" ON "feedback"("author_id");

-- CreateIndex
CREATE INDEX "feedback_recipient_id_idx" ON "feedback"("recipient_id");

-- CreateIndex
CREATE INDEX "users_status_idx" ON "users"("status");

-- AddForeignKey
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profile_skills" ADD CONSTRAINT "profile_skills_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profile_skills" ADD CONSTRAINT "profile_skills_skill_id_fkey" FOREIGN KEY ("skill_id") REFERENCES "skills"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profile_career_interests" ADD CONSTRAINT "profile_career_interests_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profile_career_interests" ADD CONSTRAINT "profile_career_interests_career_interest_id_fkey" FOREIGN KEY ("career_interest_id") REFERENCES "career_interests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mentor_profiles" ADD CONSTRAINT "mentor_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mentor_skills" ADD CONSTRAINT "mentor_skills_mentor_profile_id_fkey" FOREIGN KEY ("mentor_profile_id") REFERENCES "mentor_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mentor_skills" ADD CONSTRAINT "mentor_skills_skill_id_fkey" FOREIGN KEY ("skill_id") REFERENCES "skills"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mentor_career_interests" ADD CONSTRAINT "mentor_career_interests_mentor_profile_id_fkey" FOREIGN KEY ("mentor_profile_id") REFERENCES "mentor_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mentor_career_interests" ADD CONSTRAINT "mentor_career_interests_career_interest_id_fkey" FOREIGN KEY ("career_interest_id") REFERENCES "career_interests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "career_pathway_interests" ADD CONSTRAINT "career_pathway_interests_career_pathway_id_fkey" FOREIGN KEY ("career_pathway_id") REFERENCES "career_pathways"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "career_pathway_interests" ADD CONSTRAINT "career_pathway_interests_career_interest_id_fkey" FOREIGN KEY ("career_interest_id") REFERENCES "career_interests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roadmaps" ADD CONSTRAINT "roadmaps_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roadmaps" ADD CONSTRAINT "roadmaps_pathway_id_fkey" FOREIGN KEY ("pathway_id") REFERENCES "career_pathways"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roadmap_tasks" ADD CONSTRAINT "roadmap_tasks_roadmap_id_fkey" FOREIGN KEY ("roadmap_id") REFERENCES "roadmaps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mentor_requests" ADD CONSTRAINT "mentor_requests_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mentor_requests" ADD CONSTRAINT "mentor_requests_mentor_id_fkey" FOREIGN KEY ("mentor_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_mentor_request_id_fkey" FOREIGN KEY ("mentor_request_id") REFERENCES "mentor_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_recipient_id_fkey" FOREIGN KEY ("recipient_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
