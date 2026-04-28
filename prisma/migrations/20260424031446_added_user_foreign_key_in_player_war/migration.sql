-- DropIndex
DROP INDEX "War_roomId_key";

-- AddForeignKey
ALTER TABLE "PlayerWar" ADD CONSTRAINT "PlayerWar_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
