-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "Cottage" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL DEFAULT 6,
    "bookingIcalUrl" TEXT,
    "description" TEXT,
    "areaM2" INTEGER,
    "bedrooms" INTEGER,
    "beds" TEXT,
    "amenities" TEXT,
    "pricePerNight" INTEGER,
    "petsAllowed" BOOLEAN NOT NULL DEFAULT false,
    "address" TEXT,
    "photos" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Cottage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reservation" (
    "id" TEXT NOT NULL,
    "cottageId" TEXT NOT NULL,
    "guestName" TEXT,
    "phone" TEXT,
    "guests" INTEGER NOT NULL DEFAULT 2,
    "checkIn" TIMESTAMP(3) NOT NULL,
    "checkOut" TIMESTAMP(3) NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'direct',
    "externalId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'confirmed',
    "notes" TEXT,
    "cleanedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Reservation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Cottage_slug_key" ON "Cottage"("slug");

-- CreateIndex
CREATE INDEX "Reservation_cottageId_checkIn_idx" ON "Reservation"("cottageId", "checkIn");

-- CreateIndex
CREATE UNIQUE INDEX "Reservation_cottageId_source_externalId_key" ON "Reservation"("cottageId", "source", "externalId");

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_cottageId_fkey" FOREIGN KEY ("cottageId") REFERENCES "Cottage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

