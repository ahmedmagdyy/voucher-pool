-- AlterTable
ALTER TABLE "VoucherCode" ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "redeemedAt" DROP NOT NULL;
