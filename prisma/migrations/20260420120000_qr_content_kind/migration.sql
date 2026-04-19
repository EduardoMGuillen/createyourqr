-- CreateEnum
CREATE TYPE "QrContentKind" AS ENUM ('URL', 'EMAIL', 'PHONE', 'SMS', 'TEXT', 'WIFI');

-- AlterTable
ALTER TABLE "QrCode" ADD COLUMN "contentKind" "QrContentKind" NOT NULL DEFAULT 'URL';
ALTER TABLE "QrCode" ADD COLUMN "payloadJson" JSONB;

-- AlterTable (nullable for non-URL kinds)
ALTER TABLE "QrCode" ALTER COLUMN "destinationUrl" DROP NOT NULL;
