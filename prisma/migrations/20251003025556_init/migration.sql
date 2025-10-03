-- CreateTable
CREATE TABLE "public"."User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."timestamps" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "time_in" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "time_out" TIMESTAMP(3),
    "duration" INTEGER,
    "country" TEXT,
    "timeZone" TEXT,
    "utcOffset" TEXT,
    "localTimeIn" TEXT,
    "localTimeOut" TEXT,

    CONSTRAINT "timestamps_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- AddForeignKey
ALTER TABLE "public"."timestamps" ADD CONSTRAINT "timestamps_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
