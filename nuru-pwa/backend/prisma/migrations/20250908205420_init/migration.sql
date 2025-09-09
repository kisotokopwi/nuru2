-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SUPERVISOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "ServiceType" AS ENUM ('WAREHOUSE', 'CARGO', 'FERTILIZER', 'EQUIPMENT', 'TRANSPORT');

-- CreateEnum
CREATE TYPE "InvoiceType" AS ENUM ('CLIENT', 'INTERNAL');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Client" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "billingDetails" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Site" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "serviceType" "ServiceType" NOT NULL,
    "location" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Site_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkerType" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "dailyRate" DECIMAL(10,2) NOT NULL,
    "overtimeMultiplier" DECIMAL(5,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkerType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UsersOnSites" (
    "userId" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UsersOnSites_pkey" PRIMARY KEY ("userId","siteId")
);

-- CreateTable
CREATE TABLE "DailyReport" (
    "id" TEXT NOT NULL,
    "supervisorId" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "workDate" TIMESTAMP(3) NOT NULL,
    "submittedAt" TIMESTAMP(3),
    "lockedAt" TIMESTAMP(3),
    "totalAmount" DECIMAL(12,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkerEntry" (
    "id" TEXT NOT NULL,
    "dailyReportId" TEXT NOT NULL,
    "workerTypeId" TEXT NOT NULL,
    "count" INTEGER NOT NULL,
    "hours" INTEGER NOT NULL DEFAULT 0,
    "overtimeHours" INTEGER NOT NULL DEFAULT 0,
    "productionMetrics" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkerEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL,
    "dailyReportId" TEXT NOT NULL,
    "type" "InvoiceType" NOT NULL,
    "referenceId" TEXT,
    "amount" DECIMAL(12,2) NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pdfPath" TEXT,
    "immutable" BOOLEAN NOT NULL DEFAULT true,
    "signature" TEXT,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "tableName" TEXT NOT NULL,
    "recordId" TEXT NOT NULL,
    "oldValues" JSONB,
    "newValues" JSONB,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvoiceAccessLog" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "userId" TEXT,
    "ip" TEXT,
    "userAgent" TEXT,
    "accessedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InvoiceAccessLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Client_email_key" ON "Client"("email");

-- CreateIndex
CREATE INDEX "Project_clientId_idx" ON "Project"("clientId");

-- CreateIndex
CREATE INDEX "Site_projectId_idx" ON "Site"("projectId");

-- CreateIndex
CREATE INDEX "Site_serviceType_idx" ON "Site"("serviceType");

-- CreateIndex
CREATE INDEX "WorkerType_siteId_idx" ON "WorkerType"("siteId");

-- CreateIndex
CREATE INDEX "UsersOnSites_siteId_idx" ON "UsersOnSites"("siteId");

-- CreateIndex
CREATE INDEX "DailyReport_supervisorId_idx" ON "DailyReport"("supervisorId");

-- CreateIndex
CREATE INDEX "DailyReport_siteId_idx" ON "DailyReport"("siteId");

-- CreateIndex
CREATE INDEX "DailyReport_workDate_idx" ON "DailyReport"("workDate");

-- CreateIndex
CREATE INDEX "WorkerEntry_dailyReportId_idx" ON "WorkerEntry"("dailyReportId");

-- CreateIndex
CREATE INDEX "WorkerEntry_workerTypeId_idx" ON "WorkerEntry"("workerTypeId");

-- CreateIndex
CREATE INDEX "Invoice_dailyReportId_idx" ON "Invoice"("dailyReportId");

-- CreateIndex
CREATE INDEX "Invoice_type_idx" ON "Invoice"("type");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_tableName_idx" ON "AuditLog"("tableName");

-- CreateIndex
CREATE INDEX "AuditLog_recordId_idx" ON "AuditLog"("recordId");

-- CreateIndex
CREATE INDEX "InvoiceAccessLog_invoiceId_idx" ON "InvoiceAccessLog"("invoiceId");

-- CreateIndex
CREATE INDEX "InvoiceAccessLog_userId_idx" ON "InvoiceAccessLog"("userId");

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Site" ADD CONSTRAINT "Site_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkerType" ADD CONSTRAINT "WorkerType_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsersOnSites" ADD CONSTRAINT "UsersOnSites_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsersOnSites" ADD CONSTRAINT "UsersOnSites_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyReport" ADD CONSTRAINT "DailyReport_supervisorId_fkey" FOREIGN KEY ("supervisorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyReport" ADD CONSTRAINT "DailyReport_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkerEntry" ADD CONSTRAINT "WorkerEntry_dailyReportId_fkey" FOREIGN KEY ("dailyReportId") REFERENCES "DailyReport"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkerEntry" ADD CONSTRAINT "WorkerEntry_workerTypeId_fkey" FOREIGN KEY ("workerTypeId") REFERENCES "WorkerType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_dailyReportId_fkey" FOREIGN KEY ("dailyReportId") REFERENCES "DailyReport"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceAccessLog" ADD CONSTRAINT "InvoiceAccessLog_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceAccessLog" ADD CONSTRAINT "InvoiceAccessLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
