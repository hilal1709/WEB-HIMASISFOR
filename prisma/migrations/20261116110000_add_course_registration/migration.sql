CREATE TABLE "CourseRegistration" (
    "id" SERIAL NOT NULL,
    "courseSlug" TEXT NOT NULL,
    "courseTitle" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "nim" TEXT,
    "audience" TEXT NOT NULL,
    "answers" TEXT,
    "documents" TEXT,
    "status" TEXT NOT NULL DEFAULT 'baru',
    "staffNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CourseRegistration_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "CourseRegistration_courseSlug_idx" ON "CourseRegistration"("courseSlug");
CREATE INDEX "CourseRegistration_status_idx" ON "CourseRegistration"("status");
CREATE INDEX "CourseRegistration_createdAt_idx" ON "CourseRegistration"("createdAt");
