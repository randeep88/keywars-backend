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

export const updateImageUrl = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await imagekit.upload({
      file: req.file.buffer.toString("base64"),
      fileName: `avatar_${id}`,
      folder: "/typewars/avatars",
    });

    const user = await prisma.user.update({
      where: { id },
      data: { imageUrl: result.url },
    });

    res.json({ message: "User photo updated", data: user, success: true });
  } catch (error) {
    console.log("error", error);
    res
      .status(500)
      .json({ message: "Internal server error", error, success: false });
  }
};

export const syncUser = async (req, res) => {
  try {
    const {
      fullName,
      firstName,
      lastName,
      email,
      username,
      imageUrl,
      createdAt,
      updatedAt,
    } = req.body;

    const clerkId = req.auth?.userId;

    if (!clerkId) {
      return res.status(401).json({
        message: "Unauthorized",
        success: false,
      });
    }

    if (!email || !username) {
      return res.status(400).json({
        message: "Email and username required",
        success: false,
      });
    }

    const user = await prisma.user.upsert({
      where: { clerkId },
      update: {
        fullName,
        firstName,
        lastName,
        email,
        username,
        imageUrl,
        updatedAt,
      },
      create: {
        clerkId,
        fullName,
        firstName,
        lastName,
        email,
        username,
        imageUrl,
        createdAt,
        updatedAt,
      },
    });

    res.json({
      message: "User synced successfully",
      data: user,
      success: true,
    });
  } catch (error) {
    console.log("error", error);

    res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};
