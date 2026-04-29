import { imagekit } from "../lib/imagekit.js";
import { prisma } from "../lib/prisma.js";

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: {
        id,
      },
    });

    res.json({ message: "user found successfully", data: user });
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};

export const getUserByEmail = async (req, res) => {
  try {
    const { email } = req.params;

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    res.json({ message: "user found successfully", data: user });
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await imagekit.upload({
      file: req.file.buffer.toString("base64"),
      fileName: `avatar_${id}`,
      folder: "/typewars/avatars",
    });

    const user = await prisma.user.update({
      where: { id },
      data: { photo: result.url },
    });

    res.json({ message: "User photo updated", data: user, success: true });
  } catch (error) {
    console.log("error", error);
    res
      .status(500)
      .json({ message: "Internal server error", error, success: false });
  }
};
