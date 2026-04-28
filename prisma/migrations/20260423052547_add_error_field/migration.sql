/*
  Warnings:

  - You are about to drop the column `correctKeystrokes` on the `PlayerWar` table. All the data in the column will be lost.
  - You are about to drop the column `finished` on the `PlayerWar` table. All the data in the column will be lost.
  - You are about to drop the column `totalKeystrokes` on the `PlayerWar` table. All the data in the column will be lost.
  - Added the required column `accuracy` to the `PlayerWar` table without a default value. This is not possible if the table is not empty.
  - Added the required column `error` to the `PlayerWar` table without a default value. This is not possible if the table is not empty.
  - Added the required column `progress` to the `PlayerWar` table without a default value. This is not possible if the table is not empty.
  - Added the required column `roomId` to the `PlayerWar` table without a default value. This is not possible if the table is not empty.
  - Added the required column `wpm` to the `PlayerWar` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PlayerWar" DROP COLUMN "correctKeystrokes",
DROP COLUMN "finished",
DROP COLUMN "totalKeystrokes",
ADD COLUMN     "accuracy" INTEGER NOT NULL,
ADD COLUMN     "error" INTEGER NOT NULL,
ADD COLUMN     "progress" INTEGER NOT NULL,
ADD COLUMN     "roomId" TEXT NOT NULL,
ADD COLUMN     "wpm" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "photo" SET DEFAULT 'https://i.pinimg.com/736x/13/74/20/137420f5b9c39bc911e472f5d20f053e.jpg';
