CREATE TABLE "ScholarshipApplication" (
    "id" SERIAL NOT NULL,
    "scholarshipSlug" TEXT NOT NULL,
    "scholarshipName" TEXT NOT NULL,
    "applicantType" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "nim" TEXT,
    "semester" INTEGER,
    "ipk" DOUBLE PRECISION,
    "income" TEXT,
    "school" TEXT,
    "graduationYear" INTEGER,
    "reportScore" DOUBLE PRECISION,
    "admissionStatus" TEXT,
    "notes" TEXT,
    "answers" TEXT,
    "documents" TEXT,
    "status" TEXT NOT NULL DEFAULT 'baru',
    "staffNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScholarshipApplication_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ScholarshipApplication_scholarshipSlug_idx" ON "ScholarshipApplication"("scholarshipSlug");
CREATE INDEX "ScholarshipApplication_status_idx" ON "ScholarshipApplication"("status");
CREATE INDEX "ScholarshipApplication_createdAt_idx" ON "ScholarshipApplication"("createdAt");
