-- AlterTable
ALTER TABLE "sync_logs" ADD COLUMN     "cancelRequested" BOOLEAN NOT NULL DEFAULT false;
