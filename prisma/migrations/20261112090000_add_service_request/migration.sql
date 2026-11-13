-- CreateTable
CREATE TABLE "ServiceRequest" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "serviceKey" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nim" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "fields" TEXT NOT NULL,
    "attachment" TEXT,
    "status" TEXT NOT NULL DEFAULT 'diterima',
    "staffNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceRequestEvent" (
    "id" SERIAL NOT NULL,
    "requestId" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "note" TEXT,
    "by" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ServiceRequestEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ServiceRequest_code_key" ON "ServiceRequest"("code");

-- CreateIndex
CREATE INDEX "ServiceRequest_nim_idx" ON "ServiceRequest"("nim");

-- CreateIndex
CREATE INDEX "ServiceRequest_status_idx" ON "ServiceRequest"("status");

-- CreateIndex
CREATE INDEX "ServiceRequestEvent_requestId_idx" ON "ServiceRequestEvent"("requestId");

-- AddForeignKey
ALTER TABLE "ServiceRequestEvent" ADD CONSTRAINT "ServiceRequestEvent_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "ServiceRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
