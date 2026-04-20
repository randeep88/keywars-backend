-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "photo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "War" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "startedAt" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "passage" TEXT NOT NULL,

    CONSTRAINT "War_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerWar" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "warId" TEXT NOT NULL,
    "totalKeystrokes" INTEGER NOT NULL,
    "correctKeystrokes" INTEGER NOT NULL,
    "finished" BOOLEAN NOT NULL DEFAULT false,
    "finishedAt" TEXT NOT NULL,

    CONSTRAINT "PlayerWar_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "War_roomId_key" ON "War"("roomId");

-- AddForeignKey
ALTER TABLE "PlayerWar" ADD CONSTRAINT "PlayerWar_warId_fkey" FOREIGN KEY ("warId") REFERENCES "War"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
